from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.collection import Collection, CollectionCreate, CollectionUpdate
from datetime import datetime

class CollectionService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.collections

    async def create_collection(self, collection_data: CollectionCreate) -> Collection:
        # Check if slug already exists
        existing = await self.collection.find_one({"slug": collection_data.slug})
        if existing:
            raise ValueError(f"Collection with slug {collection_data.slug} already exists")
        
        collection = Collection(**collection_data.dict())
        await self.collection.insert_one(collection.dict())
        return collection

    async def get_collection(self, collection_id: str) -> Optional[Collection]:
        collection_data = await self.collection.find_one({"id": collection_id})
        return Collection(**collection_data) if collection_data else None

    async def get_collection_by_slug(self, slug: str) -> Optional[Collection]:
        collection_data = await self.collection.find_one({"slug": slug})
        return Collection(**collection_data) if collection_data else None

    async def get_collections(self, 
                             is_active: Optional[bool] = None,
                             skip: int = 0,
                             limit: int = 50) -> List[Collection]:
        
        query = {}
        if is_active is not None:
            query["is_active"] = is_active
        
        cursor = self.collection.find(query).sort("sort_order", 1).skip(skip).limit(limit)
        collections = await cursor.to_list(length=None)
        return [Collection(**collection) for collection in collections]

    async def update_collection(self, collection_id: str, update_data: CollectionUpdate) -> Optional[Collection]:
        update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
        
        if not update_dict:
            return await self.get_collection(collection_id)
        
        # Update the updated_at field
        update_dict["updated_at"] = datetime.utcnow()
        
        result = await self.collection.update_one(
            {"id": collection_id},
            {"$set": update_dict}
        )
        
        if result.modified_count:
            return await self.get_collection(collection_id)
        return None

    async def delete_collection(self, collection_id: str) -> bool:
        result = await self.collection.delete_one({"id": collection_id})
        return result.deleted_count > 0

    async def get_active_collections(self) -> List[Collection]:
        return await self.get_collections(is_active=True)