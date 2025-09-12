from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.product import Product, ProductCreate, ProductUpdate, ProductFilter
from datetime import datetime
import re

class ProductService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.products

    async def create_product(self, product_data: ProductCreate) -> Product:
        # Check if SKU already exists
        existing = await self.collection.find_one({"sku": product_data.sku})
        if existing:
            raise ValueError(f"Product with SKU {product_data.sku} already exists")
        
        # Set sale status based on original_price
        product_dict = product_data.dict()
        product_dict["is_on_sale"] = product_data.original_price is not None
        
        product = Product(**product_dict)
        await self.collection.insert_one(product.dict())
        return product

    async def get_product(self, product_id: str) -> Optional[Product]:
        product_data = await self.collection.find_one({"id": product_id})
        return Product(**product_data) if product_data else None

    async def get_products(self, 
                          filters: Optional[ProductFilter] = None,
                          skip: int = 0,
                          limit: int = 50,
                          sort_by: str = "created_at",
                          sort_order: int = -1) -> List[Product]:
        
        query = {}
        
        if filters:
            if filters.collection:
                query["collection"] = filters.collection
            if filters.gender:
                query["gender"] = filters.gender
            if filters.type:
                query["type"] = filters.type
            if filters.is_featured is not None:
                query["is_featured"] = filters.is_featured
            if filters.is_on_sale is not None:
                query["is_on_sale"] = filters.is_on_sale
            if filters.status:
                query["status"] = filters.status
            if filters.price_min is not None or filters.price_max is not None:
                price_query = {}
                if filters.price_min is not None:
                    price_query["$gte"] = filters.price_min
                if filters.price_max is not None:
                    price_query["$lte"] = filters.price_max
                query["price"] = price_query
            if filters.search:
                search_pattern = re.compile(filters.search, re.IGNORECASE)
                query["$or"] = [
                    {"name": search_pattern},
                    {"short_description": search_pattern},
                    {"tags": {"$in": [search_pattern]}}
                ]
        
        cursor = self.collection.find(query).sort(sort_by, sort_order).skip(skip).limit(limit)
        products = await cursor.to_list(length=None)
        return [Product(**product) for product in products]

    async def update_product(self, product_id: str, update_data: ProductUpdate) -> Optional[Product]:
        update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
        
        if not update_dict:
            return await self.get_product(product_id)
        
        # Update the updated_at field
        update_dict["updated_at"] = datetime.utcnow()
        
        # Update sale status if original_price is being updated
        if "original_price" in update_dict:
            update_dict["is_on_sale"] = update_dict["original_price"] is not None
        
        result = await self.collection.update_one(
            {"id": product_id},
            {"$set": update_dict}
        )
        
        if result.modified_count:
            return await self.get_product(product_id)
        return None

    async def delete_product(self, product_id: str) -> bool:
        result = await self.collection.delete_one({"id": product_id})
        return result.deleted_count > 0

    async def get_featured_products(self, limit: int = 8) -> List[Product]:
        filters = ProductFilter(is_featured=True, status="active")
        return await self.get_products(filters=filters, limit=limit)

    async def get_products_by_collection(self, collection_name: str, limit: int = 50) -> List[Product]:
        filters = ProductFilter(collection=collection_name, status="active")
        return await self.get_products(filters=filters, limit=limit)

    async def search_products(self, search_term: str, limit: int = 50) -> List[Product]:
        filters = ProductFilter(search=search_term, status="active")
        return await self.get_products(filters=filters, limit=limit)

    async def bulk_update_status(self, product_ids: List[str], status: str) -> int:
        result = await self.collection.update_many(
            {"id": {"$in": product_ids}},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count

    async def get_product_stats(self) -> dict:
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_products": {"$sum": 1},
                    "active_products": {
                        "$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}
                    },
                    "featured_products": {
                        "$sum": {"$cond": ["$is_featured", 1, 0]}
                    },
                    "on_sale_products": {
                        "$sum": {"$cond": ["$is_on_sale", 1, 0]}
                    }
                }
            }
        ]
        
        result = await self.collection.aggregate(pipeline).to_list(length=1)
        return result[0] if result else {
            "total_products": 0,
            "active_products": 0,
            "featured_products": 0,
            "on_sale_products": 0
        }