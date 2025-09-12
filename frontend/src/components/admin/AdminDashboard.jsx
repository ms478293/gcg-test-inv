import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Eye, 
  ShoppingBag, 
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { adminAPI, productsAPI } from '../../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, productsResponse] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getAdminProducts({ limit: 5 })
        ]);
        
        setStats(statsResponse.data);
        setRecentProducts(productsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      name: 'Total Products',
      value: stats?.total_products || 0,
      change: '+12%',
      changeType: 'increase',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Products',
      value: stats?.active_products || 0,
      change: '+4.5%',
      changeType: 'increase',
      icon: Eye,
      color: 'bg-green-500'
    },
    {
      name: 'Featured Products',
      value: stats?.featured_products || 0,
      change: '+2.1%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      name: 'On Sale',
      value: stats?.on_sale_products || 0,
      change: '-1.2%',
      changeType: 'decrease',
      icon: ShoppingBag,
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to GCG Eyewear Admin</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                {stat.changeType === 'increase' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
            <Link
              to="/admin/products"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={product.main_image}
                        alt={product.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.collection}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : product.status === 'inactive'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/products/new"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-full text-white mr-4">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add Product</h3>
              <p className="text-sm text-gray-600">Create a new eyewear product</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/collections/new"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-full text-white mr-4">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">New Collection</h3>
              <p className="text-sm text-gray-600">Create a product collection</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/upload"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 rounded-full text-white mr-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upload Images</h3>
              <p className="text-sm text-gray-600">Manage product images</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;