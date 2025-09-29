import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { neonDb } from '../../lib/neon';
import { CheckCircle, AlertCircle, Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const schema = yup.object({
  property_id: yup.string().required('Property selection is required'),
  visitor_name: yup.string().required('Name is required'),
  visitor_phone: yup.string().required('Phone number is required'),
  visitor_email: yup.string().email('Invalid email address'),
  preferred_date: yup.string().required('Preferred date is required'),
  preferred_time: yup.string().required('Preferred time is required'),
  message: yup.string(),
});

type FormData = yup.InferType<typeof schema>;

interface SiteVisitFormProps {
  propertyId?: string;
  propertyTitle?: string;
}

const SiteVisitForm: React.FC<SiteVisitFormProps> = ({ propertyId, propertyTitle }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [properties, setProperties] = React.useState<any[]>([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      property_id: propertyId || '',
    }
  });

  React.useEffect(() => {
    if (!propertyId) {
      fetchProperties();
    }
  }, [propertyId]);

  const fetchProperties = async () => {
    try {
      const data = await neonDb.getProperties();
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      await neonDb.createSiteVisit({
        ...data,
        status: 'pending'
      });

      setSubmitMessage({
        type: 'success',
        message: 'Site visit booked successfully! You will receive a confirmation call within 2 hours.'
      });
      reset();
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        message: 'Failed to book site visit. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 text-white rounded-full mb-4">
            <Calendar className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Site Visit</h1>
          <p className="text-lg text-gray-600">
            Schedule a visit to view the property in person
          </p>
          {propertyTitle && (
            <div className="mt-4 p-4 bg-orange-100 rounded-lg">
              <h3 className="font-semibold text-orange-800">{propertyTitle}</h3>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
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

            {!propertyId && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <label className="text-sm font-medium text-gray-700">Select Property *</label>
                </div>
                <select
                  {...register('property_id')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Choose a property to visit</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.location_district}, {property.location_town}
                    </option>
                  ))}
                </select>
                {errors.property_id && <p className="mt-1 text-sm text-red-600">{errors.property_id.message}</p>}
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 pb-2 border-b border-gray-200">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    {...register('visitor_name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Full name"
                  />
                  {errors.visitor_name && <p className="mt-1 text-sm text-red-600">{errors.visitor_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    {...register('visitor_phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+256 700 123 456"
                  />
                  {errors.visitor_phone && <p className="mt-1 text-sm text-red-600">{errors.visitor_phone.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    {...register('visitor_email')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                  {errors.visitor_email && <p className="mt-1 text-sm text-red-600">{errors.visitor_email.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 pb-2 border-b border-gray-200">
                Schedule Visit
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <label className="text-sm font-medium text-gray-700">Preferred Date *</label>
                  </div>
                  <input
                    type="date"
                    min={today}
                    {...register('preferred_date')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {errors.preferred_date && <p className="mt-1 text-sm text-red-600">{errors.preferred_date.message}</p>}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <label className="text-sm font-medium text-gray-700">Preferred Time *</label>
                  </div>
                  <select
                    {...register('preferred_time')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                  {errors.preferred_time && <p className="mt-1 text-sm text-red-600">{errors.preferred_time.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Message</label>
                <textarea
                  {...register('message')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Any specific questions or requests for the visit..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Booking...' : 'Book Site Visit'}
              </button>
              <p className="text-sm text-gray-500 mt-3 text-center">
                You will receive a confirmation call within 2 hours of booking.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SiteVisitForm;