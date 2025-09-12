from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.admin import Admin, AdminCreate, AdminLogin, AdminToken
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.admin_users

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    async def create_admin(self, admin_data: AdminCreate) -> Admin:
        # Check if username or email already exists
        existing_user = await self.collection.find_one({
            "$or": [
                {"username": admin_data.username},
                {"email": admin_data.email}
            ]
        })
        
        if existing_user:
            raise ValueError("Username or email already exists")
        
        # Hash the password
        hashed_password = self.get_password_hash(admin_data.password)
        
        admin = Admin(
            username=admin_data.username,
            email=admin_data.email,
            password_hash=hashed_password,
            role=admin_data.role
        )
        
        await self.collection.insert_one(admin.dict())
        return admin

    async def authenticate_admin(self, username: str, password: str) -> Optional[Admin]:
        admin_data = await self.collection.find_one({"username": username, "is_active": True})
        if not admin_data:
            return None
        
        admin = Admin(**admin_data)
        if not self.verify_password(password, admin.password_hash):
            return None
        
        # Update last login
        await self.collection.update_one(
            {"id": admin.id},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        return admin

    async def get_admin_by_id(self, admin_id: str) -> Optional[Admin]:
        admin_data = await self.collection.find_one({"id": admin_id, "is_active": True})
        return Admin(**admin_data) if admin_data else None

    async def login(self, login_data: AdminLogin) -> AdminToken:
        admin = await self.authenticate_admin(login_data.username, login_data.password)
        if not admin:
            raise ValueError("Invalid credentials")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = self.create_access_token(
            data={"sub": admin.id}, expires_delta=access_token_expires
        )
        
        return AdminToken(
            access_token=access_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # seconds
            user_info={
                "id": admin.id,
                "username": admin.username,
                "email": admin.email,
                "role": admin.role
            }
        )

    async def verify_token(self, token: str) -> Optional[Admin]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            admin_id: str = payload.get("sub")
            if admin_id is None:
                return None
        except JWTError:
            return None
        
        admin = await self.get_admin_by_id(admin_id)
        return admin