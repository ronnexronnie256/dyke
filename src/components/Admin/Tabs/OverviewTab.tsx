import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, DollarSign, TrendingUp, Mail, BarChart3 } from 'lucide-react';

interface OverviewTabProps {
  stats: any;
  properties: any[];
  buyerRequests: any[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats, properties, buyerRequests }) => {
  const navigate = useNavigate();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          change="+12%"
          icon={Home}
          color="blue"
          subtitle={`${stats.pendingProperties} pending approval`}
        />
        <StatCard
          title="Buyer Requests"
          value={stats.totalBuyerRequests}
          change="+8%"
          icon={Users}
          color="green"
          subtitle={`${stats.activeBuyerRequests} active`}
        />
        <StatCard
          title="Site Visits"
          value={stats.totalSiteVisits}
          change="+15%"
          icon={Calendar}
          color="purple"
          subtitle={`${stats.pendingSiteVisits} pending`}
        />
        <StatCard
          title="Avg. Property Price"
          value={formatCurrency(stats.averagePrice)}
          change="+5%"
          icon={DollarSign}
          color="orange"
          subtitle="Last 30 days"
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
            <Home className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {properties.slice(0, 5).map((property) => (
              <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{property.title}</p>
                  <p className="text-xs text-gray-500">{property.location_district}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900">{formatCurrency(property.asking_price)}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    property.status === 'approved' ? 'bg-green-100 text-green-700' :
                    property.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Buyer Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Buyer Requests</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {buyerRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{request.contact_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{request.property_type} · {request.preferred_districts.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">{formatCurrency(request.budget_min)} - {formatCurrency(request.budget_max)}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    request.urgency === 'high' ? 'bg-red-100 text-red-700' :
                    request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {request.urgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => navigate('/submit-property')} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
            <Home className="h-6 w-6 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Add Property</p>
          </button>
          <button onClick={() => alert('User management coming soon!')} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
            <Users className="h-6 w-6 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-green-600">Add User</p>
          </button>
          <button onClick={() => window.location.href = 'mailto:info@dykeinvestments.com'} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group">
            <Mail className="h-6 w-6 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600">Send Email</p>
          </button>
          <button onClick={() => alert('Analytics reports coming soon!')} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group">
            <BarChart3 className="h-6 w-6 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-orange-600">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<any> = ({ title, value, change, icon: Icon, color, subtitle }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-sm font-medium text-green-600 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
          {change}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
      <p className="text-sm text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </div>
  );
};

export default OverviewTab;
