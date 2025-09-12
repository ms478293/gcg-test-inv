from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from models.collection import Collection, CollectionCreate, CollectionUpdate
from services.collection_service import CollectionService
from dependencies import get_collection_service, get_current_admin
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/collections", tags=["collections"])

@router.get("/", response_model=List[Collection])
async def get_collections(
    is_active: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    collection_service: CollectionService = Depends(get_collection_service)
):
    """Get all collections with optional filtering"""
    try:
        collections = await collection_service.get_collections(
            is_active=is_active,
            skip=skip,
            limit=limit
        )
        return collections
    
    except Exception as e:
        logger.error(f"Error getting collections: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/active", response_model=List[Collection])
async def get_active_collections(
    collection_service: CollectionService = Depends(get_collection_service)
):
    """Get only active collections"""
    try:
        collections = await collection_service.get_active_collections()
        return collections
    
    except Exception as e:
        logger.error(f"Error getting active collections: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{collection_id}", response_model=Collection)
async def get_collection(
    collection_id: str,
    collection_service: CollectionService = Depends(get_collection_service)
):
    """Get a single collection by ID"""
    try:
        collection = await collection_service.get_collection(collection_id)
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        return collection
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting collection {collection_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/slug/{slug}", response_model=Collection)
async def get_collection_by_slug(
    slug: str,
    collection_service: CollectionService = Depends(get_collection_service)
):
    """Get a collection by slug"""
    try:
        collection = await collection_service.get_collection_by_slug(slug)
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        return collection
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting collection by slug {slug}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/", response_model=Collection)
async def create_collection(
    collection_data: CollectionCreate,
    collection_service: CollectionService = Depends(get_collection_service),
    current_admin = Depends(get_current_admin)
):
    """Create a new collection (Admin only)"""
    try:
        collection = await collection_service.create_collection(collection_data)
        logger.info(f"Collection created: {collection.id} by admin {current_admin.username}")
        return collection
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating collection: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{collection_id}", response_model=Collection)
async def update_collection(
    collection_id: str,
    update_data: CollectionUpdate,
    collection_service: CollectionService = Depends(get_collection_service),
    current_admin = Depends(get_current_admin)
):
    """Update a collection (Admin only)"""
    try:
        collection = await collection_service.update_collection(collection_id, update_data)
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        logger.info(f"Collection updated: {collection_id} by admin {current_admin.username}")
        return collection
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating collection {collection_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: str,
    collection_service: CollectionService = Depends(get_collection_service),
    current_admin = Depends(get_current_admin)
):
    """Delete a collection (Admin only)"""
    try:
        success = await collection_service.delete_collection(collection_id)
        if not success:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        logger.info(f"Collection deleted: {collection_id} by admin {current_admin.username}")
        return {"message": "Collection deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting collection {collection_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")