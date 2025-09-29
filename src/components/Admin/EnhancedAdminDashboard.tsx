import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { neonDb } from '../../lib/neon';
import { 
  Home, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  TrendingUp,
  Clock,
  DollarSign,
  Mail,
  Send,
  MessageSquare,
  Phone,
  MapPin,
  AlertCircle,
  Search,
  Download,
  FileText,
  Droplets,
  Zap,
  Wifi
} from 'lucide-react';

interface BuyerRequest {
  id: string;
  property_type: string;
  budget_min: number;
  budget_max: number;
  preferred_districts: string[];
  preferred_towns?: string;
  requires_water: boolean;
  requires_power: boolean;
  requires_internet: boolean;
  min_bedrooms?: number;
  min_bathrooms?: number;
  min_size_acres?: number;
  min_size_sqft?: number;
  additional_requirements?: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  urgency: string;
  preferred_contact_method: string;
  timeline: string;
  status: string;
  created_at: string;
}

interface Property {
  id: string;
  title: string;
  property_type: string;
  location_district: string;
  location_town: string;
  asking_price: number;
  status: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string;
  created_at: string;
}

const EnhancedAdminDashboard = () => {
  const { profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState({
    totalBuyerRequests: 0,
    activeBuyerRequests: 0,
    matchedRequests: 0,
    fulfilledRequests: 0,
    totalProperties: 0,
    pendingProperties: 0,
    approvedProperties: 0,
    recentRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<BuyerRequest | null>(null);
  const [emailModal, setEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      fetchStats();
    }
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'requests') {
        await fetchBuyerRequests();
      }
      if (activeTab === 'overview' || activeTab === 'properties') {
        await fetchProperties();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [buyerStats, propertyStats] = await Promise.all([
        neonDb.getBuyerRequestStats(),
        neonDb.getPropertyStats()
      ]);

      setStats({
        totalBuyerRequests: buyerStats.total_requests || 0,
        activeBuyerRequests: buyerStats.active_requests || 0,
        matchedRequests: buyerStats.matched_requests || 0,
        fulfilledRequests: buyerStats.fulfilled_requests || 0,
        totalProperties: propertyStats.total_properties || 0,
        pendingProperties: propertyStats.pending_properties || 0,
        approvedProperties: propertyStats.approved_properties || 0,
        recentRequests: buyerStats.recent_requests || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBuyerRequests = async () => {
    try {
      const requests = await neonDb.getAllBuyerRequests();
      setBuyerRequests(requests);
    } catch (error) {
      console.error('Error fetching buyer requests:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const props = await neonDb.getAllProperties();
      setProperties(props);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      await neonDb.updateBuyerRequestStatus(requestId, newStatus);
      await fetchBuyerRequests();
      await fetchStats();
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const sendEmail = async () => {
    try {
      console.log('Sending email:', emailData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Email sent successfully!');
      setEmailModal(false);
      setEmailData({ to: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  const openEmailModal = (request: BuyerRequest) => {
    setEmailData({
      to: request.contact_email || request.contact_phone,
      subject: `Property Match Found - ${request.property_type} in ${request.preferred_districts.join(', ')}`,
      message: `Dear ${request.contact_name},\n\nWe have found some properties that match your requirements:\n\nProperty Type: ${request.property_type}\nBudget: UGX ${new Intl.NumberFormat().format(request.budget_min)} - UGX ${new Intl.NumberFormat().format(request.budget_max)}\nLocation: ${request.preferred_districts.join(', ')}\n\nWe will contact you shortly to schedule viewings.\n\nBest regards,\nDyke Investments Team`
    });
    setEmailModal(true);
  };

  const exportBuyerRequests = () => {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Property Type', 'Budget Min', 'Budget Max', 'Districts', 'Timeline', 'Urgency', 'Status', 'Created'],
      ...buyerRequests.map(req => [
        req.contact_name,
        req.contact_phone,
        req.contact_email || '',
        req.property_type,
        req.budget_min,
        req.budget_max,
        req.preferred_districts.join('; '),
        req.timeline,
        req.urgency,
        req.status,
        new Date(req.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buyer-requests.csv';
    a.click();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'matched': return 'bg-blue-100 text-blue-800';
      case 'fulfilled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'withdrawn': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile?.full_name}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="h-4 w-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Buyer Requests
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'properties'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Home className="h-4 w-4 inline mr-2" />
                Properties
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Search className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Buyer Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBuyerRequests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeBuyerRequests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.recentRequests}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Buyer Requests */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Buyer Requests</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {buyerRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.contact_name}</p>
                          <p className="text-xs text-gray-500">{request.property_type} in {request.preferred_districts.join(', ')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Properties */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {properties.slice(0, 5).map((property) => (
                      <div key={property.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{property.title}</p>
                          <p className="text-xs text-gray-500">{property.location_district}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                          {property.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buyer Requests Tab */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Buyer Requests Management</h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Requests</option>
                    <option value="active">Active</option>
                    <option value="matched">Matched</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={exportBuyerRequests}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={fetchBuyerRequests}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requirements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {buyerRequests
                    .filter(req => filter === 'all' || req.status === filter)
                    .map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.contact_name}</div>
                          <div className="text-sm text-gray-500">{request.contact_phone}</div>
                          {request.contact_email && (
                            <div className="text-sm text-gray-500">{request.contact_email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">{request.property_type}</div>
                          <div className="text-sm text-gray-500">{request.preferred_districts.join(', ')}</div>
                          <div className="text-sm text-gray-500">{request.timeline}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          UGX {formatPrice(request.budget_min)} - {formatPrice(request.budget_max)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEmailModal(request)}
                          className="text-green-600 hover:text-green-900"
                          title="Send Email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <select
                          value={request.status}
                          onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="active">Active</option>
                          <option value="matched">Matched</option>
                          <option value="fulfilled">Fulfilled</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {emailModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Send Email</h3>
                  <button
                    onClick={() => setEmailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                    <input
                      type="text"
                      value={emailData.to}
                      onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                    <input
                      type="text"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
                    <textarea
                      rows={6}
                      value={emailData.message}
                      onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setEmailModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendEmail}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Buyer Request Details</h3>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><span className="font-medium">Name:</span> {selectedRequest.contact_name}</p>
                        <p><span className="font-medium">Phone:</span> {selectedRequest.contact_phone}</p>
                        {selectedRequest.contact_email && (
                          <p><span className="font-medium">Email:</span> {selectedRequest.contact_email}</p>
                        )}
                        <p><span className="font-medium">Preferred Contact:</span> {selectedRequest.preferred_contact_method}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><span className="font-medium">Property Type:</span> {selectedRequest.property_type}</p>
                        <p><span className="font-medium">Budget:</span> UGX {formatPrice(selectedRequest.budget_min)} - {formatPrice(selectedRequest.budget_max)}</p>
                        <p><span className="font-medium">Districts:</span> {selectedRequest.preferred_districts.join(', ')}</p>
                        {selectedRequest.preferred_towns && (
                          <p><span className="font-medium">Towns:</span> {selectedRequest.preferred_towns}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Features Required</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center">
                            <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                            <span className={selectedRequest.requires_water ? 'text-green-600' : 'text-gray-400'}>
                              Water {selectedRequest.requires_water ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                            <span className={selectedRequest.requires_power ? 'text-green-600' : 'text-gray-400'}>
                              Power {selectedRequest.requires_power ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Wifi className="h-4 w-4 mr-2 text-purple-500" />
                            <span className={selectedRequest.requires_internet ? 'text-green-600' : 'text-gray-400'}>
                              Internet {selectedRequest.requires_internet ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                        
                        {(selectedRequest.min_bedrooms || selectedRequest.min_bathrooms || selectedRequest.min_size_acres || selectedRequest.min_size_sqft) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h5 className="font-medium text-gray-700 mb-2">Size Requirements</h5>
                            {selectedRequest.min_bedrooms && <p>Min Bedrooms: {selectedRequest.min_bedrooms}</p>}
                            {selectedRequest.min_bathrooms && <p>Min Bathrooms: {selectedRequest.min_bathrooms}</p>}
                            {selectedRequest.min_size_acres && <p>Min Size: {selectedRequest.min_size_acres} acres</p>}
                            {selectedRequest.min_size_sqft && <p>Min Size: {selectedRequest.min_size_sqft} sq ft</p>}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Timeline & Priority</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><span className="font-medium">Timeline:</span> {selectedRequest.timeline}</p>
                        <p><span className="font-medium">Urgency:</span> 
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(selectedRequest.urgency)}`}>
                            {selectedRequest.urgency}
                          </span>
                        </p>
                        <p><span className="font-medium">Status:</span> 
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                            {selectedRequest.status}
                          </span>
                        </p>
                        <p><span className="font-medium">Created:</span> {new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedRequest.additional_requirements && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Additional Requirements</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>{selectedRequest.additional_requirements}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => openEmailModal(selectedRequest)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Send Email</span>
                  </button>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;