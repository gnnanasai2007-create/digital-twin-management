import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Cpu,
  Wrench,
  Eye,
  Grid,
  List,
  RefreshCw,
  Download,
  AlertOctagon,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Modal from '../components/Modal';
import { getStatusBadge } from '../utils/statusColors';
import { exportToCSV } from '../utils/exportUtils';

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [criticalityFilter, setCriticalityFilter] = useState('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    assetCode: '',
    type: 'PUMP',
    manufacturer: '',
    model: '',
    serialNumber: '',
    locationId: '',
    criticality: 'MEDIUM',
    description: '',
  });

  const { isManager, isAdmin } = useAuth();
  const { lastTelemetry } = useSocket();

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (locationFilter !== 'ALL') params.locationId = locationFilter;
      if (criticalityFilter !== 'ALL') params.criticality = criticalityFilter;

      const [assetsRes, locationsRes] = await Promise.all([
        api.get('/assets', { params }),
        api.get('/locations'),
      ]);

      if (assetsRes.data.success) setAssets(assetsRes.data.assets);
      if (locationsRes.data.success) setLocations(locationsRes.data.locations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [statusFilter, typeFilter, locationFilter, criticalityFilter]);

  // Live telemetry updates
  useEffect(() => {
    if (lastTelemetry) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === lastTelemetry.assetId
            ? { ...a, healthScore: lastTelemetry.healthScore, status: lastTelemetry.status }
            : a
        )
      );
    }
  }, [lastTelemetry]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAssets();
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assets', formData);
      setIsAddModalOpen(false);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create asset');
    }
  };

  const handleUpdateAsset = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/assets/${selectedAsset.id}`, formData);
      setIsEditModalOpen(false);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update asset');
    }
  };

  const handleDeleteAsset = async () => {
    try {
      await api.delete(`/assets/${selectedAsset.id}`);
      setIsDeleteModalOpen(false);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete asset');
    }
  };

  const openEdit = (asset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      assetCode: asset.assetCode,
      type: asset.type,
      manufacturer: asset.manufacturer,
      model: asset.model,
      serialNumber: asset.serialNumber,
      locationId: asset.locationId || '',
      criticality: asset.criticality,
      description: asset.description || '',
    });
    setIsEditModalOpen(true);
  };

  const openDelete = (asset) => {
    setSelectedAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const handleExportCSV = () => {
    const csvData = assets.map((a) => ({
      AssetCode: a.assetCode,
      Name: a.name,
      Type: a.type,
      Manufacturer: a.manufacturer,
      Model: a.model,
      Status: a.status,
      HealthScore: `${a.healthScore}%`,
      OperatingHours: a.operatingHours,
      Criticality: a.criticality,
      Location: a.location ? `${a.location.building} - ${a.location.name}` : 'N/A',
    }));
    exportToCSV('dtam_assets_inventory', csvData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <Boxes className="w-7 h-7 text-cyan-400" />
            ASSET INVENTORY MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Physical machinery registry with linked digital twin specifications
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg glass-panel hover:bg-slate-800 text-xs font-mono text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {isManager && (
            <button
              onClick={() => {
                setFormData({
                  name: '',
                  assetCode: '',
                  type: 'PUMP',
                  manufacturer: '',
                  model: '',
                  serialNumber: '',
                  locationId: locations[0]?.id || '',
                  criticality: 'MEDIUM',
                  description: '',
                });
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code, name, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">Status: All</option>
              <option value="HEALTHY">HEALTHY</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">Type: All</option>
              <option value="PUMP">Pump</option>
              <option value="CNC_MACHINE">CNC Machine</option>
              <option value="ELECTRIC_MOTOR">Electric Motor</option>
              <option value="COMPRESSOR">Compressor</option>
              <option value="GENERATOR">Generator</option>
              <option value="HVAC">HVAC Chiller</option>
              <option value="BOILER">Boiler</option>
              <option value="CONVEYOR">Conveyor</option>
              <option value="HYDRAULIC_PRESS">Hydraulic Press</option>
              <option value="COOLING_TOWER">Cooling Tower</option>
            </select>
          </div>

          {/* Criticality Filter */}
          <div>
            <select
              value={criticalityFilter}
              onChange={(e) => setCriticalityFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">Criticality: All</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-mono transition-colors ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-mono transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Asset Table / Grid View */}
      {viewMode === 'table' ? (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Health</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Criticality</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-500">
                      No assets found matching current filters.
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => {
                    const statusBadge = getStatusBadge(asset.status);
                    return (
                      <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-cyan-400">{asset.assetCode}</td>
                        <td className="py-3 px-4 text-slate-100 font-semibold">{asset.name}</td>
                        <td className="py-3 px-4 text-slate-400">{asset.type}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {asset.location ? asset.location.name : 'Unassigned'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{asset.healthScore}%</span>
                            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  asset.healthScore >= 80
                                    ? 'bg-emerald-400'
                                    : asset.healthScore >= 60
                                    ? 'bg-amber-400'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${asset.healthScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              asset.criticality === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : asset.criticality === 'HIGH'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {asset.criticality}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/assets/${asset.id}`}
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
                              title="View Asset Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              to={`/digital-twins?assetId=${asset.id}`}
                              className="p-1.5 rounded hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition-colors"
                              title="Launch 3D Digital Twin"
                            >
                              <Cpu className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              to={`/maintenance?assetId=${asset.id}`}
                              className="p-1.5 rounded hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
                              title="Schedule Maintenance"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </Link>
                            {isManager && (
                              <button
                                onClick={() => openEdit(asset)}
                                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                                title="Edit Asset Specs"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => openDelete(asset)}
                                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete Asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => {
            const statusBadge = getStatusBadge(asset.status);
            return (
              <div
                key={asset.id}
                className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-cyan-400">{asset.assetCode}</span>
                      <h3 className="text-base font-bold text-slate-100 mt-0.5">{asset.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{asset.manufacturer} • {asset.model}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px]">HEALTH SCORE</span>
                      <p className="text-sm font-bold text-slate-100">{asset.healthScore}%</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">HOURS</span>
                      <p className="text-sm font-bold text-slate-100">{Math.round(asset.operatingHours)} hrs</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono">
                  <span className="text-slate-400 text-[11px] truncate max-w-[140px]">
                    {asset.location?.name || 'Unassigned'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/digital-twins?assetId=${asset.id}`}
                      className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 flex items-center gap-1"
                    >
                      <Cpu className="w-3 h-3" />
                      <span>3D Twin</span>
                    </Link>
                    <Link
                      to={`/assets/${asset.id}`}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Asset Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Physical Asset">
        <form onSubmit={handleCreateAsset} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">Asset Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Centrifugal Feed Pump"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Asset Code *</label>
              <input
                type="text"
                required
                value={formData.assetCode}
                onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                placeholder="PUMP-011"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">Machinery Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="PUMP">Pump</option>
                <option value="CNC_MACHINE">CNC Machine</option>
                <option value="ELECTRIC_MOTOR">Electric Motor</option>
                <option value="COMPRESSOR">Compressor</option>
                <option value="GENERATOR">Generator</option>
                <option value="HVAC">HVAC Chiller</option>
                <option value="BOILER">Boiler</option>
                <option value="CONVEYOR">Conveyor</option>
                <option value="HYDRAULIC_PRESS">Hydraulic Press</option>
                <option value="COOLING_TOWER">Cooling Tower</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Criticality</label>
              <select
                value={formData.criticality}
                onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Manufacturer *</label>
              <input
                type="text"
                required
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Siemens"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Model *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="X-200"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Serial Number *</label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="SN-99214"
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Location</label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
            >
              <option value="">Unassigned</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.building} - {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Description / Notes</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Operational duty cycle and plant application details..."
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              Create Asset & Init Twin
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Asset Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Asset: ${selectedAsset?.assetCode}`}>
        <form onSubmit={handleUpdateAsset} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">Asset Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Criticality</label>
              <select
                value={formData.criticality}
                onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Location</label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
            >
              <option value="">Unassigned</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.building} - {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Asset Deletion">
        <div className="space-y-4 text-xs font-mono">
          <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-500/30 rounded-lg text-red-200">
            <AlertOctagon className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="font-bold">Are you sure you want to permanently delete {selectedAsset?.assetCode}?</p>
              <p className="text-[11px] text-red-400 mt-1">
                This will delete the physical record, its corresponding Digital Twin, sensor calibrations, and historical telemetry.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAsset}
              className="px-4 py-2 rounded font-bold bg-red-500 hover:bg-red-600 text-white"
            >
              Confirm Deletion
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
