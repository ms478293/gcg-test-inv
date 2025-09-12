from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from models.product import Product, ProductCreate, ProductUpdate, ProductFilter
from services.product_service import ProductService
from services.auth_service import AuthService
from dependencies import get_product_service, get_auth_service, get_current_admin
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("/", response_model=List[Product])
async def get_products(
    collection: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    is_featured: Optional[bool] = Query(None),
    is_on_sale: Optional[bool] = Query(None),
    status: Optional[str] = Query("active"),
    price_min: Optional[float] = Query(None),
    price_max: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: int = Query(-1, ge=-1, le=1),
    product_service: ProductService = Depends(get_product_service)
):
    """Get products with optional filtering and pagination"""
    try:
        filters = ProductFilter(
            collection=collection,
            gender=gender,
            type=type,
            is_featured=is_featured,
            is_on_sale=is_on_sale,
            status=status,
            price_min=price_min,
            price_max=price_max,
            search=search
        )
        
        products = await product_service.get_products(
            filters=filters,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return products
    
    except Exception as e:
        logger.error(f"Error getting products: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/featured", response_model=List[Product])
async def get_featured_products(
    limit: int = Query(8, ge=1, le=20),
    product_service: ProductService = Depends(get_product_service)
):
    """Get featured products"""
    try:
        products = await product_service.get_featured_products(limit=limit)
        return products
    
    except Exception as e:
        logger.error(f"Error getting featured products: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/search", response_model=List[Product])
async def search_products(
    q: str = Query(..., min_length=1),
    limit: int = Query(50, ge=1, le=100),
    product_service: ProductService = Depends(get_product_service)
):
    """Search products by name, description, or tags"""
    try:
        products = await product_service.search_products(q, limit=limit)
        return products
    
    except Exception as e:
        logger.error(f"Error searching products: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{product_id}", response_model=Product)
async def get_product(
    product_id: str,
    product_service: ProductService = Depends(get_product_service)
):
    """Get a single product by ID"""
    try:
        product = await product_service.get_product(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    product_service: ProductService = Depends(get_product_service),
    current_admin = Depends(get_current_admin)
):
    """Create a new product (Admin only)"""
    try:
        product = await product_service.create_product(product_data)
        logger.info(f"Product created: {product.id} by admin {current_admin.username}")
        return product
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating product: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    product_service: ProductService = Depends(get_product_service),
    current_admin = Depends(get_current_admin)
):
    """Update a product (Admin only)"""
    try:
        product = await product_service.update_product(product_id, update_data)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        logger.info(f"Product updated: {product_id} by admin {current_admin.username}")
        return product
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    product_service: ProductService = Depends(get_product_service),
    current_admin = Depends(get_current_admin)
):
    """Delete a product (Admin only)"""
    try:
        success = await product_service.delete_product(product_id)
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        
        logger.info(f"Product deleted: {product_id} by admin {current_admin.username}")
        return {"message": "Product deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/collection/{collection_name}", response_model=List[Product])
async def get_products_by_collection(
    collection_name: str,
    limit: int = Query(50, ge=1, le=100),
    product_service: ProductService = Depends(get_product_service)
):
    """Get products by collection name"""
    try:
        products = await product_service.get_products_by_collection(collection_name, limit=limit)
        return products
    
    except Exception as e:
        logger.error(f"Error getting products for collection {collection_name}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")