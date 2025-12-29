"use client";

import { useState, useEffect } from 'react';
import { AdminHotelService, AdminTourismService, Hotel, HotelCreateDto, HotelUpdateDto, Tourism } from '../../../services/admin.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import FormInput, { FormButton, Alert } from '@/components/common/FormInput';
import Pagination from '@/components/common/Pagination';
import { validateForm, hasErrors, ValidationErrors, rules } from '@/utils/validation';

// Hotel validation schema
const hotelValidation = {
  name: [rules.required('Hotel name'), rules.minLength('Hotel name', 3), rules.maxLength('Hotel name', 150)],
  description: [rules.minLength('Description', 10)],
  tourismPlaceId: [rules.required('Tourism place')],
  contactInfo: [rules.required('Contact info'), rules.minLength('Contact info', 5)]
};

const PAGE_SIZE_OPTIONS = [9, 12, 15, 20, 30];

const HotelsManagementPage = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tourisms, setTourisms] = useState<Tourism[]>([]);
  const [tourismsLoading, setTourismsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(12);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<HotelCreateDto>({
    name: '', description: '', tourismPlaceId: 0, starRating: 3, contactInfo: '', policies: '', images: [],
    mainImageUrl: ''
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [hotelActive, setHotelActive] = useState(true);

  const { token, role, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        router.push('/auth/login');
      } else {
        setAuthChecked(true);
      }
    };
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated || role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadHotels();
    loadTourisms();
  }, [authChecked, isAuthenticated, role, currentPage, pageSize]);

  const loadTourisms = async () => {
    if (!token) return;
    setTourismsLoading(true);
    try {
      const response = await AdminTourismService.getAllTourism(token, 0, 500);
      console.log('Loaded tourisms:', response.content);
      setTourisms(response.content || []);
    } catch (err) {
      console.error('Failed to load tourisms:', err);
      setTourisms([]);
    } finally {
      setTourismsLoading(false);
    }
  };

  const loadHotels = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const response = await AdminHotelService.getAllHotels(token, currentPage, pageSize);
      setHotels(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const validateFormData = (): boolean => {
    const errors = validateForm(formData, hotelValidation);
    // Custom validation for tourismPlaceId (must be > 0)
    if (!formData.tourismPlaceId || formData.tourismPlaceId === 0) {
      errors.tourismPlaceId = 'Please select a tourism place';
    }
    setFormErrors(errors);
    return !hasErrors(errors);
  };

  const handleCreate = async () => {
    if (!token) return;
    setFormError('');
    if (!validateFormData()) return;
    
    try {
      setActionLoading(-1);
      await AdminHotelService.createHotel(token, formData);
      setFormSuccess('Hotel created successfully!');
      await loadHotels();
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create hotel');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async () => {
    if (!token || !editingHotel) return;
    setFormError('');
    if (!validateFormData()) return;
    
    try {
      setActionLoading(editingHotel.id);
      const updateData: HotelUpdateDto = {
        name: formData.name, description: formData.description,
        starRating: formData.starRating, contactInfo: formData.contactInfo, policies: formData.policies
      };
      await AdminHotelService.updateHotel(token, editingHotel.id, updateData);
      setFormSuccess('Hotel updated successfully!');
      await loadHotels();
      setTimeout(() => {
        setShowModal(false);
        setEditingHotel(null);
        resetForm();
      }, 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update hotel');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (hotelId: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    try {
      setActionLoading(hotelId);
      await AdminHotelService.deleteHotel(token, hotelId);
      await loadHotels();
    } catch (err) {
      alert('Failed to delete: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name, description: hotel.description || '',
      tourismPlaceId: hotel.tourismId || 0, starRating: hotel.starRating || 3,
      contactInfo: hotel.contactInfo || '', policies: hotel.policies || '', images: hotel.images || [],
      mainImageUrl: hotel.images && hotel.images.length > 0 ? hotel.images[0] : ''
    });
    setHotelActive(hotel.active !== false);
    setNewImageUrl('');
    setFormErrors({});
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', tourismPlaceId: 0, starRating: 3, contactInfo: '', policies: '', images: [], mainImageUrl: '' });
    setEditingHotel(null);
    setHotelActive(true);
    setNewImageUrl('');
    setFormErrors({});
    setFormError('');
    setFormSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'tourismPlaceId' || name === 'starRating') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.contactInfo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tourismOptions: { value: number; label: string }[] = tourisms.map(t => ({ value: t.id, label: `${t.name} (${t.wereda || 'N/A'})` }));
  const starOptions = [
    { value: 1, label: '⭐ 1 Star' },
    { value: 2, label: '⭐⭐ 2 Stars' },
    { value: 3, label: '⭐⭐⭐ 3 Stars' },
    { value: 4, label: '⭐⭐⭐⭐ 4 Stars' },
    { value: 5, label: '⭐⭐⭐⭐⭐ 5 Stars' }
  ];

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Light background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🏨 Hotel Management</h1>
            <p className="text-slate-400">Manage hotels, assign owners, and control booking availability</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Hotel
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search hotels by name, description, or contact..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
            Total Hotels: <span className="font-semibold text-blue-600">{totalElements}</span>
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading hotels...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <Alert type="error" message={error} />
            <button onClick={loadHotels} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Retry</button>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p>No hotels found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredHotels.map((hotel) => (
              <div key={hotel.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
                  {hotel.images && hotel.images.length > 0 ? (
                    <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">🏨</span>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${hotel.active !== false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {hotel.active !== false ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{hotel.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {hotel.contactInfo || 'No contact info'}
                  </p>
                  
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {hotel.ownerId ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        👤 {hotel.ownerName || `Owner #${hotel.ownerId}`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        ⚠️ No Owner
                      </span>
                    )}
                    {hotel.starRating && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        {'⭐'.repeat(hotel.starRating)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{hotel.description}</p>
                  
                  <div className="mt-4 flex justify-between items-center pt-3 border-t">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {hotel.viewersCount || 0} views
                    </span>
                    <div className="flex space-x-2">
                      <button onClick={() => router.push(`/admin/hotels/${hotel.id}`)}
                        className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">Manage</button>
                      <button onClick={() => openEditModal(hotel)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(hotel.id)} disabled={actionLoading === hotel.id}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50">
                        {actionLoading === hotel.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(0); }}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingHotel ? '✏️ Edit Hotel' : '➕ Add New Hotel'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {formSuccess && <Alert type="success" message={formSuccess} />}
              {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}

              <FormInput label="Hotel Name" name="name" value={formData.name} onChange={handleInputChange}
                error={formErrors.name} placeholder="Enter hotel name" required
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              />

              <FormInput label="Description" name="description" type="textarea" value={formData.description || ''}
                onChange={handleInputChange} error={formErrors.description} placeholder="Describe the hotel" rows={3}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tourismsLoading ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tourism Place <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                      Loading tourism places...
                    </div>
                  </div>
                ) : tourismOptions.length > 0 ? (
                  <FormInput label="Tourism Place" name="tourismPlaceId" type="select" value={formData.tourismPlaceId}
                    onChange={handleInputChange} error={formErrors.tourismPlaceId} required options={tourismOptions}
                  />
                ) : (
                  <FormInput label="Tourism Place ID" name="tourismPlaceId" type="number" value={formData.tourismPlaceId || ''}
                    onChange={handleInputChange} error={formErrors.tourismPlaceId} required 
                    placeholder="Enter tourism place ID"
                    helpText="No tourism places found. Enter the ID manually."
                  />
                )}
                <FormInput label="Star Rating" name="starRating" type="select" value={formData.starRating}
                  onChange={handleInputChange} options={starOptions}
                />
              </div>

              <FormInput label="Contact Info" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange}
                error={formErrors.contactInfo} placeholder="Phone number or email" required
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
              />

              <FormInput label="Hotel Policies" name="policies" type="textarea" value={formData.policies || ''}
                onChange={handleInputChange} placeholder="Check-in/out times, cancellation policy, etc." rows={2}
              />

              {/* Active Status Toggle */}
              <div className="border-t pt-4 mt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Hotel Active Status</span>
                    <p className="text-xs text-gray-500">Inactive hotels won't appear in search results</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={hotelActive}
                      onChange={(e) => setHotelActive(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-14 h-7 rounded-full transition-colors ${hotelActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${hotelActive ? 'translate-x-7' : ''}`}></div>
                    </div>
                  </div>
                </label>
                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${hotelActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {hotelActive ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>

              {/* Main Image URL */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">📷 Main Image</h4>
                <FormInput label="Main Image URL" name="mainImageUrl" value={formData.mainImageUrl || ''}
                  onChange={handleInputChange} placeholder="https://example.com/hotel-image.jpg"
                  helpText="Enter the URL of the main/cover image for this hotel"
                />
                {formData.mainImageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <img src={formData.mainImageUrl} alt="Main preview" 
                      className="w-32 h-24 object-cover rounded-lg border" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">🖼️ Gallery Images</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter image URL and click Add"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newImageUrl.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          images: [...(prev.images || []), newImageUrl.trim()]
                        }));
                        setNewImageUrl('');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Gallery ${idx + 1}`} 
                          className="w-full h-20 object-cover rounded-lg border"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Error'; }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images?.filter((_, i) => i !== idx) || []
                            }));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: You can manage detailed hotel images from the "Manage" button after creating the hotel.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end space-x-3">
              <FormButton variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</FormButton>
              <FormButton variant="primary" onClick={editingHotel ? handleUpdate : handleCreate}
                loading={actionLoading !== null} disabled={actionLoading !== null}>
                {editingHotel ? 'Update Hotel' : 'Create Hotel'}
              </FormButton>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default HotelsManagementPage;
