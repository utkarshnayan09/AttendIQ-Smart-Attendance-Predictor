import { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Check,
  Filter,
  AlertTriangle,
  CheckCircle,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateAttendancePercentage } from '../utils/calculations';
import ImportPortalModal from '../components/ImportPortalModal';

type FilterMode = 'all' | 'safe' | 'danger';

interface SubjectFormData {
  name: string;
  totalClasses: string;
  attendedClasses: string;
}

const emptyForm: SubjectFormData = { name: '', totalClasses: '', attendedClasses: '' };

export default function SubjectsPage() {
  const { subjects, addSubject, updateSubject, deleteSubject, settings, addNotification } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<SubjectFormData>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterMode === 'all') return true;
      const pct = calculateAttendancePercentage(s.attendedClasses, s.totalClasses);
      if (filterMode === 'safe') return pct >= settings.attendanceTarget;
      return pct < settings.attendanceTarget;
    });
  }, [subjects, searchQuery, filterMode, settings.attendanceTarget]);

  const validateForm = (): boolean => {
    const errors: Partial<SubjectFormData> = {};
    if (!formData.name.trim()) errors.name = 'Subject name is required';
    const total = parseInt(formData.totalClasses);
    const attended = parseInt(formData.attendedClasses);
    if (isNaN(total) || total < 0) errors.totalClasses = 'Enter a valid number';
    if (isNaN(attended) || attended < 0) errors.attendedClasses = 'Enter a valid number';
    if (!isNaN(total) && !isNaN(attended) && attended > total)
      errors.attendedClasses = 'Cannot exceed total classes';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    addSubject({
      name: formData.name.trim(),
      totalClasses: parseInt(formData.totalClasses),
      attendedClasses: parseInt(formData.attendedClasses),
    });
    addNotification('success', `${formData.name.trim()} added successfully!`);
    setShowAddModal(false);
    setFormData(emptyForm);
    setFormErrors({});
  };

  const handleEdit = (id: string) => {
    const subject = subjects.find((s) => s.id === id);
    if (!subject) return;
    setEditingId(id);
    setFormData({
      name: subject.name,
      totalClasses: subject.totalClasses.toString(),
      attendedClasses: subject.attendedClasses.toString(),
    });
    setFormErrors({});
  };

  const handleSaveEdit = () => {
    if (!editingId || !validateForm()) return;
    updateSubject(editingId, {
      name: formData.name.trim(),
      totalClasses: parseInt(formData.totalClasses),
      attendedClasses: parseInt(formData.attendedClasses),
    });
    addNotification('success', `${formData.name.trim()} updated successfully!`);
    setEditingId(null);
    setFormData(emptyForm);
    setFormErrors({});
  };

  const handleDelete = (id: string) => {
    const subject = subjects.find((s) => s.id === id);
    deleteSubject(id);
    addNotification('success', `${subject?.name || 'Subject'} deleted.`);
    setDeleteConfirmId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormErrors({});
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent-blue" />
            My Subjects
          </h1>
          <p className="text-dark-400 mt-1">{subjects.length} subjects total</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary"
            title="Import attendance table from college student portal"
          >
            <Upload className="w-4 h-4 text-accent-blue" />
            Import from Portal
          </button>
          <button
            onClick={() => {
              setShowAddModal(true);
              setFormData(emptyForm);
              setFormErrors({});
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'safe', 'danger'] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                filterMode === mode
                  ? mode === 'safe'
                    ? 'bg-accent-green/15 text-accent-green border border-accent-green/30'
                    : mode === 'danger'
                    ? 'bg-accent-red/15 text-accent-red border border-accent-red/30'
                    : 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30'
                  : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-500'
              }`}
            >
              {mode === 'all' ? (
                <span className="flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" /> All</span>
              ) : mode === 'safe' ? (
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Safe</span>
              ) : (
                <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> At Risk</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {subjects.length === 0 && (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No subjects yet</h3>
          <p className="text-dark-400 mb-6">Add your first subject to start tracking attendance.</p>
          <button
            onClick={() => {
              setShowAddModal(true);
              setFormData(emptyForm);
              setFormErrors({});
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      )}

      {/* Subject Cards */}
      {filteredSubjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => {
            const pct = calculateAttendancePercentage(subject.attendedClasses, subject.totalClasses);
            const isSafe = pct >= settings.attendanceTarget;
            const isEditing = editingId === subject.id;

            if (isEditing) {
              return (
                <div key={subject.id} className="glass-card p-5 border-accent-blue/30">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-dark-400 mb-1 block">Subject Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                      />
                      {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-dark-400 mb-1 block">Total Classes</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.totalClasses}
                          onChange={(e) => setFormData({ ...formData, totalClasses: e.target.value })}
                          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                        />
                        {formErrors.totalClasses && <p className="text-red-400 text-xs mt-1">{formErrors.totalClasses}</p>}
                      </div>
                      <div>
                        <label className="text-xs text-dark-400 mb-1 block">Attended</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.attendedClasses}
                          onChange={(e) => setFormData({ ...formData, attendedClasses: e.target.value })}
                          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                        />
                        {formErrors.attendedClasses && <p className="text-red-400 text-xs mt-1">{formErrors.attendedClasses}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleSaveEdit} className="btn-primary flex-1 text-xs py-2">
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                      <button onClick={cancelEdit} className="btn-secondary flex-1 text-xs py-2">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={subject.id} className="glass-card-hover p-5 relative group">
                {/* Delete Confirmation Overlay */}
                {deleteConfirmId === subject.id && (
                  <div className="absolute inset-0 bg-dark-900/95 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center p-4">
                    <div className="text-center">
                      <Trash2 className="w-8 h-8 text-accent-red mx-auto mb-3" />
                      <p className="text-white text-sm font-medium mb-1">Delete {subject.name}?</p>
                      <p className="text-dark-400 text-xs mb-4">This action cannot be undone.</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="px-4 py-2 bg-accent-red text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-4 py-2 bg-dark-700 text-white text-xs font-medium rounded-lg hover:bg-dark-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-semibold truncate">{subject.name}</h3>
                    <p className="text-dark-400 text-sm mt-0.5">
                      {subject.attendedClasses} / {subject.totalClasses} classes
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(subject.id)}
                      className="p-1.5 text-dark-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(subject.id)}
                      className="p-1.5 text-dark-400 hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full h-2.5 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isSafe ? 'bg-accent-green' : 'bg-accent-red'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${isSafe ? 'text-accent-green' : 'text-accent-red'}`}>
                    {pct.toFixed(1)}%
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      isSafe
                        ? 'bg-accent-green/10 text-accent-green'
                        : 'bg-accent-red/10 text-accent-red'
                    }`}
                  >
                    {isSafe ? 'Safe' : 'At Risk'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results from filter */}
      {subjects.length > 0 && filteredSubjects.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Search className="w-12 h-12 mx-auto text-dark-600 mb-3" />
          <p className="text-dark-400">No subjects match your search or filter.</p>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-md animate-fade-in border-dark-600/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Add New Subject</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormErrors({});
                }}
                className="p-1 text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-300 mb-1.5 block">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
                />
                {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-300 mb-1.5 block">Total Classes</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.totalClasses}
                    onChange={(e) => setFormData({ ...formData, totalClasses: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
                  />
                  {formErrors.totalClasses && <p className="text-red-400 text-xs mt-1">{formErrors.totalClasses}</p>}
                </div>
                <div>
                  <label className="text-sm text-dark-300 mb-1.5 block">Classes Attended</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.attendedClasses}
                    onChange={(e) => setFormData({ ...formData, attendedClasses: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
                  />
                  {formErrors.attendedClasses && <p className="text-red-400 text-xs mt-1">{formErrors.attendedClasses}</p>}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} className="btn-primary flex-1">
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormErrors({});
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* College Portal Import Modal */}
      <ImportPortalModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}
