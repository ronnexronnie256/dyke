import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { neonDb } from '../../lib/neon';
import OverviewTab from './Tabs/OverviewTab';
import PropertiesTab from './Tabs/PropertiesTab';
import BuyerRequestsTab from './Tabs/BuyerRequestsTab';
import SiteVisitsTab from './Tabs/SiteVisitsTab';
import UserManagementTab from './Tabs/UserManagementTab';
import SettingsTab from './Tabs/SettingsTab';
import { 
  LayoutDashboard,
  Home, 
  Users, 
  Calendar, 
  Settings,
  Activity,
  Bell,
  LogOut,
  Menu,
  X,
  UserPlus
} from 'lucide-react';

type TabType = 'overview' | 'properties' | 'buyers' | 'visits' | 'users' | 'settings';

const ModernAdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingProperties: 0,
    approvedProperties: 0,
    soldProperties: 0,
    totalBuyerRequests: 0,
    activeBuyerRequests: 0,
    totalSiteVisits: 0,
    pendingSiteVisits: 0,
    averagePrice: 0,
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<any[]>([]);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [propertiesData, buyerRequestsData, siteVisitsData, propertyStats, buyerStats] = await Promise.all([
        neonDb.getAllProperties(),
        neonDb.getAllBuyerRequests(),
        neonDb.getAllSiteVisits(),
        neonDb.getPropertyStats(),
        neonDb.getBuyerRequestStats()
      ]);

      setProperties(propertiesData);
      setBuyerRequests(buyerRequestsData);
      setSiteVisits(siteVisitsData);

      setStats({
        totalProperties: propertyStats.total_properties || 0,
        pendingProperties: propertyStats.pending_properties || 0,
        approvedProperties: propertyStats.approved_properties || 0,
        soldProperties: propertyStats.sold_properties || 0,
        totalBuyerRequests: buyerStats.total_requests || 0,
        activeBuyerRequests: buyerStats.active_requests || 0,
        totalSiteVisits: siteVisitsData.length,
        pendingSiteVisits: siteVisitsData.filter((v: any) => v.status === 'pending').length,
        averagePrice: parseInt(propertyStats.average_price) || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async (propertyId: string) => {
    try {
      await neonDb.updatePropertyStatus(propertyId, 'approved', profile?.id);
      fetchAllData();
    } catch (error) {
      console.error('Error approving property:', error);
    }
  };

  const handleRejectProperty = async (propertyId: string) => {
    try {
      await neonDb.updatePropertyStatus(propertyId, 'withdrawn');
      fetchAllData();
    } catch (error) {
      console.error('Error rejecting property:', error);
    }
  };

  const navItems = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'properties' as TabType, label: 'Properties', icon: Home },
    { id: 'buyers' as TabType, label: 'Buyer Requests', icon: Users },
    { id: 'visits' as TabType, label: 'Site Visits', icon: Calendar },
    { id: 'users' as TabType, label: 'User Management', icon: UserPlus },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold">Dyke Investments</h1>
                <p className="text-xs text-blue-300">Admin Portal</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-blue-600 shadow-lg'
                  : 'hover:bg-blue-700/50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-700">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">{profile?.full_name?.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{profile?.full_name}</p>
                  <p className="text-xs text-blue-300 capitalize">{profile?.role}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signOut()}
              className="w-full p-2 hover:bg-blue-700 rounded-lg transition-colors flex justify-center"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navItems.find(item => item.id === activeTab)?.label}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Welcome back, {profile?.full_name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button 
                  onClick={fetchAllData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Activity className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab stats={stats} properties={properties} buyerRequests={buyerRequests} />}
              {activeTab === 'properties' && <PropertiesTab properties={properties} onApprove={handleApproveProperty} onReject={handleRejectProperty} />}
              {activeTab === 'buyers' && <BuyerRequestsTab buyerRequests={buyerRequests} />}
              {activeTab === 'visits' && <SiteVisitsTab siteVisits={siteVisits} />}
              {activeTab === 'users' && <UserManagementTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ModernAdminDashboard;
