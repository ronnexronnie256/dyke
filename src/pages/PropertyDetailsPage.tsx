import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, 
  Home, 
  Droplets, 
  Zap, 
  Wifi, 
  Calendar, 
  Phone, 
  Mail, 
  ArrowLeft,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProperty(id);
    }
  }, [id]);

  const fetchProperty = async (propertyId: string) => {
    try {
      setLoading(true);
      // Get property with images
      const result = await neonDb.getPropertyWithImages(propertyId);
      if (result) {
        setProperty(result as Property);
      } else {
        setError('Property not found');
      }
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'house':
      case 'villa':
        return <Home className="h-6 w-6" />;
      default:
        return <Home className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <Link
            to="/properties"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{property.title} | Dyke Investments - Uganda Real Estate</title>
        <meta name="description" content={`${property.title} - ${property.property_type} for sale in ${property.location_district}, ${property.location_town}. Price: UGX ${formatPrice(property.asking_price)}. ${property.description ? property.description.substring(0, 160) + '...' : 'Contact Dyke Investments for more details.'}`} />
        <meta name="keywords" content={`${property.property_type}, ${property.location_district}, ${property.location_town}, Uganda real estate, property for sale, Dyke Investments`} />
        <meta property="og:title" content={`${property.title} | Dyke Investments`} />
        <meta property="og:description" content={`${property.title} - ${property.property_type} for sale in ${property.location_district}, ${property.location_town}. Price: UGX ${formatPrice(property.asking_price)}`} />
        <meta property="og:url" content={`https://dykeinvestments.com/properties/${property.id}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={property.property_images && property.property_images.length > 0 ? property.property_images[0].image_url : '/images/og-image.jpg'} />
        <meta name="twitter:title" content={`${property.title} | Dyke Investments`} />
        <meta name="twitter:description" content={`${property.title} - ${property.property_type} for sale in ${property.location_district}, ${property.location_town}`} />
        <meta name="twitter:image" content={property.property_images && property.property_images.length > 0 ? property.property_images[0].image_url : '/images/og-image.jpg'} />
        <link rel="canonical" href={`https://dykeinvestments.com/properties/${property.id}`} />
      </Helmet>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/properties"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {property.property_images && property.property_images.length > 0 ? (
                <div className="relative">
                  {/* Main Image with Navigation */}
                  <div className="relative h-96">
                    <img
                      src={property.property_images[currentImageIndex].image_url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Navigation Arrows */}
                    {property.property_images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((prev) =>
                            prev === 0 ? property.property_images!.length - 1 : prev - 1
                          )}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((prev) =>
                            prev === property.property_images!.length - 1 ? 0 : prev + 1
                          )}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}

                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-700 capitalize">
                      {property.property_type}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {property.property_images.length}
                    </div>
                  </div>

                  {/* Image Thumbnails */}
                  {property.property_images.length > 1 && (
                    <div className="p-4">
                      <div className="grid grid-cols-6 gap-2">
                        {property.property_images.map((image, index) => (
                          <div
                            key={index}
                            className={`relative h-16 rounded-lg overflow-hidden cursor-pointer transition-all ${
                              index === currentImageIndex
                                ? 'ring-2 ring-orange-500 ring-offset-2'
                                : 'hover:opacity-80'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img
                              src={image.image_url}
                              alt={`${property.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-96 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <div className="text-white text-center">
                    {getPropertyTypeIcon(property.property_type)}
                    <p className="mt-4 text-lg font-medium">No Images Available</p>
                    <p className="text-sm opacity-90">Property images will be displayed here</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-700 capitalize">
                    {property.property_type}
                  </div>
                </div>
              )}
            </div>

            {/* Property Information */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="text-lg">
                    {property.location_district}, {property.location_town}
                    {property.location_village && `, ${property.location_village}`}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-6 w-6 mr-2 text-emerald-500" />
                  <span className="text-3xl font-bold text-emerald-600">
                    UGX {formatPrice(property.asking_price)}
                  </span>
                </div>
              </div>

              {/* Property Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Size */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Maximize className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="font-semibold">
                    {property.size_acres && `${property.size_acres} acres`}
                    {property.size_acres && property.size_sqft && ' • '}
                    {property.size_sqft && `${formatPrice(property.size_sqft)} sq ft`}
                    {!property.size_acres && !property.size_sqft && 'Not specified'}
                  </p>
                </div>

                {/* Bedrooms */}
                {property.bedrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bed className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="font-semibold">{property.bedrooms}</p>
                  </div>
                )}

                {/* Bathrooms */}
                {property.bathrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bath className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                )}

                {/* Property Type */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Home className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold capitalize">{property.property_type}</p>
                </div>
              </div>

              {/* Utilities */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Utilities</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`flex items-center p-4 rounded-lg ${property.has_water ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                    <Droplets className="h-6 w-6 mr-3" />
                    <div>
                      <p className="font-medium">Water</p>
                      <p className="text-sm">{property.has_water ? 'Available' : 'Not Available'}</p>
                    </div>
                    {property.has_water && <CheckCircle className="h-5 w-5 ml-auto" />}
                  </div>

                  <div className={`flex items-center p-4 rounded-lg ${property.has_power ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-400'}`}>
                    <Zap className="h-6 w-6 mr-3" />
                    <div>
                      <p className="font-medium">Electricity</p>
                      <p className="text-sm">{property.has_power ? 'Available' : 'Not Available'}</p>
                    </div>
                    {property.has_power && <CheckCircle className="h-5 w-5 ml-auto" />}
                  </div>

                  <div className={`flex items-center p-4 rounded-lg ${property.has_internet ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                    <Wifi className="h-6 w-6 mr-3" />
                    <div>
                      <p className="font-medium">Internet</p>
                      <p className="text-sm">{property.has_internet ? 'Available' : 'Not Available'}</p>
                    </div>
                    {property.has_internet && <CheckCircle className="h-5 w-5 ml-auto" />}
                  </div>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {property.distance_from_main_road && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Distance from Main Road</h4>
                    <p className="text-gray-600">{property.distance_from_main_road}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Listed Date</h4>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{new Date(property.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Broker</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Dyke Investments</p>
                    <p className="text-sm text-gray-500">Real Estate Broker</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">+256 700 123 456</p>
                    <p className="text-sm text-gray-500">Phone Number</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">info@dykeinvestments.com</p>
                    <p className="text-sm text-gray-500">Email Address</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <a
                  href="tel:+256700123456"
                  className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors block"
                >
                  Call Us
                </a>
                
                <a
                  href="https://wa.me/256700123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors block"
                >
                  WhatsApp
                </a>

                <Link
                  to={`/book-visit?property=${property.id}`}
                  className="w-full bg-orange-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Site Visit
                </Link>
              </div>
            </div>

            {/* Property Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Property ID:</span>
                  <span className="font-medium">{property.id.slice(0, 8)}...</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium capitalize text-green-600">{property.status}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium capitalize">{property.property_type}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-bold text-emerald-600">UGX {formatPrice(property.asking_price)}</span>
                </div>
              </div>
            </div>

            {/* Share Property */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Property</h3>
              <p className="text-gray-600 text-sm mb-4">Share this property with friends and family</p>
              
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: property.title,
                      text: `Check out this property: ${property.title}`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Property link copied to clipboard!');
                  }
                }}
                className="w-full bg-gray-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Share Property
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;