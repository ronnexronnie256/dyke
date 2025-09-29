import React, { useState } from 'react';
import { Calendar, MapPin, Phone, User, Clock } from 'lucide-react';
import { neonDb } from '../../../lib/neon';

interface SiteVisitsTabProps {
  siteVisits: any[];
}

const SiteVisitsTab: React.FC<SiteVisitsTabProps> = ({ siteVisits }) => {
  const [updating, setUpdating] = useState<string | null>(null);
  
  const handleStatusUpdate = async (visitId: string, newStatus: string) => {
    try {
      setUpdating(visitId);
      await neonDb.updateSiteVisitStatus(visitId, newStatus);
      alert(`Site visit status updated to ${newStatus}!`);
      window.location.reload(); // Refresh to see changes
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {siteVisits.map((visit: any) => (
              <tr key={visit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{visit.visitor_name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {visit.visitor_phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{visit.property_title || 'N/A'}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {visit.location_district}, {visit.location_town}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {new Date(visit.preferred_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    {visit.preferred_time}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    visit.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    visit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    visit.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {visit.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={visit.status}
                    onChange={(e) => handleStatusUpdate(visit.id, e.target.value)}
                    disabled={updating === visit.id}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SiteVisitsTab;
