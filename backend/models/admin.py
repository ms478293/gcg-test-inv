from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

class AdminRoleEnum(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"

class Admin(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    password_hash: str
    role: AdminRoleEnum = AdminRoleEnum.EDITOR
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: AdminRoleEnum = AdminRoleEnum.EDITOR

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_info: dict