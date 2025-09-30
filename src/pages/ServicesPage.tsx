import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Gavel, 
  ShieldAlert, 
  Layers, 
  Building2,
  CheckCircle,
  ArrowRight,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      icon: Home,
      title: 'Property Sales',
      description: 'We provide a trusted platform where buyers can explore a wide range of properties on our Property Listings Page. Every property is thoroughly verified for authenticity, giving you peace of mind and confidence in your purchase.',
      features: [
        'Thoroughly verified properties',
        'Wide range of listings',
        'Negotiable prices',
        'Authentic documentation',
        'Buyer protection'
      ],
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      link: '/properties',
      linkText: 'Browse Properties'
    },
    {
      icon: ShoppingCart,
      title: 'Property Purchase',
      description: 'We buy land and houses directly for resale. If you would like to sell your property to us or through our platform, simply complete our Sell Property Form. Our team will conduct detailed due diligence to verify ownership, legality, and authenticity before it is listed.',
      features: [
        'Direct property purchase',
        'Detailed due diligence',
        'Ownership verification',
        'Legal compliance checks',
        'Fast processing'
      ],
      color: 'bg-emerald-600',
      hoverColor: 'hover:bg-emerald-700',
      link: '/sell-property',
      linkText: 'Sell Your Property'
    },
    {
      icon: Gavel,
      title: 'Property Auctions',
      description: 'We manage and conduct auctions of land and houses on behalf of property owners and creditors. Our transparent auction process ensures fair competition, optimal value, and seamless transfer of ownership.',
      features: [
        'Transparent auction process',
        'Fair competition',
        'Optimal property value',
        'Seamless ownership transfer',
        'Professional management'
      ],
      color: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-700',
      link: '/contact',
      linkText: 'Learn More'
    },
    {
      icon: ShieldAlert,
      title: 'Whistleblowing Policy',
      description: 'Integrity and transparency are at the heart of our operations. If fraud or irregularities are detected during the property verification process, we immediately engage law enforcement. This protects our clients and helps you take the first step in risk management.',
      features: [
        'Zero-tolerance for fraud',
        'Immediate law enforcement engagement',
        'Client protection priority',
        'Risk management support',
        'Transparent reporting'
      ],
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      link: '/contact',
      linkText: 'Report an Issue'
    },
    {
      icon: Layers,
      title: 'Estate Development',
      description: 'We purchase land starting from 1 acre and above for large-scale estate development projects. Once processed, the land is subdivided into titled plots of 50x100 ft for resale. Our estate projects are designed to deliver organized, accessible, and value-driven communities.',
      features: [
        'Large-scale development',
        'Titled plots (50x100 ft)',
        'Organized communities',
        'Modern infrastructure',
        'Investment opportunities'
      ],
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      link: '/contact',
      linkText: 'Discuss Your Project'
    },
    {
      icon: Building2,
      title: 'Property Management',
      description: 'We provide professional property management services for landlords, covering Airbnb units, condominiums, residential houses, office blocks, and commercial buildings. Our comprehensive services ensure your property retains its value while generating consistent income.',
      features: [
        'Tenant placement & screening',
        'Rent collection',
        'Property maintenance',
        'Financial oversight',
        'All property types covered'
      ],
      color: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700',
      link: '/contact',
      linkText: 'Get Started'
    }
  ];

  const propertyTypes = [
    'Airbnb Units',
    'Condominiums',
    'Residential Houses',
    'Office Blocks',
    'Commercial Buildings',
    'Estate Plots'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Comprehensive real estate solutions tailored to meet all your property needs—from buying and selling to development and management
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl ${
                    isEven ? '' : ''
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {/* Content Side */}
                    <div className={`p-8 lg:p-12 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                      <div className={`inline-flex items-center justify-center w-16 h-16 ${service.color} text-white rounded-lg mb-6`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {service.title}
                      </h2>
                      
                      <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        {service.description}
                      </p>

                      <div className="space-y-3 mb-8">
                        {service.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Link
                        to={service.link}
                        className={`inline-flex items-center ${service.color} text-white px-6 py-3 rounded-lg font-semibold ${service.hoverColor} transition-all duration-300 transform hover:scale-105`}
                      >
                        {service.linkText}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </div>

                    {/* Visual Side */}
                    <div className={`${service.color} p-8 lg:p-12 flex items-center justify-center ${
                      isEven ? 'lg:order-2' : 'lg:order-1'
                    }`}>
                      <div className="text-white">
                        <Icon className="h-32 w-32 mx-auto mb-6 opacity-20" />
                        <div className="text-center">
                          <div className="text-4xl font-bold mb-2">100%</div>
                          <div className="text-lg opacity-90">Client Satisfaction</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Property Types We Manage
            </h2>
            <p className="text-xl text-gray-600">
              Professional management services for all property categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {propertyTypes.map((type, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-lg p-6 text-center hover:bg-blue-50 transition-colors border-2 border-transparent hover:border-blue-200"
              >
                <Building2 className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">{type}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Dyke Investments?
            </h2>
            <p className="text-xl text-gray-600">
              Your trusted partner in real estate excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Verified Properties
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Every property undergoes thorough verification for authenticity, ownership, and legal compliance
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Expert Team
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our professional team brings years of experience in property management, sales, and development
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-full mb-6">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Maximum Value
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We ensure you get the best value whether you're buying, selling, or managing property investments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Whether you're looking to buy, sell, develop, or manage property, our team is ready to help you achieve your real estate goals
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Browse Properties
            </Link>
            <Link
              to="/sell-property"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              List Your Property
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
