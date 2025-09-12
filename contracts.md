# GCG Eyewear - Full Stack Implementation Contracts

## API Contracts

### Product Management Endpoints

#### 1. Products CRUD
- `GET /api/products` - Get all products with filters (collection, gender, type, featured, etc.)
- `GET /api/products/:id` - Get single product by ID
- `POST /api/products` - Create new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

#### 2. Collections Management
- `GET /api/collections` - Get all collections
- `GET /api/collections/:slug` - Get products by collection slug
- `POST /api/collections` - Create collection (Admin only)

#### 3. Admin Dashboard
- `GET /api/admin/products` - Get all products with admin details
- `POST /api/admin/products/bulk` - Bulk upload products via CSV
- `PUT /api/admin/products/:id/status` - Update product status (active/inactive/scheduled)

#### 4. Image Upload
- `POST /api/upload/image` - Upload product images
- `DELETE /api/upload/image/:filename` - Delete uploaded image

#### 5. Search & Filters
- `GET /api/search?q=term&filters={}` - Search products with filters

## Mock Data to Replace

### Current Mock Data in `/frontend/src/data/mock.js`:
1. **featuredProducts** - Replace with API call to `/api/products?featured=true`
2. **collections** - Replace with API call to `/api/collections`
3. **heroContent** - Can remain static or move to CMS
4. **aboutContent** - Can remain static or move to CMS
5. **navigationItems** - Can remain static

## Backend Implementation Plan

### 1. Database Schema (MongoDB)

#### Products Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  collection: String (required),
  price: Number (required),
  originalPrice: Number (optional),
  sku: String (required, unique),
  gender: String (enum: ['Men', 'Women', 'Unisex'], required),
  type: String (enum: ['Sunglasses', 'Eyeglasses'], required),
  frameColor: String (required),
  lensColor: String (required),
  materials: String (required),
  madeIn: String (default: 'Italy'),
  isLimitedEdition: Boolean (default: false),
  isFeatured: Boolean (default: false),
  status: String (enum: ['active', 'inactive', 'scheduled'], default: 'active'),
  mainImage: String (required),
  galleryImages: [String],
  shortDescription: String (required),
  fullDescription: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date,
  scheduledAt: Date (optional)
}
```

#### Collections Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  slug: String (required, unique),
  description: String,
  image: String,
  isActive: Boolean (default: true),
  sortOrder: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

#### Admin Users Collection (for future authentication)
```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  email: String (required, unique),
  passwordHash: String (required),
  role: String (enum: ['admin', 'editor'], default: 'editor'),
  createdAt: Date,
  lastLogin: Date
}
```

### 2. Business Logic Implementation

#### Product Management
- Image upload handling with validation (size, format)
- Product status management (active/inactive/scheduled)
- Search functionality with filters
- Bulk product import from CSV
- Inventory status tracking

#### Collection Management
- Auto-categorization based on product tags
- Dynamic collection page generation
- Featured products selection

### 3. Admin Dashboard Features
- Drag-and-drop image upload
- Live product preview
- Bulk operations (status updates, collection assignments)
- CSV import/export functionality
- Product analytics (views, popularity)

## Frontend & Backend Integration Plan

### Phase 1: API Integration
1. Replace mock data imports with API service functions
2. Create API service layer (`/frontend/src/services/api.js`)
3. Update components to use actual data
4. Add loading states and error handling

### Phase 2: Admin Dashboard
1. Create admin routes (`/admin/*`)
2. Build product upload/edit forms
3. Implement image upload with preview
4. Add bulk operations interface

### Phase 3: Enhanced Features
1. Product search and filtering
2. Collection management interface
3. Analytics dashboard
4. SEO optimization for product pages

## Error Handling Strategy
- Standardized API error responses
- Frontend error boundaries
- User-friendly error messages
- Loading states for all async operations
- Image upload fallback handling

## Security Considerations
- Input validation on all endpoints
- File upload security (type, size limits)
- Rate limiting for API endpoints
- Admin authentication middleware
- CORS configuration

## Performance Optimizations
- Image optimization and lazy loading
- API response caching
- Database indexing for search
- Pagination for large product lists
- CDN integration for static assets

This contract ensures seamless integration between the luxury frontend design and a robust backend system suitable for a high-end eyewear e-commerce platform.