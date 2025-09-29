import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { neonDb } from '../../lib/neon';
import { CheckCircle, AlertCircle, Home, MapPin, DollarSign, User, Upload, X } from 'lucide-react';
import { useAuth } from '../Auth/AuthProvider';

const schema = yup.object({
  title: yup.string().required('Property title is required'),
  property_type: yup.string().oneOf(['land', 'house', 'commercial', 'apartment', 'villa']).required(),
  location_district: yup.string().required('District is required'),
  location_town: yup.string().required('Town is required'),
  location_village: yup.string(),
  distance_from_main_road: yup.string(),
  has_water: yup.boolean(),
  has_power: yup.boolean(),
  has_internet: yup.boolean(),
  size_acres: yup.number().positive().nullable(),
  size_sqft: yup.number().positive().nullable(),
  bedrooms: yup.number().positive().integer().nullable(),
  bathrooms: yup.number().positive().integer().nullable(),
  asking_price: yup.number().positive().required('Asking price is required'),
  description: yup.string(),
  owner_name: yup.string().required('Owner name is required'),
  owner_phone: yup.string().required('Phone number is required'),
  owner_email: yup.string().email('Invalid email address'),
  images: yup.array().of(yup.mixed()),
});

type FormData = yup.InferType<typeof schema>;

const PropertySellerForm = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedImages, setSelectedImages] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      has_water: false,
      has_power: false,
      has_internet: false,
    }
  });

  const propertyType = watch('property_type');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (propertyId: string) => {
    // For now, we'll convert images to base64 and store them in the database
    // In production, you'd upload to a cloud storage service like AWS S3, Cloudinary, etc.
    
    const imagePromises = selectedImages.map(async (file, index) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const base64Images = await Promise.all(imagePromises);
      
      // Store images in the database (for demo purposes)
      // In production, upload to cloud storage and store URLs
      await neonDb.savePropertyImages(propertyId, base64Images);
      
      console.log('Images saved successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      // Don't throw error - let property creation succeed even if images fail
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const property = await neonDb.createProperty({
        ...data,
        status: 'pending',
        submitted_by: null, // Allow anonymous submissions
      });

      // Upload images if any were selected
      if (selectedImages.length > 0) {
        await uploadImages(property.id);
      }

      // Send email notification
      await neonDb.sendPropertySubmissionEmail(data);

      setSubmitMessage({
        type: 'success',
        message: 'Property submitted successfully! Our team will contact you within 24 hours to schedule a visit. You will also receive a confirmation email shortly.'
      });
      reset();
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error submitting property:', error);
      setSubmitMessage({
        type: 'error',
        message: 'Failed to submit property. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <Home className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell Your Property</h1>
          <p className="text-lg text-gray-600">
            Submit your property details and our team will help you list it for sale
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

            {/* Property Details Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <Home className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
                  <input
                    type="text"
                    {...register('title')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Beautiful 3-bedroom house in Kampala"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                  <select
                    {...register('property_type')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asking Price (UGX) *</label>
                  <input
                    type="number"
                    {...register('asking_price')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 500000000"
                  />
                  {errors.asking_price && <p className="mt-1 text-sm text-red-600">{errors.asking_price.message}</p>}
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Location</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                  <input
                    type="text"
                    {...register('location_district')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Kampala"
                  />
                  {errors.location_district && <p className="mt-1 text-sm text-red-600">{errors.location_district.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Town *</label>
                  <input
                    type="text"
                    {...register('location_town')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Nakawa"
                  />
                  {errors.location_town && <p className="mt-1 text-sm text-red-600">{errors.location_town.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                  <input
                    type="text"
                    {...register('location_village')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Bukoto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distance from Main Road</label>
                  <input
                    type="text"
                    {...register('distance_from_main_road')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 500 meters"
                  />
                </div>
              </div>
            </div>

            {/* Utilities & Features */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 pb-2 border-b border-gray-200">
                Utilities & Features
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('has_water')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Water Available</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('has_power')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Electricity Available</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('has_internet')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Internet Available</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size (Acres)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('size_acres')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size (Sq. Ft.)</label>
                  <input
                    type="number"
                    {...register('size_sqft')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1500"
                  />
                </div>

                {(propertyType === 'house' || propertyType === 'apartment' || propertyType === 'villa') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                      <input
                        type="number"
                        {...register('bedrooms')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                      <input
                        type="number"
                        {...register('bathrooms')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 2"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide additional details about your property..."
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each (max 10 images)</p>
                  </div>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Owner Contact Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <User className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
                  <input
                    type="text"
                    {...register('owner_name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full name"
                  />
                  {errors.owner_name && <p className="mt-1 text-sm text-red-600">{errors.owner_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    {...register('owner_phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+256 700 123 456"
                  />
                  {errors.owner_phone && <p className="mt-1 text-sm text-red-600">{errors.owner_phone.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    {...register('owner_email')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                  {errors.owner_email && <p className="mt-1 text-sm text-red-600">{errors.owner_email.message}</p>}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Property'}
              </button>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Our team will review your submission and contact you within 24 hours to schedule a property visit.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertySellerForm;