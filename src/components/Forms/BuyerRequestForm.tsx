import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { neonDb } from '../../lib/neon';
import { CheckCircle, AlertCircle, Search, MapPin, DollarSign, User, Home, Wifi, Zap, Droplets } from 'lucide-react';

const schema = yup.object({
  property_type: yup.string().oneOf(['land', 'house', 'commercial', 'apartment', 'villa']).required('Property type is required'),
  budget_min: yup.number().positive().required('Minimum budget is required').test('budget-validation', 'Minimum budget must be less than maximum budget', function(value) {
    const { budget_max } = this.parent;
    return !budget_max || value < budget_max;
  }),
  budget_max: yup.number().positive().required('Maximum budget is required'),
  preferred_districts: yup.array().of(yup.string()).min(1, 'Select at least one district'),
  preferred_towns: yup.string(),
  requires_water: yup.boolean(),
  requires_power: yup.boolean(),
  requires_internet: yup.boolean(),
  min_bedrooms: yup.number().positive().integer().nullable(),
  min_bathrooms: yup.number().positive().integer().nullable(),
  min_size_acres: yup.number().positive().nullable(),
  min_size_sqft: yup.number().positive().nullable(),
  additional_requirements: yup.string(),
  contact_name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  contact_phone: yup.string().required('Phone number is required').matches(/^(\+256|0)[0-9]{9}$/, 'Please enter a valid Ugandan phone number'),
  contact_email: yup.string().email('Invalid email address'),
  urgency: yup.string().oneOf(['low', 'medium', 'high']).required('Please select urgency level'),
  preferred_contact_method: yup.string().oneOf(['phone', 'email', 'whatsapp']).required('Please select preferred contact method'),
  timeline: yup.string().oneOf(['immediate', '1-3months', '3-6months', '6-12months']).required('Please select your timeline'),
});

type FormData = yup.InferType<typeof schema>;

const BuyerRequestForm = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      requires_water: false,
      requires_power: false,
      requires_internet: false,
      preferred_districts: [],
      urgency: 'medium',
      preferred_contact_method: 'phone',
      timeline: '3-6months',
    }
  });

  const propertyType = watch('property_type');

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Create buyer request in database
      const request = await neonDb.createBuyerRequest({
        ...data,
        status: 'active'
      });

      // Send email notification
      await neonDb.sendBuyerRequestEmail(data);

      setSubmitMessage({
        type: 'success',
        message: 'Your property request has been submitted successfully! Our team will start searching for matching properties and contact you within 24 hours. You will also receive a confirmation email shortly.'
      });
      reset();
    } catch (error) {
      console.error('Error submitting buyer request:', error);
      setSubmitMessage({
        type: 'error',
        message: 'Failed to submit request. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const districts = ['Kampala', 'Wakiso', 'Mukono', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu', 'Masaka'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 text-white rounded-full mb-4">
            <Search className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Dream Property</h1>
          <p className="text-lg text-gray-600">
            Tell us what you're looking for and we'll help you find the perfect property
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {submitMessage && (
              <div className={`flex items-center p-4 rounded-lg ${
                submitMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {submitMessage.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-3" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-3" />
                )}
                {submitMessage.message}
              </div>
            )}

            {/* Property Requirements Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <Search className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900">What Are You Looking For?</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                  <select
                    {...register('property_type')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="land">Land</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                  </select>
                  {errors.property_type && <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>}
                </div>
              </div>
            </div>

            {/* Budget Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900">Budget Range</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Budget (UGX) *</label>
                  <input
                    type="number"
                    {...register('budget_min')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 100000000"
                  />
                  {errors.budget_min && <p className="mt-1 text-sm text-red-600">{errors.budget_min.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Budget (UGX) *</label>
                  <input
                    type="number"
                    {...register('budget_max')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 500000000"
                  />
                  {errors.budget_max && <p className="mt-1 text-sm text-red-600">{errors.budget_max.message}</p>}
                </div>
              </div>
            </div>

            {/* Location Preferences */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900">Location Preferences</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Districts *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {districts.map((district) => (
                    <label key={district} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={district}
                        {...register('preferred_districts')}
                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">{district}</span>
                    </label>
                  ))}
                </div>
                {errors.preferred_districts && (
                  <p className="mt-1 text-sm text-red-600">{errors.preferred_districts.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Towns (Optional)</label>
                <input
                  type="text"
                  {...register('preferred_towns')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Nakawa, Ntinda, Kololo (comma-separated)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple towns with commas</p>
              </div>
            </div>

            {/* Requirements & Features */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <Home className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900">Required Features</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 transition-colors">
                  <input
                    type="checkbox"
                    {...register('requires_water')}
                    className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <Droplets className="h-5 w-5 text-blue-500 ml-3 mr-2" />
                  <label className="text-sm text-gray-700 font-medium">Must have Water</label>
                </div>

                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 transition-colors">
                  <input
                    type="checkbox"
                    {...register('requires_power')}
                    className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <Zap className="h-5 w-5 text-yellow-500 ml-3 mr-2" />
                  <label className="text-sm text-gray-700 font-medium">Must have Electricity</label>
                </div>

                <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 transition-colors">
                  <input
                    type="checkbox"
                    {...register('requires_internet')}
                    className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <Wifi className="h-5 w-5 text-purple-500 ml-3 mr-2" />
                  <label className="text-sm text-gray-700 font-medium">Must have Internet</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Size (Acres)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('min_size_acres')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 1.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Size (Sq. Ft.)</label>
                  <input
                    type="number"
                    {...register('min_size_sqft')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 1000"
                  />
                </div>

                {(propertyType === 'house' || propertyType === 'apartment' || propertyType === 'villa') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Bedrooms</label>
                      <input
                        type="number"
                        {...register('min_bedrooms')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., 2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Bathrooms</label>
                      <input
                        type="number"
                        {...register('min_bathrooms')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., 1"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Requirements</label>
                <textarea
                  {...register('additional_requirements')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Any other specific requirements or preferences..."
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <User className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    {...register('contact_name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Full name"
                  />
                  {errors.contact_name && <p className="mt-1 text-sm text-red-600">{errors.contact_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    {...register('contact_phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+256 700 123 456"
                  />
                  {errors.contact_phone && <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    {...register('contact_email')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                  {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>}
                </div>
              </div>
            </div>

            {/* Timeline & Preferences */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <AlertCircle className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-semibold text-gray-900">Timeline & Preferences</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeline *</label>
                  <select
                    {...register('timeline')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate (within 1 month)</option>
                    <option value="1-3months">1-3 months</option>
                    <option value="3-6months">3-6 months</option>
                    <option value="6-12months">6-12 months</option>
                  </select>
                  {errors.timeline && <p className="mt-1 text-sm text-red-600">{errors.timeline.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level *</label>
                  <select
                    {...register('urgency')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select urgency</option>
                    <option value="low">Low - Just browsing</option>
                    <option value="medium">Medium - Actively looking</option>
                    <option value="high">High - Ready to buy</option>
                  </select>
                  {errors.urgency && <p className="mt-1 text-sm text-red-600">{errors.urgency.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method *</label>
                  <select
                    {...register('preferred_contact_method')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select method</option>
                    <option value="phone">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                  {errors.preferred_contact_method && <p className="mt-1 text-sm text-red-600">{errors.preferred_contact_method.message}</p>}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Our team will start searching for matching properties and contact you within 24 hours.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuyerRequestForm;