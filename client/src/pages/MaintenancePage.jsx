import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertOctagon,
  User,
  DollarSign,
  Layers,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { getPriorityBadge } from '../utils/statusColors';
import { formatDate, formatCurrency } from '../utils/formatters';

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    assetId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    scheduledDate: new Date().toISOString().split('T')[0],
    assignedToId: '',
    cost: 0,
    notes: '',
    replacedComponents: '',
  });

  const { isTech, isManager } = useAuth();

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;

      const [maintRes, assetsRes, usersRes] = await Promise.all([
        api.get('/maintenance', { params }),
        api.get('/assets'),
        api.get('/auth/users'),
      ]);

      if (maintRes.data.success) setMaintenances(maintRes.data.maintenances);
      if (assetsRes.data.success) setAssets(assetsRes.data.assets);
      if (usersRes.data.success) setUsers(usersRes.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, [statusFilter, priorityFilter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        cost: Number(formData.cost),
        replacedComponents: formData.replacedComponents
          ? formData.replacedComponents.split(',').map((s) => s.trim())
          : [],
      };
      await api.post('/maintenance', payload);
      setIsCreateModalOpen(false);
      fetchMaintenanceData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create maintenance task');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        cost: Number(formData.cost),
        replacedComponents: formData.replacedComponents
          ? typeof formData.replacedComponents === 'string'
            ? formData.replacedComponents.split(',').map((s) => s.trim())
            : formData.replacedComponents
          : [],
      };
      await api.put(`/maintenance/${selectedTask.id}`, payload);
      if (formData.status === 'COMPLETED' && selectedTask.status !== 'COMPLETED') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
      setIsUpdateModalOpen(false);
      fetchMaintenanceData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update maintenance task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (confirm('Delete this maintenance record?')) {
      try {
        await api.delete(`/maintenance/${id}`);
        fetchMaintenanceData();
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  const openUpdateModal = (task) => {
    setSelectedTask(task);
    let replacedStr = '';
    try {
      if (task.replacedComponents) {
        const parsed = JSON.parse(task.replacedComponents);
        replacedStr = Array.isArray(parsed) ? parsed.join(', ') : parsed;
      }
    } catch {}

    setFormData({
      assetId: task.assetId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      scheduledDate: task.scheduledDate ? task.scheduledDate.split('T')[0] : '',
      assignedToId: task.assignedToId || '',
      cost: task.cost || 0,
      notes: task.notes || '',
      replacedComponents: replacedStr,
    });
    setIsUpdateModalOpen(true);
  };

  const kanbanColumns = [
    { key: 'SCHEDULED', title: 'Scheduled', icon: Calendar, border: 'border-cyan-500/30' },
    { key: 'IN_PROGRESS', title: 'In Progress', icon: Clock, border: 'border-amber-500/30' },
    { key: 'COMPLETED', title: 'Completed', icon: CheckCircle, border: 'border-emerald-500/30' },
    { key: 'OVERDUE', title: 'Overdue Alarms', icon: AlertOctagon, border: 'border-red-500/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <Wrench className="w-7 h-7 text-cyan-400" />
            MAINTENANCE & WORK ORDER HUB
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Preventive work orders, automated failure alerts, technician logs & spare parts tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isTech && (
            <button
              onClick={() => {
                setFormData({
                  assetId: assets[0]?.id || '',
                  title: '',
                  description: '',
                  priority: 'MEDIUM',
                  status: 'SCHEDULED',
                  scheduledDate: new Date().toISOString().split('T')[0],
                  assignedToId: users.find((u) => u.role === 'TECHNICIAN')?.id || '',
                  cost: 250,
                  notes: '',
                  replacedComponents: '',
                });
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Work Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">Status: All</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">Priority: All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              viewMode === 'kanban' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kanbanColumns.map((col) => {
            const colTasks = maintenances.filter((m) => m.status === col.key);
            const Icon = col.icon;

            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
                      {col.title}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[300px]">
                  {colTasks.length === 0 ? (
                    <div className="p-6 text-center text-slate-600 text-xs font-mono border border-dashed border-slate-800 rounded-xl">
                      No tasks in this lane
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const priorityBadge = getPriorityBadge(task.priority);
                      return (
                        <div
                          key={task.id}
                          onClick={() => isTech && openUpdateModal(task)}
                          className={`glass-panel p-4 rounded-xl border hover:border-cyan-500/40 cursor-pointer transition-all space-y-3 ${col.border}`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-[10px] font-mono font-bold text-cyan-400">
                              {task.asset?.assetCode}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${priorityBadge.bg} ${priorityBadge.text} ${priorityBadge.border}`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-100 leading-snug">{task.title}</h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{task.description}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-500" />
                              {task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}
                            </span>
                            <span className="text-slate-300 font-bold">{formatCurrency(task.cost)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-slate-400 border-b border-slate-800 bg-slate-900/60">
                <tr>
                  <th className="py-3 px-4">Task Title</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {maintenances.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-100">{task.title}</td>
                    <td className="py-3 px-4 text-cyan-400">{task.asset?.assetCode}</td>
                    <td className="py-3 px-4">{task.priority}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(task.scheduledDate)}</td>
                    <td className="py-3 px-4">{task.assignedTo?.name || 'Unassigned'}</td>
                    <td className="py-3 px-4 font-bold">{formatCurrency(task.cost)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isTech && (
                        <button
                          onClick={() => openUpdateModal(task)}
                          className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Maintenance Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Maintenance Work Order">
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">Target Physical Asset *</label>
              <select
                required
                value={formData.assetId}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="">Select Asset...</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetCode} - {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Re-pack bearings & thermal inspection"
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Description *</label>
            <textarea
              rows="3"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed mechanical steps and safety isolation procedures..."
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Scheduled Date *</label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Assigned Technician</label>
              <select
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Estimated Cost ($)</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            >
              Dispatch Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Maintenance Modal */}
      <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title="Update Work Order Status">
        <form onSubmit={handleUpdateTask} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">Lifecycle Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-bold"
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Actual Incurred Cost ($)</label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Replaced Components (Comma separated)</label>
            <input
              type="text"
              value={formData.replacedComponents}
              onChange={(e) => setFormData({ ...formData, replacedComponents: e.target.value })}
              placeholder="Drive End Bearing, Carbon Seal, Nitrile O-Ring"
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Technician Closeout Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Clearances verified, vibration restored to < 2.0 mm/s..."
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            {isManager && (
              <button
                type="button"
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="px-3 py-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                Delete
              </button>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
              >
                Update Task
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
