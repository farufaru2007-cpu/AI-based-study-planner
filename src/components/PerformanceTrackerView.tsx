import React, { useState } from 'react';
import { Subject, PerformanceRecord } from '../types';
import { LineChart, Plus, Trash2, Edit2, Calendar, Award, CheckCircle2, TrendingUp, X, Sparkles } from 'lucide-react';
import { MarksTrendChart, BarChart } from './Charts';

interface PerformanceTrackerViewProps {
  subjects: Subject[];
  performance: PerformanceRecord[];
  onSavePerformance: (record: Omit<PerformanceRecord, 'id' | 'userId'> & { id?: string }) => void;
  onDeletePerformance: (recordId: string) => void;
}

export const PerformanceTrackerView: React.FC<PerformanceTrackerViewProps> = ({
  subjects,
  performance,
  onSavePerformance,
  onDeletePerformance
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PerformanceRecord | null>(null);

  // Form states
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [examName, setExamName] = useState('');
  const [marksObtained, setMarksObtained] = useState<number>(75);
  const [maximumMarks, setMaximumMarks] = useState<number>(100);
  const [attendancePercent, setAttendancePercent] = useState<number>(85);
  const [assignmentMarks, setAssignmentMarks] = useState<number>(18);
  const [internalMarks, setInternalMarks] = useState<number>(22);
  const [examDate, setExamDate] = useState(() => new Date().toISOString().split('T')[0]);

  const openAddModal = () => {
    setEditingRecord(null);
    setSubjectId(subjects[0]?.id || '');
    setExamName('');
    setMarksObtained(75);
    setMaximumMarks(100);
    setAttendancePercent(85);
    setAssignmentMarks(18);
    setInternalMarks(22);
    setExamDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (rec: PerformanceRecord) => {
    setEditingRecord(rec);
    setSubjectId(rec.subjectId);
    setExamName(rec.examName);
    setMarksObtained(rec.marksObtained);
    setMaximumMarks(rec.maximumMarks);
    setAttendancePercent(rec.attendancePercent || 85);
    setAssignmentMarks(rec.assignmentMarks || 18);
    setInternalMarks(rec.internalMarks || 22);
    setExamDate(rec.examDate);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !subjectId) return;

    onSavePerformance({
      id: editingRecord?.id,
      subjectId,
      examName: examName.trim(),
      marksObtained: Number(marksObtained),
      maximumMarks: Number(maximumMarks),
      attendancePercent: Number(attendancePercent),
      assignmentMarks: Number(assignmentMarks),
      internalMarks: Number(internalMarks),
      examDate
    });

    setIsModalOpen(false);
  };

  // Calculations
  const totalRecords = performance.length;
  const overallAverage =
    totalRecords > 0
      ? Math.round(
          (performance.reduce((acc, r) => acc + (r.maximumMarks > 0 ? (r.marksObtained / r.maximumMarks) * 100 : 0), 0) /
            totalRecords) *
            10
        ) / 10
      : 0;

  const overallAttendance =
    totalRecords > 0
      ? Math.round(
          (performance.reduce((acc, r) => acc + (r.attendancePercent || 0), 0) / totalRecords) * 10
        ) / 10
      : 0;

  // Chronological marks trend
  const sortedRecords = [...performance].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );
  const marksChartData = sortedRecords.map(r => ({
    label: r.examName,
    value: r.maximumMarks > 0 ? Math.round((r.marksObtained / r.maximumMarks) * 100) : 0,
    date: r.examDate
  }));

  // Subject averages
  const subjectAverages = subjects.map(s => {
    const sRecords = performance.filter(p => p.subjectId === s.id);
    const avg =
      sRecords.length > 0
        ? Math.round(
            (sRecords.reduce((acc, r) => acc + (r.maximumMarks > 0 ? (r.marksObtained / r.maximumMarks) * 100 : 0), 0) /
              sRecords.length) *
              10
          ) / 10
        : 0;
    return {
      label: s.subjectName,
      value: avg,
      color: avg >= 75 ? '#BBF7D0' : avg >= 60 ? '#BFDBFE' : '#FBCFE8'
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-purple-600" />
            <span>Academic Performance Tracker</span>
          </h1>
          <p className="text-xs text-slate-500">
            Log examination scores, quizzes, internal assessments, and attendance to feed the AI prediction engine
          </p>
        </div>

        <button
          onClick={openAddModal}
          disabled={subjects.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assessment Record</span>
        </button>
      </div>

      {subjects.length === 0 && (
        <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <p>
            You need to add at least one subject before logging exam marks. Go to the Subjects tab to add your courses.
          </p>
        </div>
      )}

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-pink-50/50 border border-pink-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-pink-800">Overall Academic Average</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{overallAverage}%</p>
          <span className="text-[10px] text-pink-700/80 block mt-1">Calculated across {totalRecords} tests</span>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-emerald-800">Mean Attendance Rate</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{overallAttendance}%</p>
          <span className="text-[10px] text-emerald-700/80 block mt-1">
            {overallAttendance >= 75 ? 'Meets university requirements' : 'Attendance shortfall warning'}
          </span>
        </div>

        <div className="bg-purple-50/50 border border-purple-200/70 rounded-xl p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-purple-800">Assessments Evaluated</span>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalRecords}</p>
          <span className="text-[10px] text-purple-700/80 block mt-1">
            {totalRecords >= 2 ? 'AI ML model active' : 'Need ≥ 2 records for ML training'}
          </span>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Chronological Marks Progression</h2>
          <p className="text-[11px] text-slate-500 mb-3">Score trends across successive examinations</p>
          <MarksTrendChart data={marksChartData} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Subject Performance Distribution</h2>
          <p className="text-[11px] text-slate-500 mb-3">Average percentage scored per enrolled subject</p>
          {subjectAverages.length > 0 ? (
            <BarChart data={subjectAverages} maxValue={100} valueLabel="%" />
          ) : (
            <div className="h-44 flex items-center justify-center text-xs text-slate-400">
              No subject performance data available
            </div>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Evaluated Examination Records</h2>
          <span className="text-xs text-slate-500">{totalRecords} total entries</span>
        </div>

        {performance.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            <Award className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No performance records added yet.</p>
            <p className="mt-1">Add your midterm, quiz, or internal marks to calculate analytics.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Exam / Test</th>
                  <th className="py-3 px-4">Marks Obtained</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Assignment</th>
                  <th className="py-3 px-4">Exam Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedRecords.map(rec => {
                  const sub = subjects.find(s => s.id === rec.subjectId);
                  const pct = rec.maximumMarks > 0 ? Math.round((rec.marksObtained / rec.maximumMarks) * 100) : 0;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {sub?.subjectName || 'Unknown Subject'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{rec.examName}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {rec.marksObtained} / {rec.maximumMarks}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            pct >= 75 ? 'text-emerald-700' : pct >= 60 ? 'text-blue-700' : 'text-rose-600'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{rec.attendancePercent || 80}%</td>
                      <td className="py-3 px-4 text-slate-600">{rec.assignmentMarks || 0}</td>
                      <td className="py-3 px-4 text-slate-500">{rec.examDate}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(rec)}
                            className="p-1 text-slate-400 hover:text-purple-600 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this assessment record?')) {
                                onDeletePerformance(rec.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">
                {editingRecord ? 'Edit Assessment Record' : 'Log New Assessment Performance'}
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Subject *</label>
                <select
                  required
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Test / Exam Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Assessment 1, Quiz 2, Lab Exam"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Marks Obtained *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={marksObtained}
                    onChange={e => setMarksObtained(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Maximum Marks *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maximumMarks}
                    onChange={e => setMaximumMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Attendance (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={attendancePercent}
                    onChange={e => setAttendancePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Assignment Marks</label>
                  <input
                    type="number"
                    min="0"
                    value={assignmentMarks}
                    onChange={e => setAssignmentMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Internal Marks</label>
                  <input
                    type="number"
                    min="0"
                    value={internalMarks}
                    onChange={e => setInternalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Exam Date *</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  />
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
                  {editingRecord ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
