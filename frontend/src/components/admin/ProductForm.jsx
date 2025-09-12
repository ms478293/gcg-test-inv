import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Upload, 
  X, 
  Eye, 
  Save, 
  Clock, 
  Plus,
  Trash2,
  DragDropContext,
  Draggable,
  Droppable,
  AlertCircle,
  Check
} from 'lucide-react';
import { productsAPI, adminAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';

const ProductForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    collection: '',
    type: 'Sunglasses',
    gender: 'Unisex',
    price: '',
    original_price: '',
    sku: '',
    frame_color: '',
    lens_color: '',
    materials: '',
    made_in: 'Italy',
    main_image: '',
    gallery_images: [],
    short_description: '',
    full_description: '',
    tags: [],
    status: 'active',
    is_featured: false,
    is_limited_edition: false,
    is_on_homepage: false,
    is_on_sale: false,
    is_in_catalog: true,
    scheduled_at: ''
  });

  const [errors, setErrors] = useState({});
  const [draggedImages, setDraggedImages] = useState([]);

  // Collections and options
  const collections = ['Signature', 'Heritage', 'Contemporary', 'New Arrivals', 'Limited Edition'];
  const frameColors = ['Black', 'Gold', 'Silver', 'Tortoiseshell', 'Clear', 'Blue Tortoise', 'Brown', 'Grey'];
  const lensColors = ['Clear', 'Brown Gradient', 'Grey Gradient', 'Blue Tint', 'Green Tint', 'Polarized', 'Photochromic'];

  useEffect(() => {
    if (isEdit && id) {
      loadProduct();
    }
  }, [isEdit, id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProduct(id);
      const product = response.data;
      
      setFormData({
        ...product,
        tags: product.tags || [],
        original_price: product.original_price || '',
        scheduled_at: product.scheduled_at ? new Date(product.scheduled_at).toISOString().slice(0, 16) : ''
      });
      
      setDraggedImages([product.main_image, ...product.gallery_images]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive"
      });
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleTagsChange = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleInputChange('tags', tags);
  };

  const handleImageUpload = async (files, isMainImage = false) => {
    try {
      setUploading(true);
      
      if (isMainImage && files.length > 0) {
        const response = await adminAPI.uploadImage(files[0]);
        const imageUrl = response.data.image_url;
        handleInputChange('main_image', imageUrl);
        
        // Add to dragged images if not already there
        if (!draggedImages.includes(imageUrl)) {
          setDraggedImages(prev => [imageUrl, ...prev]);
        }
      } else {
        // Gallery images
        const uploadPromises = Array.from(files).map(file => adminAPI.uploadImage(file));
        const responses = await Promise.all(uploadPromises);
        const imageUrls = responses.map(res => res.data.image_url);
        
        setDraggedImages(prev => [...prev, ...imageUrls]);
        handleInputChange('gallery_images', [...formData.gallery_images, ...imageUrls]);
      }
      
      toast({
        title: "Success",
        description: `${files.length} image(s) uploaded successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageReorder = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(draggedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setDraggedImages(items);
    
    // Update form data
    if (items.length > 0) {
      handleInputChange('main_image', items[0]);
      handleInputChange('gallery_images', items.slice(1));
    }
  };

  const removeImage = (index) => {
    const newImages = draggedImages.filter((_, i) => i !== index);
    setDraggedImages(newImages);
    
    if (newImages.length > 0) {
      handleInputChange('main_image', newImages[0]);
      handleInputChange('gallery_images', newImages.slice(1));
    } else {
      handleInputChange('main_image', '');
      handleInputChange('gallery_images', []);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.collection) newErrors.collection = 'Collection is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.frame_color) newErrors.frame_color = 'Frame color is required';
    if (!formData.lens_color) newErrors.lens_color = 'Lens color is required';
    if (!formData.materials.trim()) newErrors.materials = 'Materials are required';
    if (!formData.short_description.trim()) newErrors.short_description = 'Short description is required';
    if (!formData.main_image) newErrors.main_image = 'Main image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status = 'active') => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const productData = {
        ...formData,
        status: status,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        is_on_sale: formData.original_price ? true : false,
        scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null
      };

      if (isEdit) {
        await productsAPI.updateProduct(id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      } else {
        await productsAPI.createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully"
        });
      }
      
      navigate('/admin/products');
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 mt-2">
            Create a luxury eyewear product with premium details
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          
          <button
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </button>
          
          <button
            onClick={() => handleSave('scheduled')}
            disabled={loading || !formData.scheduled_at}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Clock className="w-4 h-4 mr-2" />
            Schedule
          </button>
          
          <button
            onClick={() => handleSave('active')}
            disabled={loading}
            className="flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Milano Aviator"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU/Style Code *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.sku ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., GCG-AV-001"
                />
                {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection *
                </label>
                <select
                  value={formData.collection}
                  onChange={(e) => handleInputChange('collection', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.collection ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Collection</option>
                  {collections.map(collection => (
                    <option key={collection} value={collection}>{collection}</option>
                  ))}
                </select>
                {errors.collection && <p className="text-red-500 text-sm mt-1">{errors.collection}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="Sunglasses">Sunglasses</option>
                  <option value="Eyeglasses">Eyeglasses</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Made In
                </label>
                <input
                  type="text"
                  value={formData.made_in}
                  onChange={(e) => handleInputChange('made_in', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Italy"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="850.00"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (€) - For Sale Items
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => handleInputChange('original_price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="1000.00"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Product Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Color *
                </label>
                <select
                  value={formData.frame_color}
                  onChange={(e) => handleInputChange('frame_color', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.frame_color ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Frame Color</option>
                  {frameColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                {errors.frame_color && <p className="text-red-500 text-sm mt-1">{errors.frame_color}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lens Color/Type *
                </label>
                <select
                  value={formData.lens_color}
                  onChange={(e) => handleInputChange('lens_color', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.lens_color ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Lens Color</option>
                  {lensColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                {errors.lens_color && <p className="text-red-500 text-sm mt-1">{errors.lens_color}</p>}
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials *
              </label>
              <textarea
                value={formData.materials}
                onChange={(e) => handleInputChange('materials', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.materials ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Italian Acetate, 18k Gold Plated hinges, Carl Zeiss lenses"
              />
              {errors.materials && <p className="text-red-500 text-sm mt-1">{errors.materials}</p>}
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description (2 lines max) *
              </label>
              <textarea
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                rows={2}
                maxLength={120}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.short_description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Timeless aviator design with modern luxury refinement"
              />
              {errors.short_description && <p className="text-red-500 text-sm mt-1">{errors.short_description}</p>}
              <p className="text-gray-500 text-sm mt-1">{formData.short_description.length}/120 characters</p>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                value={formData.full_description}
                onChange={(e) => handleInputChange('full_description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Detailed product description highlighting craftsmanship, heritage, and unique features..."
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="luxury, aviator, italian, handcrafted"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Product Images</h2>
            
            {/* Main Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Image * (minimum 2000px wide)
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                errors.main_image ? 'border-red-500' : 'border-gray-300'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files.length > 0 && handleImageUpload([e.target.files[0]], true)}
                  className="hidden"
                  id="main-image-upload"
                />
                <label htmlFor="main-image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload main product image</p>
                  <p className="text-gray-400 text-sm">JPEG, PNG, WebP (min. 2000px wide)</p>
                </label>
              </div>
              {errors.main_image && <p className="text-red-500 text-sm mt-1">{errors.main_image}</p>}
            </div>
            
            {/* Gallery Images */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Images (drag to reorder)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files.length > 0 && handleImageUpload(Array.from(e.target.files))}
                  className="hidden"
                  id="gallery-upload"
                />
                <label htmlFor="gallery-upload" className="cursor-pointer">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to add gallery images</p>
                  <p className="text-gray-400 text-sm">Multiple images allowed</p>
                </label>
              </div>
            </div>
            
            {/* Image Preview with Drag & Drop */}
            {draggedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {draggedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                        Main
                      </div>
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Settings & Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_limited_edition}
                    onChange={(e) => handleInputChange('is_limited_edition', e.target.checked)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="ml-2 text-sm text-gray-700">Limited Edition</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_on_homepage}
                    onChange={(e) => handleInputChange('is_on_homepage', e.target.checked)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show on Homepage</span>
                </label>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                
                {formData.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Launch
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>
              
              {/* Product Card Preview */}
              <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {formData.main_image ? (
                  <img
                    src={formData.main_image}
                    alt={formData.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      {formData.collection || 'Collection'}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {formData.name || 'Product Name'}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {formData.short_description || 'Short description will appear here'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-medium text-gray-900">
                        €{formData.price || '0'}
                      </span>
                      {formData.original_price && (
                        <span className="text-sm text-gray-400 line-through">
                          €{formData.original_price}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      {formData.is_featured && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          Featured
                        </span>
                      )}
                      {formData.is_limited_edition && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          Limited
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                    <p><span className="font-medium">Frame:</span> {formData.frame_color || 'Not specified'}</p>
                    <p><span className="font-medium">Lens:</span> {formData.lens_color || 'Not specified'}</p>
                    <p><span className="font-medium">SKU:</span> {formData.sku || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    formData.status === 'active' ? 'bg-green-100 text-green-800' :
                    formData.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.status || 'draft'}
                  </span>
                </div>
                
                {formData.scheduled_at && formData.status === 'scheduled' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Scheduled: {new Date(formData.scheduled_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;