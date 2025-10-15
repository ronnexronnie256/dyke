import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Home, Calendar } from 'lucide-react';
import { neonDb } from '../lib/neon';

// Local fallback images from public directory
const FALLBACK_IMAGES = [
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/10.jpg',
  '/images/22.jpg'
];

const HomePage = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [backgroundImages, setBackgroundImages] = React.useState<string[]>(FALLBACK_IMAGES);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  // Set the background images to use only local images
  React.useEffect(() => {
    setBackgroundImages(FALLBACK_IMAGES);
    setIsLoading(false);
  }, []);

  // Auto-cycle through background images
  React.useEffect(() => {
    if (backgroundImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const features = [
    {
      icon: Search,
      title: 'Find Properties',
      description: 'Browse through hundreds of verified properties across Uganda',
      link: '/properties',
      color: 'bg-blue-500',
    },
    {
      icon: Home,
      title: 'List Your Property',
      description: 'Sell your property with our professional marketing support',
      link: '/sell-property',
      color: 'bg-orange-500',
    },
    {
      icon: Calendar,
      title: 'Book Site Visits',
      description: 'Schedule convenient property viewings with our team',
      link: '/book-visit',
      color: 'bg-orange-600',
    },
  ];

  const stats = [
    { number: '500+', label: 'Properties Listed' },
    { number: '1,200+', label: 'Happy Clients' },
    { number: '50+', label: 'Areas Covered' },
    { number: '5', label: 'Years Experience' },
  ];

  const testimonials = [
    {
      name: 'Sarah Nakamya',
      location: 'Kampala',
      text: 'Dyke Investments helped me find the perfect family home in Nakawa. The team was professional and the process was smooth.',
    },
    {
      name: 'James Okello',
      location: 'Entebbe',
      text: 'I sold my land through Dyke Investments and got a great price. Their market knowledge is excellent.',
    },
    {
      name: 'Mary Atim',
      location: 'Jinja',
      text: 'The site visit booking system made it so easy to view multiple properties. Highly recommended!',
    },
  ];

  return (
    <div>
      <Helmet>
        <title>Dyke Investments - Premier Real Estate in Uganda | Properties for Sale & Rent</title>
        <meta name="description" content="Find your dream property in Uganda with Dyke Investments. Browse verified land, houses, commercial properties & apartments for sale or rent across Kampala, Entebbe, Jinja & more. Expert real estate services." />
        <meta name="keywords" content="Uganda real estate, properties for sale Uganda, land for sale Uganda, houses for sale Kampala, apartments Uganda, commercial property Uganda, real estate agents Uganda, Dyke Investments" />
        <meta property="og:title" content="Dyke Investments - Premier Real Estate in Uganda" />
        <meta property="og:description" content="Find your dream property in Uganda with Dyke Investments. Browse verified land, houses, commercial properties & apartments for sale or rent across Kampala, Entebbe, Jinja & more." />
        <meta property="og:url" content="https://dykeinvestments.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Dyke Investments - Premier Real Estate in Uganda" />
        <meta name="twitter:description" content="Find your dream property in Uganda with Dyke Investments. Browse verified land, houses, commercial properties & apartments for sale or rent." />
        <link rel="canonical" href="https://dykeinvestments.com/" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative text-white min-h-screen flex items-center pt-16">
        {/* Background Image */}
        {/* Background Image with reduced opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{
            backgroundImage: `url('${backgroundImages[currentImageIndex]}')`,
            opacity: 0.5, // Reduced opacity for better text visibility
            filter: 'brightness(0.8)' // Slightly darken the image
          }}
        />

        {/* Semi-transparent overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-indigo-900/40"></div>

        {/* Image indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? 'bg-orange-400 scale-125'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-orange-200">
                Property in Uganda
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-cream-50 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with verified properties, trusted sellers, and professional real estate services across Uganda
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location, property type, or price range..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-lg text-gray-900 border-0 focus:ring-4 focus:ring-orange-300 shadow-xl"
                />
                <Link
                  to={`/properties${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors font-semibold"
                >
                  Search
                </Link>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/properties"
                className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Browse Properties
              </Link>
              <Link
                to="/sell-property"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                Sell Your Property
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Dyke Investments?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive real estate solutions with a focus on transparency, 
              professionalism, and customer satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 text-center group"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} text-white rounded-full mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-orange-300">
                  {stat.number}
                </div>
                <div className="text-cream-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to find or sell your property
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-700">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Search & Browse</h3>
              <p className="text-gray-600">
                Use our advanced filters to find properties that match your exact requirements
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Visit & Inspect</h3>
              <p className="text-gray-600">
                Book site visits and inspect properties with our professional team
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure & Buy</h3>
              <p className="text-gray-600">
                Complete your purchase with our secure transaction process and legal support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by hundreds of property buyers and sellers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl text-cream-50 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who found their perfect property through Dyke Investments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-cream-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Searching
            </Link>
            <Link
              to="/buyer-request"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
            >
              Request Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;