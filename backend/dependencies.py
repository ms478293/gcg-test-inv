from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from services.product_service import ProductService
from services.collection_service import CollectionService
from services.auth_service import AuthService
from services.upload_service import UploadService
from models.admin import Admin
import os

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer()

def get_database() -> AsyncIOMotorDatabase:
    return db

def get_product_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> ProductService:
    return ProductService(db)

def get_collection_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> CollectionService:
    return CollectionService(db)

def get_auth_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> AuthService:
    return AuthService(db)

def get_upload_service() -> UploadService:
    return UploadService()

async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> Admin:
    """Dependency to get current authenticated admin"""
    try:
        token = credentials.credentials
        admin = await auth_service.verify_token(token)
        
        if admin is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return admin
    
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )