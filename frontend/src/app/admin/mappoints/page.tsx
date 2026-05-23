"use client";

import React, { useState, useEffect } from 'react';
import { AdminMapPointService, AdminTourismService, MapPoint, MapPointCreateDto, MapPointUpdateDto, Tourism } from '../../../services/admin.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRouter } from 'next/navigation';

const MapPointsManagementPage = () => {
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [tourisms, setTourisms] = useState<Tourism[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTourismId, setSelectedTourismId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMapPoint, setEditingMapPoint] = useState<MapPoint | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [formData, setFormData] = useState<MapPointCreateDto>({
    name: '', latitude: 0, longitude: 0, type: '', description: '', tourismPlaceId: undefined, active: true
  });

  const { token, role, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Match backend MapPointType enum: TOURISM_PLACE, HOTEL, ROAD
  const POINT_TYPES = [
    { value: 'TOURISM_PLACE', label: '🏞️ Tourism Place' },
    { value: 'HOTEL', label: '🏨 Hotel' },
    { value: 'ROAD', label: '🛣️ Road' }
  ];

  useEffect(() => {
    if (!isAuthenticated || role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadTourisms();
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (selectedTourismId) {
      loadMapPoints(selectedTourismId);
    } else {
      setMapPoints([]);
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

  const loadMapPoints = async (tourismId: number) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const pointsList = await AdminMapPointService.getMapPointsByTourism(token, tourismId);
      setMapPoints(pointsList || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load map points');
      setMapPoints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!token || !selectedTourismId) return;
    try {
      setActionLoading(-1);
      await AdminMapPointService.createMapPoint(token, { ...formData, tourismPlaceId: selectedTourismId });
      await loadMapPoints(selectedTourismId);
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert('Failed to create map point: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async () => {
    if (!token || !editingMapPoint || !selectedTourismId) return;
    try {
      setActionLoading(editingMapPoint.id);
      const updateData: MapPointUpdateDto = {
        name: formData.name, latitude: formData.latitude, longitude: formData.longitude,
        type: formData.type, description: formData.description, active: formData.active
      };
      await AdminMapPointService.updateMapPoint(token, editingMapPoint.id, updateData);
      await loadMapPoints(selectedTourismId);
      setShowModal(false);
      setEditingMapPoint(null);
      resetForm();
    } catch (err) {
      alert('Failed to update map point: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (mapPointId: number) => {
    if (!token || !selectedTourismId) return;
    if (!confirm('Are you sure you want to delete this map point?')) return;
    try {
      setActionLoading(mapPointId);
      await AdminMapPointService.deleteMapPoint(token, mapPointId);
      await loadMapPoints(selectedTourismId);
    } catch (err) {
      alert('Failed to delete map point: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (mapPoint: MapPoint) => {
    setEditingMapPoint(mapPoint);
    setFormData({
      name: mapPoint.name, latitude: mapPoint.latitude, longitude: mapPoint.longitude,
      type: mapPoint.type, description: mapPoint.description || '', active: mapPoint.active !== false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', latitude: 0, longitude: 0, type: '', description: '', tourismPlaceId: undefined, active: true });
    setEditingMapPoint(null);
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      TOURISM_PLACE: '🏞️', HOTEL: '🏨', ROAD: '🛣️'
    };
    return icons[type] || '📍';
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      TOURISM_PLACE: 'bg-green-100 text-green-800', 
      HOTEL: 'bg-blue-100 text-blue-800',
      ROAD: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getSelectedTourismName = () => {
    const tourism = tourisms.find(t => t.id === selectedTourismId);
    return tourism ? tourism.name : 'Select a tourism place';
  };

  const filteredMapPoints = mapPoints.filter(mp =>
    mp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mp.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || role !== 'ADMIN') {
    return <div className="p-8 text-center">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-200 admin-page">
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-6 rounded-xl shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors font-bold"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-bold">Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-black text-white mb-2">📍 Map Points Management</h1>
            <p className="text-blue-200 font-semibold">Manage geographic points of interest</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            disabled={!selectedTourismId}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-black shadow-lg"
          >+ Add Map Point</button>
        </div>
      </div>

      {/* Tourism Selector */}
      <div className="bg-amber-100 rounded-xl shadow-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-black text-gray-900 mb-1">Select Tourism Place</label>
            <select
              value={selectedTourismId || ''}
              onChange={(e) => setSelectedTourismId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 font-bold bg-white shadow-sm"
            >
              <option value="">-- Select a tourism place --</option>
              {tourisms.map(tourism => (
                <option key={tourism.id} value={tourism.id}>{tourism.name} ({tourism.wereda})</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Search map points..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md border-2 border-amber-300 rounded-lg px-4 py-2 font-bold bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Map Points Grid */}
      <div className="bg-amber-100 rounded-xl shadow-xl overflow-hidden">
        {!selectedTourismId ? (
          <div className="p-8 text-center text-gray-800 font-bold bg-white">
            <span className="text-4xl mb-4 block">📍</span>
            <p className="font-black">Please select a tourism place to view its map points</p>
          </div>
        ) : loading ? (
          <div className="p-8 text-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-800 font-bold">Loading map points...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-700 font-bold bg-white">
            <p>Error: {error}</p>
            <button onClick={() => selectedTourismId && loadMapPoints(selectedTourismId)} className="mt-4 bg-amber-200 text-amber-800 px-4 py-2 rounded-lg font-black shadow-md">Retry</button>
          </div>
        ) : filteredMapPoints.length === 0 ? (
          <div className="p-8 text-center text-gray-800 bg-white">
            <span className="text-4xl mb-4 block">📍</span>
            <p className="font-black">No map points found for {getSelectedTourismName()}</p>
            <button onClick={() => { resetForm(); setShowModal(true); }} className="mt-4 bg-amber-200 text-amber-800 px-4 py-2 rounded-lg font-black shadow-md">Add First Map Point</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredMapPoints.map((mp) => (
              <div key={mp.id} className="rounded-xl p-4 hover:shadow-xl transition-shadow bg-white shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getTypeIcon(mp.type)}</span>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{mp.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-black shadow-sm ${getTypeBadgeColor(mp.type)}`}>{mp.type}</span>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-black shadow-sm ${mp.active !== false ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}>
                          {mp.active !== false ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {mp.description && <p className="text-sm text-gray-800 font-bold mt-3 line-clamp-2">{mp.description}</p>}
                <div className="mt-3 p-2 bg-amber-50 rounded-lg text-xs text-gray-800 font-bold shadow-inner">
                  <div>📍 Lat: {mp.latitude.toFixed(6)}</div>
                  <div>📍 Lng: {mp.longitude.toFixed(6)}</div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button onClick={() => openEditModal(mp)} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-sm font-black hover:bg-blue-300 shadow-md">Edit</button>
                  <button onClick={() => handleDelete(mp.id)} disabled={actionLoading === mp.id} className="bg-red-200 text-red-800 px-3 py-1 rounded-lg text-sm font-black hover:bg-red-300 shadow-md disabled:opacity-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-gray-300 shadow-2xl">
            <div className="sticky top-0 bg-gray-100 border-b-2 border-gray-300 px-6 py-4">
              <h3 className="text-lg font-black">{editingMapPoint ? '✏️ Edit Map Point' : '➕ Add New Map Point'}</h3>
              <p className="text-sm text-gray-600 font-bold mt-1">Tourism Place: {getSelectedTourismName()}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-black text-gray-800 mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 font-semibold" required />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-800 mb-1">Type *</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 font-bold" required>
                  <option value="">Select type</option>
                  {POINT_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-800 mb-1">Latitude *</label>
                  <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })} className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 font-semibold" required />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-800 mb-1">Longitude *</label>
                  <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })} className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 font-semibold" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-800 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 font-semibold" rows={3} />
              </div>
              <div className="flex items-center border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
                <input 
                  type="checkbox" 
                  id="active" 
                  checked={formData.active !== false}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-400 rounded" 
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900 font-bold">Active (visible on map)</label>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-100 border-t-2 border-gray-300 px-6 py-4 flex justify-end space-x-3">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 text-gray-700 hover:text-gray-900 font-bold border-2 border-gray-400 rounded-lg">Cancel</button>
              <button onClick={editingMapPoint ? handleUpdate : handleCreate} disabled={actionLoading !== null || !formData.name || !formData.type} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 font-black border-2 border-blue-300">{editingMapPoint ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default MapPointsManagementPage;
