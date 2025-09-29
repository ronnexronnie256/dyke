import React from 'react';
import { Users, Phone, Mail } from 'lucide-react';

interface BuyerRequestsTabProps {
  buyerRequests: any[];
}

const BuyerRequestsTab: React.FC<BuyerRequestsTabProps> = ({ buyerRequests }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {buyerRequests.map((request: any) => (
          <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{request.contact_name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{request.property_type}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                request.urgency === 'high' ? 'bg-red-100 text-red-700' :
                request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {request.urgency} urgency
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Budget Range:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(request.budget_min)} - {formatCurrency(request.budget_max)}
                </span>
              </div>
              <div className="flex items-start justify-between text-sm">
                <span className="text-gray-500">Districts:</span>
                <span className="font-medium text-gray-900 text-right">
                  {request.preferred_districts.join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Timeline:</span>
                <span className="font-medium text-gray-900">{request.timeline}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                <a 
                  href={`tel:${request.contact_phone}`}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Phone className="h-4 w-4" />
                  <span>{request.contact_phone}</span>
                </a>
                {request.contact_email && (
                  <a 
                    href={`mailto:${request.contact_email}`}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{request.contact_email}</span>
                  </a>
                )}
                <a 
                  href={`https://wa.me/${request.contact_phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-700"
                >
                  <Phone className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <button 
                onClick={() => alert(`Matching properties for ${request.contact_name}...\n\nBudget: ${formatCurrency(request.budget_min)} - ${formatCurrency(request.budget_max)}\nDistricts: ${request.preferred_districts.join(', ')}\nType: ${request.property_type}`)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Match Properties
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerRequestsTab;
