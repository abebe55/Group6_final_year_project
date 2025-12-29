"use client";

import React, { useState, useEffect } from 'react';
import { AdminHorseServiceService, AdminRoadService, AdminTourismService, HorseService, HorseServiceCreateDto, HorseServiceUpdateDto, Road, Tourism } from '../../../services/admin.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRouter } from 'next/navigation';

const HorseServicesManagementPage = () => {
  const [horseServices, setHorseServices] = useState<HorseService[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [tourisms, setTourisms] = useState<Tourism[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTourismId, setSelectedTourismId] = useState<number | null>(null);
  const [selectedRoadId, setSelectedRoadId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<HorseService | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [formData, setFormData] = useState<HorseServiceCreateDto>({
    ownerName: '', contactInfo: '', initialPlace: '', cost: 0, roadInfoId: 0
  });

  const { token, role, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadTourisms();
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (selectedTourismId) {
      loadRoads(selectedTourismId);
    } else {
      setRoads([]);
      setSelectedRoadId(null);
    }
  }, [selectedTourismId]);

  useEffect(() => {
    if (selectedRoadId) {
      loadHorseServices(selectedRoadId);
    } else {
      setHorseServices([]);
    }
  }, [selectedRoadId]);

  const loadTourisms = async () => {
    if (!token) return;
    try {
      const response = await AdminTourismService.getAllTourism(token, 0, 100);
      setTourisms(response.content || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load tourisms:', err);
      setLoading(false);
    }
  };

  const loadRoads = async (tourismId: number) => {
    if (!token) return;
    try {
      const roadsList = await AdminRoadService.getRoadsByTourism(token, tourismId);
      setRoads(roadsList || []);
      if (roadsList && roadsList.length > 0) {
        setSelectedRoadId(roadsList[0].id);
      } else {
        setSelectedRoadId(null);
      }
    } catch (err) {
      console.error('Failed to load roads:', err);
      setRoads([]);
    }
  };

  const loadHorseServices = async (roadId: number) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const services = await AdminHorseServiceService.getHorseServicesByRoad(token, roadId);
      setHorseServices(services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load horse services');
      setHorseServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!token || !selectedRoadId) return;
    try {
      setActionLoading(-1);
      await AdminHorseServiceService.createHorseService(token, { ...formData, roadInfoId: selectedRoadId });
      await loadHorseServices(selectedRoadId);
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert('Failed to create horse service: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async () => {
    if (!token || !editingService || !selectedRoadId) return;
    try {
      setActionLoading(editingService.id);
      const updateData: HorseServiceUpdateDto = {
        ownerName: formData.ownerName, contactInfo: formData.contactInfo,
        initialPlace: formData.initialPlace, cost: formData.cost, roadInfoId: selectedRoadId
      };
      await AdminHorseServiceService.updateHorseService(token, editingService.id, updateData);
      await loadHorseServices(selectedRoadId);
      setShowModal(false);
      setEditingService(null);
      resetForm();
    } catch (err) {
      alert('Failed to update horse service: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (!token || !selectedRoadId) return;
    if (!confirm('Are you sure you want to delete this horse service?')) return;
    try {
      setActionLoading(serviceId);
      await AdminHorseServiceService.deleteHorseService(token, serviceId);
      await loadHorseServices(selectedRoadId);
    } catch (err) {
      alert('Failed to delete horse service: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (service: HorseService) => {
    setEditingService(service);
    setFormData({
      ownerName: service.ownerName, contactInfo: service.contactInfo,
      initialPlace: service.initialPlace, cost: service.cost, roadInfoId: service.roadInfoId || selectedRoadId || 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ ownerName: '', contactInfo: '', initialPlace: '', cost: 0, roadInfoId: selectedRoadId || 0 });
    setEditingService(null);
  };

  const getSelectedRoadName = () => {
    const road = roads.find(r => r.id === selectedRoadId);
    return road ? road.name : 'Select a road';
  };

  const filteredServices = horseServices.filter(service =>
    service.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.initialPlace?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.contactInfo?.includes(searchTerm)
  );

  if (!isAuthenticated || role !== 'ADMIN') {
    return <div className="p-8 text-center">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Horse Services Management</h1>
          <p className="text-gray-600">Manage horse rental and transportation services</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          disabled={!selectedRoadId}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >+ Add Horse Service</button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tourism Place</label>
            <select
              value={selectedTourismId || ''}
              onChange={(e) => setSelectedTourismId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            >
              <option value="">-- Select tourism place --</option>
              {tourisms.map(tourism => (
                <option key={tourism.id} value={tourism.id}>{tourism.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Road</label>
            <select
              value={selectedRoadId || ''}
              onChange={(e) => setSelectedRoadId(e.target.value ? parseInt(e.target.value) : null)}
              disabled={!selectedTourismId || roads.length === 0}
              className="w-full border border-gray-300 rounded-md px-4 py-2 disabled:opacity-50"
            >
              <option value="">-- Select road --</option>
              {roads.map(road => (
                <option key={road.id} value={road.id}>{road.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by owner, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
        </div>
      </div>

      {/* Horse Services Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {!selectedRoadId ? (
          <div className="p-8 text-center text-gray-600">
            <span className="text-4xl mb-4 block">🐎</span>
            <p>Please select a tourism place and road to view horse services</p>
          </div>
        ) : loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading horse services...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>Error: {error}</p>
            <button onClick={() => selectedRoadId && loadHorseServices(selectedRoadId)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">Retry</button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <span className="text-4xl mb-4 block">🐎</span>
            <p>No horse services found for {getSelectedRoadName()}</p>
            <button onClick={() => { resetForm(); setShowModal(true); }} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">Add First Horse Service</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center">
                  <span className="text-6xl">🐎</span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{service.ownerName}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>📍 {service.initialPlace}</p>
                    <p>📞 {service.contactInfo}</p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 text-lg font-bold text-green-700 bg-green-100 rounded-full">${service.cost}</span>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={() => openEditModal(service)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    <button onClick={() => handleDelete(service.id)} disabled={actionLoading === service.id} className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50">Delete</button>
                  </div>
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
            <h3 className="text-lg font-semibold mb-4">{editingService ? 'Edit Horse Service' : 'Add New Horse Service'}</h3>
            <p className="text-sm text-gray-500 mb-4">Road: {getSelectedRoadName()}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                <input type="text" value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info *</label>
                <input type="text" value={formData.contactInfo} onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Phone number" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Place *</label>
                <input type="text" value={formData.initialPlace} onChange={(e) => setFormData({ ...formData, initialPlace: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Starting location" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($) *</label>
                <input type="number" step="0.01" min="0" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={editingService ? handleUpdate : handleCreate} disabled={actionLoading !== null || !formData.ownerName || !formData.contactInfo || !formData.initialPlace} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{editingService ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorseServicesManagementPage;
