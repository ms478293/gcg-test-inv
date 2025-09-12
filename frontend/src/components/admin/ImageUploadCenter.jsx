import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  Image, 
  FileImage, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  Download
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';

const ImageUploadCenter = () => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not an image file`,
          variant: "destructive"
        });
      }
      
      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
      }
      
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const fileId = `${Date.now()}-${index}`;
        
        // Add to progress tracking
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { name: file.name, progress: 0, status: 'uploading' }
        }));

        try {
          const response = await adminAPI.uploadImage(file, 'products');
          
          // Update progress
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: { name: file.name, progress: 100, status: 'completed' }
          }));

          return {
            id: fileId,
            name: file.name,
            url: response.data.image_url,
            size: file.size,
            uploadedAt: new Date().toISOString()
          };
        } catch (error) {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: { name: file.name, progress: 0, status: 'error' }
          }));
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failed = results.filter(result => result.status === 'rejected').length;

      setUploadedImages(prev => [...successful, ...prev]);
      
      if (successful.length > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successful.length} image(s)${failed > 0 ? `, ${failed} failed` : ''}`
        });
      }

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({});
      }, 2000);

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Some images failed to upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Image URL copied to clipboard"
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Image Upload Center</h1>
        <p className="text-gray-600 mt-2">
          Upload and manage product images. Supported formats: JPEG, PNG, WebP (max 10MB each)
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-black bg-gray-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg text-gray-700 mb-2">
                {dragActive ? 'Drop images here' : 'Drag & drop images here'}
              </p>
              <p className="text-gray-500">
                or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-black hover:underline font-medium"
                >
                  browse files
                </button>
              </p>
            </div>
            
            <div className="text-sm text-gray-400 space-y-1">
              <p>• JPEG, PNG, WebP formats supported</p>
              <p>• Maximum file size: 10MB per image</p>
              <p>• Recommended resolution: 2000px+ wide for product images</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Progress</h3>
          <div className="space-y-3">
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <div key={id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {progress.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : progress.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {progress.name}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        progress.status === 'completed' ? 'bg-green-500' : 
                        progress.status === 'error' ? 'bg-red-500' : 'bg-black'
                      }`}
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 capitalize">
                  {progress.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Recently Uploaded ({uploadedImages.length})
            </h3>
            <button
              onClick={() => setUploadedImages([])}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="border rounded-lg overflow-hidden group">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(image.url)}
                        className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
                        title="Copy URL"
                      >
                        <FileImage className="w-4 h-4" />
                      </button>
                      <a
                        href={image.url}
                        download={image.name}
                        className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="p-3">
                  <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                    {image.name}
                  </h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Size: {formatFileSize(image.size)}</p>
                    <p>Uploaded: {new Date(image.uploadedAt).toLocaleString()}</p>
                  </div>
                  
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600 truncate">
                    {image.url}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">
          <Image className="w-5 h-5 inline mr-2" />
          Image Optimization Tips
        </h3>
        <div className="text-blue-800 space-y-2 text-sm">
          <p>• <strong>Main Product Images:</strong> Use high-resolution images (2000px+ wide) for best quality</p>
          <p>• <strong>Gallery Images:</strong> Ensure consistent lighting and backgrounds</p>
          <p>• <strong>File Formats:</strong> WebP provides best compression, JPEG for compatibility</p>
          <p>• <strong>File Names:</strong> Use descriptive names like "milano-aviator-gold-front.jpg"</p>
          <p>• <strong>Multiple Angles:</strong> Upload front, side, and detail shots for each product</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadCenter;