from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from typing import List
from models.admin import AdminCreate, AdminLogin, AdminToken, Admin
from models.product import Product
from services.auth_service import AuthService
from services.product_service import ProductService
from services.upload_service import UploadService
from dependencies import get_auth_service, get_product_service, get_upload_service, get_current_admin
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/register", response_model=Admin)
async def register_admin(
    admin_data: AdminCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Register a new admin user"""
    try:
        admin = await auth_service.create_admin(admin_data)
        logger.info(f"New admin registered: {admin.username}")
        return admin
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error registering admin: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/login", response_model=AdminToken)
async def login_admin(
    login_data: AdminLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Admin login"""
    try:
        token = await auth_service.login(login_data)
        logger.info(f"Admin logged in: {login_data.username}")
        return token
    
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        logger.error(f"Error during admin login: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/me", response_model=Admin)
async def get_current_admin_info(
    current_admin: Admin = Depends(get_current_admin)
):
    """Get current admin user info"""
    return current_admin

@router.get("/products", response_model=List[Product])
async def get_admin_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    current_admin: Admin = Depends(get_current_admin),
    product_service: ProductService = Depends(get_product_service)
):
    """Get all products for admin (including inactive)"""
    try:
        # Admin can see all products regardless of status
        products = await product_service.get_products(
            filters=None,  # No filters for admin
            skip=skip,
            limit=limit,
            sort_by="updated_at",
            sort_order=-1
        )
        return products
    
    except Exception as e:
        logger.error(f"Error getting admin products: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/products/{product_id}/status")
async def update_product_status(
    product_id: str,
    status: str,
    current_admin: Admin = Depends(get_current_admin),
    product_service: ProductService = Depends(get_product_service)
):
    """Update product status"""
    try:
        from models.product import ProductUpdate, StatusEnum
        
        # Validate status
        if status not in [s.value for s in StatusEnum]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        update_data = ProductUpdate(status=status)
        product = await product_service.update_product(product_id, update_data)
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        logger.info(f"Product status updated: {product_id} to {status} by {current_admin.username}")
        return {"message": "Product status updated successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/products/bulk/status")
async def bulk_update_product_status(
    product_ids: List[str],
    status: str,
    current_admin: Admin = Depends(get_current_admin),
    product_service: ProductService = Depends(get_product_service)
):
    """Bulk update product status"""
    try:
        from models.product import StatusEnum
        
        # Validate status
        if status not in [s.value for s in StatusEnum]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        updated_count = await product_service.bulk_update_status(product_ids, status)
        
        logger.info(f"Bulk status update: {updated_count} products to {status} by {current_admin.username}")
        return {
            "message": f"Updated {updated_count} products successfully",
            "updated_count": updated_count
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error bulk updating product status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/stats")
async def get_admin_stats(
    current_admin: Admin = Depends(get_current_admin),
    product_service: ProductService = Depends(get_product_service)
):
    """Get admin dashboard statistics"""
    try:
        stats = await product_service.get_product_stats()
        return stats
    
    except Exception as e:
        logger.error(f"Error getting admin stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    category: str = Query("products"),
    current_admin: Admin = Depends(get_current_admin),
    upload_service: UploadService = Depends(get_upload_service)
):
    """Upload an image"""
    try:
        image_url = await upload_service.upload_image(file, category)
        logger.info(f"Image uploaded: {image_url} by {current_admin.username}")
        return {"image_url": image_url}
    
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        raise HTTPException(status_code=500, detail="Upload failed")

@router.post("/upload/multiple")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    category: str = Query("products"),
    current_admin: Admin = Depends(get_current_admin),
    upload_service: UploadService = Depends(get_upload_service)
):
    """Upload multiple images"""
    try:
        image_urls = await upload_service.upload_multiple_images(files, category)
        logger.info(f"Multiple images uploaded: {len(image_urls)} files by {current_admin.username}")
        return {"image_urls": image_urls}
    
    except Exception as e:
        logger.error(f"Error uploading multiple images: {str(e)}")
        raise HTTPException(status_code=500, detail="Upload failed")