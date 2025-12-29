"use client";

import React, { useState, useEffect } from 'react';
import { AdminGuiderService, AdminTourismService, Guider, GuiderCreateDto, GuiderUpdateDto, Tourism } from '../../../services/admin.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import FormInput, { FormButton, Alert } from '@/components/common/FormInput';
import { validateForm, hasErrors, ValidationErrors, rules } from '@/utils/validation';

// Guider validation schema
const guiderValidation = {
  fullName: [rules.required('Full name'), rules.minLength('Full name', 3), rules.maxLength('Full name', 100)],
  contactInfo: [rules.required('Contact info'), rules.minLength('Contact info', 5)]
};

const GuidersManagementPage = () => {
  const [guiders, setGuiders] = useState<Guider[]>([]);
  const [tourisms, setTourisms] = useState<Tourism[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTourismId, setSelectedTourismId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGuider, setEditingGuider] = useState<Guider | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<GuiderCreateDto>({
    fullName: '', contactInfo: '', languages: [], tourismPlaceId: 0, active: true
  });

  const { token, role, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const LANGUAGES = ['Amharic', 'English', 'Oromo', 'Tigrinya', 'Somali', 'Arabic', 'French', 'German', 'Italian', 'Spanish'];

  useEffect(() => {
    if (!isAuthenticated || role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadTourisms();
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (selectedTourismId) {
      loadGuiders(selectedTourismId);
    } else {
      setGuiders([]);
    }
  }, [selectedTourismId]);

  const loadTourisms = async () => {
    if (!token) return;
    try {
      const response = await AdminTourismService.getAllTourism(token, 0, 100);
      setTourisms(response.content || []);
      if (response.content && response.content.length > 0) {
        setSelectedTourismId(response.content[0].id);
      }
    } catch (err) {
      console.error('Failed to load tourisms:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGuiders = async (tourismId: number) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const guidersList = await AdminGuiderService.getGuidersByTourism(token, tourismId);
      setGuiders(guidersList || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guiders');
      setGuiders([]);
    } finally {
      setLoading(false);
    }
  };

  const validateFormData = (): boolean => {
    const errors = validateForm(formData, guiderValidation);
    if (!formData.languages || formData.languages.length === 0) {
      errors.languages = 'Please select at least one language';
    }
    setFormErrors(errors);
    return !hasErrors(errors);
  };

  const handleCreate = async () => {
    if (!token || !selectedTourismId) return;
    setFormError('');
    if (!validateFormData()) return;
    
    try {
      setActionLoading(-1);
      await AdminGuiderService.createGuider(token, { ...formData, tourismPlaceId: selectedTourismId });
      setFormSuccess('Guider created successfully!');
      await loadGuiders(selectedTourismId);
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create guider');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async () => {
    if (!token || !editingGuider || !selectedTourismId) return;
    setFormError('');
    if (!validateFormData()) return;
    
    try {
      setActionLoading(editingGuider.id);
      const updateData: GuiderUpdateDto = {
        fullName: formData.fullName, contactInfo: formData.contactInfo,
        languages: formData.languages, active: formData.active
      };
      await AdminGuiderService.updateGuider(token, editingGuider.id, updateData);
      setFormSuccess('Guider updated successfully!');
      await loadGuiders(selectedTourismId);
      setTimeout(() => {
        setShowModal(false);
        setEditingGuider(null);
        resetForm();
      }, 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update guider');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (guiderId: number) => {
    if (!token || !selectedTourismId) return;
    if (!confirm('Are you sure you want to delete this guider?')) return;
    try {
      setActionLoading(guiderId);
      await AdminGuiderService.deleteGuider(token, guiderId);
      await loadGuiders(selectedTourismId);
    } catch (err) {
      alert('Failed to delete: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (guider: Guider) => {
    setEditingGuider(guider);
    setFormData({
      fullName: guider.fullName, contactInfo: guider.contactInfo,
      languages: guider.languages || [], tourismPlaceId: selectedTourismId || 0, active: guider.active
    });
    setFormErrors({});
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ fullName: '', contactInfo: '', languages: [], tourismPlaceId: 0, active: true });
    setEditingGuider(null);
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
    if (formErrors.languages) {
      setFormErrors(prev => ({ ...prev, languages: '' }));
    }
  };

  const getSelectedTourismName = () => {
    const tourism = tourisms.find(t => t.id === selectedTourismId);
    return tourism ? tourism.name : 'Select a tourism place';
  };

  const filteredGuiders = guiders.filter(guider =>
    guider.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guider.contactInfo?.includes(searchTerm)
  );

  if (!isAuthenticated || role !== 'ADMIN') {
    return <div className="p-8 text-center">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Light background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🗺️ Guiders Management</h1>
            <p className="text-gray-600">Manage tour guides and language specialists</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }} disabled={!selectedTourismId}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Guider
          </button>
        </div>
      </div>

      {/* Tourism Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Tourism Place</label>
            <select value={selectedTourismId || ''} onChange={(e) => setSelectedTourismId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">-- Select a tourism place --</option>
              {tourisms.map(tourism => (
                <option key={tourism.id} value={tourism.id}>{tourism.name} ({tourism.wereda})</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search guiders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>

      {/* Guiders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {!selectedTourismId ? (
          <div className="p-8 text-center text-gray-600">
            <span className="text-5xl mb-4 block">🗺️</span>
            <p className="text-lg">Please select a tourism place to view its guiders</p>
          </div>
        ) : loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading guiders...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <Alert type="error" message={error} />
            <button onClick={() => selectedTourismId && loadGuiders(selectedTourismId)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">Retry</button>
          </div>
        ) : filteredGuiders.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <span className="text-5xl mb-4 block">🗺️</span>
            <p className="text-lg mb-4">No guiders found for {getSelectedTourismName()}</p>
            <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add First Guider</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Languages</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuiders.map((guider) => (
                  <tr key={guider.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-medium">{guider.fullName?.charAt(0) || '?'}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{guider.fullName}</div>
                          <div className="text-xs text-gray-500">ID: {guider.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {guider.contactInfo}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {guider.languages?.slice(0, 3).map(lang => (
                          <span key={lang} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{lang}</span>
                        ))}
                        {guider.languages && guider.languages.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">+{guider.languages.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${guider.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {guider.active ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button onClick={() => openEditModal(guider)} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                        <button onClick={() => handleDelete(guider.id)} disabled={actionLoading === guider.id}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50">
                          {actionLoading === guider.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingGuider ? '✏️ Edit Guider' : '➕ Add New Guider'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Tourism Place: {getSelectedTourismName()}</p>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {formSuccess && <Alert type="success" message={formSuccess} />}
              {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}

              <FormInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange}
                error={formErrors.fullName} placeholder="Enter guider's full name" required
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              />

              <FormInput label="Contact Info" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange}
                error={formErrors.contactInfo} placeholder="Phone number or email" required
                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map(lang => (
                    <label key={lang} className={`inline-flex items-center px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.languages?.includes(lang) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input type="checkbox" checked={formData.languages?.includes(lang) || false}
                        onChange={() => handleLanguageChange(lang)} className="sr-only" />
                      <span className="text-sm">{lang}</span>
                      {formData.languages?.includes(lang) && (
                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
                {formErrors.languages && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.languages}
                  </p>
                )}
              </div>

              {editingGuider && (
                <div className="flex items-center">
                  <input type="checkbox" id="active" checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">Active (available for tours)</label>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end space-x-3">
              <FormButton variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</FormButton>
              <FormButton variant="primary" onClick={editingGuider ? handleUpdate : handleCreate}
                loading={actionLoading !== null} disabled={actionLoading !== null}>
                {editingGuider ? 'Update Guider' : 'Create Guider'}
              </FormButton>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default GuidersManagementPage;
