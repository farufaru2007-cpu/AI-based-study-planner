import React, { useState } from 'react';
import { Subject, DifficultyLevel, PriorityLevel } from '../types';
import { BookOpen, Plus, Edit2, Trash2, Calendar, Target, AlertCircle, X, Check, Search } from 'lucide-react';

interface SubjectsViewProps {
  subjects: Subject[];
  onSaveSubject: (subject: Omit<Subject, 'id' | 'userId'> & { id?: string }) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onSaveSubject,
  onDeleteSubject
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | DifficultyLevel>('all');

  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [targetMarks, setTargetMarks] = useState(80);
  const [examDate, setExamDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [colorTheme, setColorTheme] = useState<'lavender' | 'blue' | 'pink' | 'green' | 'yellow'>('lavender');

  const openAddModal = () => {
    setEditingSubject(null);
    setSubjectName('');
    setDifficulty('Medium');
    setTargetMarks(80);
    setExamDate('');
    setPriority('Medium');
    setColorTheme('lavender');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectName(sub.subjectName);
    setDifficulty(sub.difficulty);
    setTargetMarks(sub.targetMarks);
    setExamDate(sub.examDate || '');
    setPriority(sub.priority);
    setColorTheme(sub.colorTheme || 'lavender');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    onSaveSubject({
      id: editingSubject?.id,
      subjectName: subjectName.trim(),
      difficulty,
      targetMarks: Number(targetMarks),
      examDate,
      priority,
      colorTheme
    });

    setIsModalOpen(false);
  };

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = difficultyFilter === 'all' || s.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const getThemeClasses = (theme?: string) => {
    switch (theme) {
      case 'blue':
        return { card: 'bg-blue-50/50 border-blue-200/70', badge: 'bg-blue-100 text-blue-800' };
      case 'pink':
        return { card: 'bg-pink-50/50 border-pink-200/70', badge: 'bg-pink-100 text-pink-800' };
      case 'green':
        return { card: 'bg-emerald-50/50 border-emerald-200/70', badge: 'bg-emerald-100 text-emerald-800' };
      case 'yellow':
        return { card: 'bg-amber-50/50 border-amber-200/70', badge: 'bg-amber-100 text-amber-800' };
      case 'lavender':
      default:
        return { card: 'bg-purple-50/50 border-purple-200/70', badge: 'bg-purple-100 text-purple-800' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span>Subject Management</span>
          </h1>
          <p className="text-xs text-slate-500">Configure academic subjects, syllabus difficulty ratings, and target marks</p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search enrolled subjects..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {(['all', 'Easy', 'Medium', 'Difficult'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                difficultyFilter === diff
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {diff === 'all' ? 'All Difficulties' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">
            {subjects.length === 0 ? 'No subjects registered yet' : 'No subjects matched your filter'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {subjects.length === 0
              ? 'Click the "Add Subject" button above to register your first subject.'
              : 'Try clearing your search keyword or switching the difficulty filter.'}
          </p>
          {subjects.length === 0 && (
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium"
            >
              + Register Subject Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map(sub => {
            const theme = getThemeClasses(sub.colorTheme);
            const daysLeft = sub.examDate
              ? Math.ceil((new Date(sub.examDate).getTime() - Date.now()) / 86400000)
              : null;

            return (
              <div
                key={sub.id}
                className={`rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between ${theme.card}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">{sub.subjectName}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-1 text-slate-400 hover:text-purple-600 rounded transition-colors"
                        title="Edit subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${sub.subjectName}? This will also delete associated study tasks.`)) {
                            onDeleteSubject(sub.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-700">{sub.difficulty} Difficulty</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{sub.priority} Priority</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-purple-600" />
                        Target Marks:
                      </span>
                      <span className="font-semibold text-slate-800">{sub.targetMarks}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        Exam Date:
                      </span>
                      <span className="font-medium text-slate-800">
                        {sub.examDate ? sub.examDate : 'Not scheduled'}
                      </span>
                    </div>
                  </div>
                </div>

                {daysLeft !== null && (
                  <div className="mt-4 pt-2 text-[11px] font-medium text-slate-600 flex items-center justify-between">
                    <span>Countdown:</span>
                    <span
                      className={`font-semibold ${
                        daysLeft < 0
                          ? 'text-slate-400'
                          : daysLeft <= 7
                          ? 'text-rose-600'
                          : daysLeft <= 21
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {daysLeft < 0 ? 'Concluded' : `${daysLeft} days remaining`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">
                {editingSubject ? 'Edit Subject' : 'Add New Academic Subject'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Difficult">Difficult</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Marks (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={targetMarks}
                    onChange={e => setTargetMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Exam Date (Optional)</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pastel Card Accent</label>
                <div className="flex gap-2">
                  {(['lavender', 'blue', 'pink', 'green', 'yellow'] as const).map(color => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setColorTheme(color)}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                        color === 'lavender'
                          ? 'bg-purple-100 border-purple-300'
                          : color === 'blue'
                          ? 'bg-blue-100 border-blue-300'
                          : color === 'pink'
                          ? 'bg-pink-100 border-pink-300'
                          : color === 'green'
                          ? 'bg-emerald-100 border-emerald-300'
                          : 'bg-amber-100 border-amber-300'
                      } ${colorTheme === color ? 'ring-2 ring-purple-600' : ''}`}
                    >
                      {colorTheme === color && <Check className="w-3.5 h-3.5 text-slate-700" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium shadow-2xs"
                >
                  {editingSubject ? 'Update Subject' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
