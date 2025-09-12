from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid

class GenderEnum(str, Enum):
    MEN = "Men"
    WOMEN = "Women"
    UNISEX = "Unisex"

class ProductTypeEnum(str, Enum):
    SUNGLASSES = "Sunglasses"
    EYEGLASSES = "Eyeglasses"

class StatusEnum(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SCHEDULED = "scheduled"

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    collection: str
    price: float
    original_price: Optional[float] = None
    sku: str
    gender: GenderEnum
    type: ProductTypeEnum
    frame_color: str
    lens_color: str
    materials: str
    made_in: str = "Italy"
    is_limited_edition: bool = False
    is_featured: bool = False
    is_on_sale: bool = False
    status: StatusEnum = StatusEnum.ACTIVE
    main_image: str
    gallery_images: List[str] = []
    short_description: str
    full_description: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    scheduled_at: Optional[datetime] = None

class ProductCreate(BaseModel):
    name: str
    collection: str
    price: float
    original_price: Optional[float] = None
    sku: str
    gender: GenderEnum
    type: ProductTypeEnum
    frame_color: str
    lens_color: str
    materials: str
    made_in: str = "Italy"
    is_limited_edition: bool = False
    is_featured: bool = False
    main_image: str
    gallery_images: List[str] = []
    short_description: str
    full_description: Optional[str] = None
    tags: List[str] = []
    scheduled_at: Optional[datetime] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    collection: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    sku: Optional[str] = None
    gender: Optional[GenderEnum] = None
    type: Optional[ProductTypeEnum] = None
    frame_color: Optional[str] = None
    lens_color: Optional[str] = None
    materials: Optional[str] = None
    made_in: Optional[str] = None
    is_limited_edition: Optional[bool] = None
    is_featured: Optional[bool] = None
    status: Optional[StatusEnum] = None
    main_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    tags: Optional[List[str]] = None
    scheduled_at: Optional[datetime] = None

class ProductFilter(BaseModel):
    collection: Optional[str] = None
    gender: Optional[GenderEnum] = None
    type: Optional[ProductTypeEnum] = None
    is_featured: Optional[bool] = None
    is_on_sale: Optional[bool] = None
    status: Optional[StatusEnum] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    search: Optional[str] = None