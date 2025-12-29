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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Map Points Management</h1>
          <p className="text-gray-600">Manage geographic points of interest</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          disabled={!selectedTourismId}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >+ Add Map Point</button>
      </div>

      {/* Tourism Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Tourism Place</label>
            <select
              value={selectedTourismId || ''}
              onChange={(e) => setSelectedTourismId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
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
            className="flex-1 max-w-md border border-gray-300 rounded-md px-4 py-2"
          />
        </div>
      </div>

      {/* Map Points Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {!selectedTourismId ? (
          <div className="p-8 text-center text-gray-600">
            <span className="text-4xl mb-4 block">📍</span>
            <p>Please select a tourism place to view its map points</p>
          </div>
        ) : loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading map points...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>Error: {error}</p>
            <button onClick={() => selectedTourismId && loadMapPoints(selectedTourismId)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">Retry</button>
          </div>
        ) : filteredMapPoints.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <span className="text-4xl mb-4 block">📍</span>
            <p>No map points found for {getSelectedTourismName()}</p>
            <button onClick={() => { resetForm(); setShowModal(true); }} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">Add First Map Point</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredMapPoints.map((mp) => (
              <div key={mp.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getTypeIcon(mp.type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mp.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeBadgeColor(mp.type)}`}>{mp.type}</span>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${mp.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {mp.active !== false ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {mp.description && <p className="text-sm text-gray-600 mt-3 line-clamp-2">{mp.description}</p>}
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  <div>📍 Lat: {mp.latitude.toFixed(6)}</div>
                  <div>📍 Lng: {mp.longitude.toFixed(6)}</div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button onClick={() => openEditModal(mp)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button onClick={() => handleDelete(mp.id)} disabled={actionLoading === mp.id} className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingMapPoint ? 'Edit Map Point' : 'Add New Map Point'}</h3>
            <p className="text-sm text-gray-500 mb-4">Tourism Place: {getSelectedTourismName()}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2" required>
                  <option value="">Select type</option>
                  {POINT_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                  <input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                  <input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2" rows={3} />
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="active" 
                  checked={formData.active !== false}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">Active (visible on map)</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={editingMapPoint ? handleUpdate : handleCreate} disabled={actionLoading !== null || !formData.name || !formData.type} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{editingMapPoint ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPointsManagementPage;
