from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import routes
from routes.products import router as products_router
from routes.collections import router as collections_router
from routes.admin import router as admin_router

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(
    title="GCG Eyewear API",
    description="Luxury eyewear e-commerce platform API",
    version="1.0.0"
)

# Create a router with the /api prefix for basic endpoints
api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "GCG Eyewear API - Luxury crafted for visionaries"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "GCG Eyewear API",
        "version": "1.0.0"
    }

# Include all routers
app.include_router(api_router)
app.include_router(products_router)
app.include_router(collections_router)
app.include_router(admin_router)

# Static files for uploads
uploads_dir = Path("/app/backend/uploads")
uploads_dir.mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory="/app/backend/uploads"), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db_client():
    """Initialize database collections and indexes"""
    try:
        # Create indexes for better performance
        await db.products.create_index("sku", unique=True)
        await db.products.create_index("status")
        await db.products.create_index("is_featured")
        await db.products.create_index("collection")
        await db.products.create_index("created_at")
        
        await db.collections.create_index("slug", unique=True)
        await db.collections.create_index("is_active")
        
        await db.admin_users.create_index("username", unique=True)
        await db.admin_users.create_index("email", unique=True)
        
        logger.info("Database indexes created successfully")
        
        # Create default admin user if none exists
        from services.auth_service import AuthService
        from models.admin import AdminCreate, AdminRoleEnum
        
        auth_service = AuthService(db)
        
        # Check if any admin exists
        existing_admin = await db.admin_users.find_one({"role": "admin"})
        
        if not existing_admin:
            default_admin = AdminCreate(
                username="admin",
                email="admin@gcgeyewear.com",
                password="admin123",  # Change this in production
                role=AdminRoleEnum.ADMIN
            )
            
            await auth_service.create_admin(default_admin)
            logger.info("Default admin user created: username=admin, password=admin123")
        
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("Database connection closed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)