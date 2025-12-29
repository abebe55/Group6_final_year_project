"use client";

import React, { useState, useEffect } from 'react';
import { AdminTourismService, Tourism, TourismCreateDto, TourismUpdateDto } from '../../../services/admin.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import FormInput, { FormButton, Alert } from '@/components/common/FormInput';
import Pagination from '@/components/common/Pagination';
import { validateForm, hasErrors, ValidationErrors, rules } from '@/utils/validation';

// Tourism validation schema
const tourismValidation = {
  name: [rules.required('Name'), rules.minLength('Name', 3), rules.maxLength('Name', 150)],
  description: [rules.required('Description'), rules.minLength('Description', 20)],
  wereda: [rules.required('Wereda'), rules.minLength('Wereda', 2)],
  kebele: [rules.required('Kebele'), rules.minLength('Kebele', 2)],
  category: [rules.required('Category')]
};

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '✅ Active' },
  { value: 'BLOCKED', label: '🚫 Blocked' }
];

const PAGE_SIZE_OPTIONS = [9, 12, 15, 20, 30];

const TourismsManagementPage = () => {
  const [tourisms, setTourisms] = useState<Tourism[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTourism, setEditingTourism] = useState<Tourism | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(12);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<TourismCreateDto>({
    name: '', description: '', wereda: '', kebele: '', category: '',
    bestTime: '', peaceInfo: '', visitTime: '', languages: [], images: [],
    imageUrl: '', status: 'ACTIVE'
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  const { token, role, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadTourisms();
  }, [isAuthenticated, role, currentPage, pageSize]);

  const loadTourisms = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const response = await AdminTourismService.getAllTourism(token, currentPage, pageSize);
      setTourisms(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tourism places');
    } finally {
      setLoading(false);
    }
  };

  const validateFormData = (): boolean => {
    const errors = validateForm(formData, tourismValidation);
    setFormErrors(errors);
    return !hasErrors(errors);
  };

  const handleCreate = async () => {
    if (!token) return;
    setFormError('');
    if (!validateFormData()) return;
    
    try {
      setActionLoading(-1);
      await AdminTourismService.createTourism(token, formData);
      setFormSuccess('Tourism place created successfully!');
      await loadTourisms();
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create tourism place');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async () => {
    if (!token || !editingTourism) return;
    setFormError('');
    if (!validateFormData()) return;
    
    try {
      setActionLoading(editingTourism.id);
      const updateData: TourismUpdateDto = {
        name: formData.name, description: formData.description,
        wereda: formData.wereda, kebele: formData.kebele, category: formData.category,
        bestTime: formData.bestTime, peaceInfo: formData.peaceInfo, visitTime: formData.visitTime,
        languages: formData.languages, imageUrl: (formData as any).imageUrl, status: (formData as any).status
      };
      await AdminTourismService.updateTourism(token, editingTourism.id, updateData);
      setFormSuccess('Tourism place updated successfully!');
      await loadTourisms();
      setTimeout(() => {
        setShowModal(false);
        setEditingTourism(null);
        resetForm();
      }, 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update tourism place');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (tourismId: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this tourism place?')) return;
    try {
      setActionLoading(tourismId);
      await AdminTourismService.deleteTourism(token, tourismId);
      await loadTourisms();
    } catch (err) {
      alert('Failed to delete: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (tourism: Tourism) => {
    setEditingTourism(tourism);
    setFormData({
      name: tourism.name, description: tourism.description,
      wereda: tourism.wereda, kebele: tourism.kebele, category: tourism.category || '',
      bestTime: tourism.bestTime || '', peaceInfo: tourism.peaceInfo || '',
      visitTime: tourism.visitTime || '', languages: tourism.languages || [], images: tourism.images || [],
      imageUrl: (tourism as any).imageUrl || '', status: (tourism as any).status || 'ACTIVE'
    });
    setNewImageUrl('');
    setFormErrors({});
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', wereda: '', kebele: '', category: '',
      bestTime: '', peaceInfo: '', visitTime: '', languages: [], images: [],
      imageUrl: '', status: 'ACTIVE'
    });
    setNewImageUrl('');
    setEditingTourism(null);
    setFormErrors({});
    setFormError('');
    setFormSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLanguageChange = (lang: string) => {
    const langs = formData.languages || [];
    if (langs.includes(lang)) {
      setFormData({ ...formData, languages: langs.filter(l => l !== lang) });
    } else {
      setFormData({ ...formData, languages: [...langs, lang] });
    }
  };

  const filteredTourisms = tourisms.filter(tourism =>
    tourism.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourism.wereda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourism.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LANGUAGES = ['Amharic', 'English', 'Oromo', 'Tigrinya', 'Somali', 'Arabic'];
  const CATEGORIES = [
    { value: 'HERITAGE', label: 'Heritage Site' },
    { value: 'HIGHLAND', label: 'Highland' },
    { value: 'CAVERN', label: 'Cavern' },
    { value: 'AQUATICS', label: 'Aquatics' },
    { value: 'CULTURE', label: 'Cultural' },
    { value: 'MODERN', label: 'Modern' }
  ];

  if (!isAuthenticated || role !== 'ADMIN') {
    return <div className="p-8 text-center">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Light background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏞️ Tourism Places Management</h1>
            <p className="text-gray-600">Manage tourism destinations and attractions</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Tourism Place
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search by name, wereda, or category..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
            Total Places: <span className="font-semibold text-blue-600">{totalElements}</span>
          </div>
        </div>
      </div>

      {/* Tourism Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tourism places...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <Alert type="error" message={error} />
            <button onClick={loadTourisms} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Retry</button>
          </div>
        ) : filteredTourisms.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>No tourism places found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredTourisms.map((tourism) => (
              <div key={tourism.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 group">
                <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center relative">
                  {tourism.images && tourism.images.length > 0 ? (
                    <img src={tourism.images[0]} alt={tourism.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">🏞️</span>
                  )}
                  {tourism.category && (
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs bg-green-600 text-white rounded-full font-medium">
                      {tourism.category}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{tourism.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {tourism.wereda}, {tourism.kebele}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{tourism.description}</p>
                  {tourism.languages && tourism.languages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {tourism.languages.slice(0, 3).map(lang => (
                        <span key={lang} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{lang}</span>
                      ))}
                      {tourism.languages.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">+{tourism.languages.length - 3}</span>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex justify-between items-center pt-3 border-t">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {tourism.viewersCount || 0} views
                    </span>
                    <div className="flex space-x-2">
                      <button onClick={() => router.push(`/admin/tourisms/${tourism.id}/images`)} className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">📸 Images</button>
                      <button onClick={() => openEditModal(tourism)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(tourism.id)} disabled={actionLoading === tourism.id}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50">
                        {actionLoading === tourism.id ? 'Deleting...' : 'Delete'}
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingTourism ? '✏️ Edit Tourism Place' : '➕ Add New Tourism Place'}
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

              <FormInput label="Name" name="name" value={formData.name} onChange={handleInputChange}
                error={formErrors.name} placeholder="Enter tourism place name" required
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              />

              <FormInput label="Description" name="description" type="textarea" value={formData.description}
                onChange={handleInputChange} error={formErrors.description} placeholder="Describe the tourism place (min 20 characters)"
                required rows={3}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Wereda" name="wereda" value={formData.wereda} onChange={handleInputChange}
                  error={formErrors.wereda} placeholder="Enter wereda" required
                  icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>}
                />
                <FormInput label="Kebele" name="kebele" value={formData.kebele} onChange={handleInputChange}
                  error={formErrors.kebele} placeholder="Enter kebele" required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Category" name="category" type="select" value={formData.category}
                  onChange={handleInputChange} error={formErrors.category} required options={CATEGORIES}
                />
                <FormInput label="Best Time to Visit" name="bestTime" value={formData.bestTime || ''}
                  onChange={handleInputChange} placeholder="e.g., October - March"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Visit Duration" name="visitTime" value={formData.visitTime || ''}
                  onChange={handleInputChange} placeholder="e.g., 2-3 hours"
                />
                <FormInput label="Peace Info" name="peaceInfo" value={formData.peaceInfo || ''}
                  onChange={handleInputChange} placeholder="Safety information"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
                <div className="flex flex-wrap gap-3">
                  {LANGUAGES.map(lang => (
                    <label key={lang} className={`inline-flex items-center px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.languages?.includes(lang) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input type="checkbox" checked={formData.languages?.includes(lang) || false}
                        onChange={() => handleLanguageChange(lang)} className="sr-only" />
                      <span className="text-sm">{lang}</span>
                      {formData.languages?.includes(lang) && (
                        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Selection */}
              <FormInput label="Status" name="status" type="select" value={(formData as any).status || 'ACTIVE'}
                onChange={handleInputChange} options={STATUS_OPTIONS}
              />

              {/* Main Image URL */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">📷 Main Image</h4>
                <FormInput label="Main Image URL" name="imageUrl" value={(formData as any).imageUrl || ''}
                  onChange={handleInputChange} placeholder="https://example.com/image.jpg"
                  helpText="Enter the URL of the main/cover image for this tourism place"
                />
                {(formData as any).imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <img src={(formData as any).imageUrl} alt="Main preview" 
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
                  💡 Tip: For detailed internal images (like Bete Giorgis, Bete Maryam), use the "📸 Images" button after creating the place.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end space-x-3">
              <FormButton variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</FormButton>
              <FormButton variant="primary" onClick={editingTourism ? handleUpdate : handleCreate}
                loading={actionLoading !== null} disabled={actionLoading !== null}>
                {editingTourism ? 'Update Tourism Place' : 'Create Tourism Place'}
              </FormButton>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TourismsManagementPage;
