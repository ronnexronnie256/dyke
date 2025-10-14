import React from 'react';
import { Property } from '../../lib/neon';
import { MapPin, Home, Droplet, Zap, Wifi, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'house':
      case 'villa':
        return <Home className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden">
        {property.property_images && property.property_images.length > 0 ? (
          <img
            src={property.property_images[0].image_url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
            <div className="text-white text-center">
              {getPropertyTypeIcon(property.property_type)}
              <p className="mt-2 text-sm opacity-90">No Image</p>
            </div>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-xs font-semibold text-gray-700 capitalize">
          {property.property_type}
        </div>
        {property.property_images && property.property_images.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
            {property.property_images.length} photos
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Title and Price */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
            {property.title}
          </h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">
            UGX {formatPrice(property.asking_price)}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2 text-orange-500" />
          <span className="text-sm">
            {property.location_district}, {property.location_town}
            {property.location_village && `, ${property.location_village}`}
          </span>
        </div>

        {/* Property Details */}
        <div className="space-y-3 mb-6">
          {/* Size */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Size:</span>
            <span className="font-medium">
              {property.size_acres && `${property.size_acres} acres`}
              {property.size_acres && property.size_sqft && ' • '}
              {property.size_sqft && `${formatPrice(property.size_sqft)} sq ft`}
              {!property.size_acres && !property.size_sqft && 'Not specified'}
            </span>
          </div>

          {/* Bedrooms/Bathrooms for houses */}
          {(property.property_type === 'house' || property.property_type === 'villa' || property.property_type === 'apartment') && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Rooms:</span>
              <span className="font-medium">
                {property.bedrooms ? `${property.bedrooms} bed` : ''}
                {property.bedrooms && property.bathrooms && ' • '}
                {property.bathrooms ? `${property.bathrooms} bath` : ''}
                {!property.bedrooms && !property.bathrooms && 'Not specified'}
              </span>
            </div>
          )}

          {/* Utilities */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Utilities:</span>
            <div className="flex space-x-3">
              <div className={`flex items-center ${property.has_water ? 'text-blue-500' : 'text-gray-300'}`}>
                <Droplet className="h-4 w-4" />
              </div>
              <div className={`flex items-center ${property.has_power ? 'text-yellow-500' : 'text-gray-300'}`}>
                <Zap className="h-4 w-4" />
              </div>
              <div className={`flex items-center ${property.has_internet ? 'text-green-500' : 'text-gray-300'}`}>
                <Wifi className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <Link
            to={`/properties/${property.id}`}
            className="flex-1 bg-orange-500 text-white text-center py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            View Details
          </Link>
          <Link
            to={`/book-visit?property=${property.id}`}
            className="flex items-center justify-center px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Visit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;