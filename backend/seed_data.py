#!/usr/bin/env python3
"""
Seed script to populate the database with sample luxury eyewear products
"""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from models.product import Product, GenderEnum, ProductTypeEnum, StatusEnum
from models.collection import Collection
from models.admin import Admin, AdminRoleEnum
from services.auth_service import AuthService
from datetime import datetime

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Sample products data
sample_products = [
    {
        "name": "Milano Aviator",
        "collection": "Signature",
        "price": 850.0,
        "sku": "GCG-AV-001",
        "gender": GenderEnum.UNISEX,
        "type": ProductTypeEnum.SUNGLASSES,
        "frame_color": "Gold",
        "lens_color": "Brown Gradient",
        "materials": "Italian Acetate, 18k Gold Plated",
        "made_in": "Italy",
        "is_featured": True,
        "main_image": "https://images.unsplash.com/photo-1589642380614-4a8c2147b857?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzdW5nbGFzc2VzfGVufDB8fHx8MTc1NzY1ODcyM3ww&ixlib=rb-4.1.0&q=85",
        "gallery_images": [
            "https://images.unsplash.com/photo-1639762485055-1565f145bf2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBzdW5nbGFzc2VzfGVufDB8fHx8MTc1NzY1ODcyM3ww&ixlib=rb-4.1.0&q=85"
        ],
        "short_description": "Timeless aviator design with modern luxury refinement",
        "full_description": "The Milano Aviator represents the pinnacle of luxury eyewear craftsmanship. Handcrafted in Italy using premium acetate and 18k gold plated details, these sunglasses offer both style and superior UV protection.",
        "tags": ["aviator", "gold", "luxury", "italian"],
        "status": StatusEnum.ACTIVE
    },
    {
        "name": "Roma Classic",
        "collection": "Heritage",
        "price": 920.0,
        "sku": "GCG-RC-002",
        "gender": GenderEnum.MEN,
        "type": ProductTypeEnum.EYEGLASSES,
        "frame_color": "Tortoiseshell",
        "lens_color": "Clear",
        "materials": "Italian Acetate, Titanium Temples",
        "made_in": "Italy",
        "is_featured": True,
        "main_image": "https://images.unsplash.com/photo-1591843336300-89d113fcacd8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGV5ZWdsYXNzZXN8ZW58MHx8fHwxNzU3NjU4NzI4fDA&ixlib=rb-4.1.0&q=85",
        "gallery_images": [
            "https://images.unsplash.com/photo-1648861709330-fe5b3610029c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxkZXNpZ25lciUyMGV5ZWdsYXNzZXN8ZW58MHx8fHwxNzU3NjU4NzI4fDA&ixlib=rb-4.1.0&q=85"
        ],
        "short_description": "Sophisticated round frames for the modern gentleman",
        "full_description": "Inspired by classic Italian design, the Roma Classic features premium tortoiseshell acetate with lightweight titanium temples for all-day comfort and timeless style.",
        "tags": ["classic", "tortoiseshell", "men", "titanium"],
        "status": StatusEnum.ACTIVE
    },
    {
        "name": "Venetian Square",
        "collection": "Contemporary",
        "price": 780.0,
        "original_price": 950.0,
        "sku": "GCG-VS-003",
        "gender": GenderEnum.WOMEN,
        "type": ProductTypeEnum.SUNGLASSES,
        "frame_color": "Black",
        "lens_color": "Gradient Grey",
        "materials": "Premium Acetate, Stainless Steel",
        "made_in": "Italy",
        "is_limited_edition": True,
        "is_featured": True,
        "main_image": "https://images.unsplash.com/photo-1588769168184-657a0d0e3b00?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBzdW5nbGFzc2VzfGVufDB8fHx8MTc1NzY1ODcyM3ww&ixlib=rb-4.1.0&q=85",
        "gallery_images": [
            "https://images.pexels.com/photos/33852637/pexels-photo-33852637.jpeg"
        ],
        "short_description": "Bold square silhouette with contemporary elegance",
        "full_description": "Limited edition contemporary design featuring bold square frames crafted from premium acetate with gradient grey lenses for sophisticated sun protection.",
        "tags": ["contemporary", "square", "women", "limited"],
        "status": StatusEnum.ACTIVE
    },
    {
        "name": "Florence Vintage",
        "collection": "Heritage",
        "price": 1250.0,
        "sku": "GCG-FV-004",
        "gender": GenderEnum.UNISEX,
        "type": ProductTypeEnum.EYEGLASSES,
        "frame_color": "Blue Tortoise",
        "lens_color": "Clear",
        "materials": "Hand-polished Acetate, 24k Gold Details",
        "made_in": "Italy",
        "is_featured": True,
        "main_image": "https://images.unsplash.com/photo-1752486268262-6ce6b339a8de?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxkZXNpZ25lciUyMGV5ZWdsYXNzZXN8ZW58MHx8fHwxNzU3NjU4NzI4fDA&ixlib=rb-4.1.0&q=85",
        "gallery_images": [
            "https://images.pexels.com/photos/33854427/pexels-photo-33854427.jpeg"
        ],
        "short_description": "Vintage-inspired frames with modern craftsmanship",
        "full_description": "The Florence Vintage combines timeless design with contemporary craftsmanship, featuring hand-polished acetate and 24k gold details for the discerning connoisseur.",
        "tags": ["vintage", "heritage", "gold", "craftsmanship"],
        "status": StatusEnum.ACTIVE
    }
]

# Sample collections data
sample_collections = [
    {
        "name": "New Arrivals",
        "slug": "new-arrivals",
        "description": "The latest in luxury eyewear",
        "image": "https://images.unsplash.com/photo-1589642380614-4a8c2147b857?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzdW5nbGFzc2VzfGVufDB8fHx8MTc1NzY1ODcyM3ww&ixlib=rb-4.1.0&q=85",
        "is_active": True,
        "sort_order": 1
    },
    {
        "name": "Sunglasses",
        "slug": "sunglasses",
        "description": "Premium sun protection with luxury styling",
        "image": "https://images.unsplash.com/photo-1639762485055-1565f145bf2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBzdW5nbGFzc2VzfGVufDB8fHx8MTc1NzY1ODcyM3ww&ixlib=rb-4.1.0&q=85",
        "is_active": True,
        "sort_order": 2
    },
    {
        "name": "Eyeglasses",
        "slug": "eyeglasses",
        "description": "Sophisticated vision clarity and style",
        "image": "https://images.unsplash.com/photo-1591843336300-89d113fcacd8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGV5ZWdsYXNzZXN8ZW58MHx8fHwxNzU3NjU4NzI4fDA&ixlib=rb-4.1.0&q=85",
        "is_active": True,
        "sort_order": 3
    },
    {
        "name": "Heritage",
        "slug": "heritage",
        "description": "Timeless designs with Italian craftsmanship",
        "image": "https://images.unsplash.com/photo-1752486268262-6ce6b339a8de?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxkZXNpZ25lciUyMGV5ZWdsYXNzZXN8ZW58MHx8fHwxNzU3NjU4NzI4fDA&ixlib=rb-4.1.0&q=85",
        "is_active": True,
        "sort_order": 4
    }
]

async def seed_database():
    """Seed the database with sample data"""
    try:
        # Connect to database
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'test_database')
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        print("Connected to database...")
        
        # Clear existing data
        await db.products.delete_many({})
        await db.collections.delete_many({})
        
        print("Cleared existing data...")
        
        # Insert collections
        for collection_data in sample_collections:
            collection = Collection(**collection_data)
            await db.collections.insert_one(collection.dict())
            print(f"Created collection: {collection.name}")
        
        # Insert products
        for product_data in sample_products:
            product = Product(**product_data)
            await db.products.insert_one(product.dict())
            print(f"Created product: {product.name}")
        
        # Create admin user if it doesn't exist
        auth_service = AuthService(db)
        existing_admin = await db.admin_users.find_one({"username": "admin"})
        
        if not existing_admin:
            from models.admin import AdminCreate
            admin_data = AdminCreate(
                username="admin",
                email="admin@gcgeyewear.com",
                password="admin123",
                role=AdminRoleEnum.ADMIN
            )
            await auth_service.create_admin(admin_data)
            print("Created admin user: admin / admin123")
        else:
            print("Admin user already exists")
        
        print(f"\n✅ Database seeded successfully!")
        print(f"📊 Collections: {len(sample_collections)}")
        print(f"👓 Products: {len(sample_products)}")
        print(f"👤 Admin Login: admin / admin123")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error seeding database: {str(e)}")

if __name__ == "__main__":
    asyncio.run(seed_database())