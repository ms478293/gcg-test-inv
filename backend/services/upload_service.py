import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException
from typing import List
from pathlib import Path

class UploadService:
    def __init__(self):
        self.upload_dir = Path("/app/backend/uploads")
        self.upload_dir.mkdir(exist_ok=True)
        
        # Create subdirectories
        (self.upload_dir / "products").mkdir(exist_ok=True)
        (self.upload_dir / "collections").mkdir(exist_ok=True)
        
        # Allowed file types
        self.allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        self.max_file_size = 10 * 1024 * 1024  # 10MB

    def validate_image(self, file: UploadFile) -> bool:
        # Check file extension
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in self.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(self.allowed_extensions)}"
            )
        
        # Check file size (this is approximate, actual size checked during upload)
        if hasattr(file, 'size') and file.size > self.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {self.max_file_size / 1024 / 1024}MB"
            )
        
        return True

    async def upload_image(self, file: UploadFile, category: str = "products") -> str:
        self.validate_image(file)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Full file path
        file_path = self.upload_dir / category / unique_filename
        
        try:
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Return relative URL
            return f"/uploads/{category}/{unique_filename}"
        
        except Exception as e:
            # Clean up if upload failed
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    async def upload_multiple_images(self, files: List[UploadFile], category: str = "products") -> List[str]:
        uploaded_urls = []
        
        try:
            for file in files:
                url = await self.upload_image(file, category)
                uploaded_urls.append(url)
            
            return uploaded_urls
        
        except Exception as e:
            # Clean up any uploaded files if batch upload fails
            for url in uploaded_urls:
                self.delete_image(url)
            raise e

    def delete_image(self, image_url: str) -> bool:
        try:
            # Extract filename from URL
            if image_url.startswith("/uploads/"):
                relative_path = image_url[1:]  # Remove leading slash
                file_path = Path("/app/backend") / relative_path
                
                if file_path.exists():
                    file_path.unlink()
                    return True
            
            return False
        
        except Exception:
            return False

    def get_image_info(self, image_url: str) -> dict:
        try:
            if image_url.startswith("/uploads/"):
                relative_path = image_url[1:]
                file_path = Path("/app/backend") / relative_path
                
                if file_path.exists():
                    stat = file_path.stat()
                    return {
                        "url": image_url,
                        "filename": file_path.name,
                        "size": stat.st_size,
                        "created_at": stat.st_ctime
                    }
            
            return None
        
        except Exception:
            return None