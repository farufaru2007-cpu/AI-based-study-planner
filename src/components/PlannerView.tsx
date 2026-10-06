import React, { useState } from 'react';
import { Subject, StudyTask, PriorityLevel, DifficultyLevel, PerformanceRecord, UserProfile } from '../types';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  Calendar,
  Filter,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { calculateTaskHours } from '../services/aiEngine';

interface PlannerViewProps {
  user: UserProfile;
  subjects: Subject[];
  tasks: StudyTask[];
  performance: PerformanceRecord[];
  onSaveTask: (task: Omit<StudyTask, 'id' | 'userId' | 'createdAt'> & { id?: string }) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onBulkAddTasks: (newTasks: (Omit<StudyTask, 'id' | 'userId' | 'createdAt'> & { id?: string })[]) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  user,
  subjects,
  tasks,
  performance,
  onSaveTask,
  onDeleteTask,
  onToggleTask,
  onBulkAddTasks
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  // Form states
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [notes, setNotes] = useState('');

  const openAddModal = (initialDate?: string) => {
    setEditingTask(null);
    setSubjectId(subjects[0]?.id || '');
    setTopic('');
    setDate(initialDate || selectedDate);
    setStartTime('09:00');
    setEndTime('11:00');
    setPriority('Medium');
    setDifficulty('Medium');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: StudyTask) => {
    setEditingTask(task);
    setSubjectId(task.subjectId);
    setTopic(task.topic);
    setDate(task.date);
    setStartTime(task.startTime);
    setEndTime(task.endTime);
    setPriority(task.priority);
    setDifficulty(task.difficulty);
    setNotes(task.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !subjectId) return;

    onSaveTask({
      id: editingTask?.id,
      subjectId,
      topic: topic.trim(),
      date,
      startTime,
      endTime,
      priority,
      difficulty,
      status: editingTask?.status || 'pending',
      notes: notes.trim()
    });

    setIsModalOpen(false);
  };

  // AI Intelligent Study Schedule Generator
  const handleGenerateSmartSchedule = () => {
    if (subjects.length === 0) {
      alert('Please add at least one subject in the Subjects section first.');
      return;
    }

    // Rank subjects by priority, upcoming exam date, difficulty, and weak performance
    const rankedSubjects = [...subjects].map(s => {
      let score = 0;
      if (s.difficulty === 'Difficult') score += 30;
      else if (s.difficulty === 'Medium') score += 15;

      if (s.priority === 'High') score += 25;
      else if (s.priority === 'Medium') score += 10;

      // Check performance
      const perfs = performance.filter(p => p.subjectId === s.id);
      if (perfs.length > 0) {
        const avgPct =
          perfs.reduce((a, b) => a + (b.maximumMarks > 0 ? (b.marksObtained / b.maximumMarks) * 100 : 0), 0) /
          perfs.length;
        if (avgPct < 65) score += 35; // Weak subject gets big boost!
        else if (avgPct < s.targetMarks) score += 20;
      }

      // Check upcoming exam
      if (s.examDate) {
        const days = Math.ceil((new Date(s.examDate).getTime() - Date.now()) / 86400000);
        if (days >= 0 && days <= 7) score += 40;
        else if (days > 7 && days <= 14) score += 25;
      }

      return { subject: s, score };
    });

    rankedSubjects.sort((a, b) => b.score - a.score);

    // Generate 7-day schedule starting today
    const generatedTasks: (Omit<StudyTask, 'id' | 'userId' | 'createdAt'> & { id?: string })[] = [];
    const baseDate = new Date();

    const sampleTopics: Record<string, string[]> = {
      default: [
        'Core Fundamentals & Chapter Revision',
        'Important Problem Solving & Proofs',
        'Active Recall & High-Yield Summary Review',
        'Previous Year Exam Questions & Mock Drill',
        'Formula Sheet & Conceptual Checkpoints'
      ]
    };

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dayDate = new Date(baseDate.getTime() + dayOffset * 86400000);
      const dayStr = dayDate.toISOString().split('T')[0];

      // Pick top 2 priority subjects for each day
      const sub1 = rankedSubjects[dayOffset % rankedSubjects.length].subject;
      const sub2 = rankedSubjects[(dayOffset + 1) % rankedSubjects.length].subject;

      generatedTasks.push({
        subjectId: sub1.id,
        topic: `${sub1.subjectName} - Intensive Revision & Problem Sets`,
        date: dayStr,
        startTime: '09:30',
        endTime: '11:30',
        priority: 'High',
        difficulty: sub1.difficulty,
        status: 'pending',
        notes: 'AI generated: Prioritized due to high syllabus weightage and target gap.'
      });

      generatedTasks.push({
        subjectId: sub2.id,
        topic: `${sub2.subjectName} - Conceptual Drill & Notes Review`,
        date: dayStr,
        startTime: '15:00',
        endTime: '17:00',
        priority: 'Medium',
        difficulty: sub2.difficulty,
        status: 'pending',
        notes: 'AI generated: Spaced repetition retention block.'
      });
    }

    onBulkAddTasks(generatedTasks);
  };

  // Daily View Tasks
  const dailyTasks = tasks.filter(t => t.date === selectedDate);

  // Weekly View Dates
  const getWeekDates = (centerDateStr: string) => {
    const center = new Date(centerDateStr);
    const dayOfWeek = center.getDay(); // 0 is Sun
    const startSunday = new Date(center.getTime() - dayOfWeek * 86400000);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startSunday.getTime() + i * 86400000);
      return d.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates(selectedDate);

  const changeDateBy = (days: number) => {
    const current = new Date(selectedDate);
    const next = new Date(current.getTime() + days * 86400000);
    setSelectedDate(next.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-purple-600" />
            <span>Personalized Study Planner</span>
          </h1>
          <p className="text-xs text-slate-500">
            Intelligently organize daily study blocks prioritizing weak subjects, upcoming exams, and target goals
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleGenerateSmartSchedule}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            title="Auto distribute subjects prioritizing weak modules & upcoming exams"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Auto-Distribute 7-Day Plan</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Task</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
          />

          <button
            onClick={() => changeDateBy(1)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1.5 text-xs text-purple-700 hover:bg-purple-50 rounded-lg font-medium transition-colors"
          >
            Today
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'daily'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Schedule
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'weekly'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Overview
          </button>
        </div>
      </div>

      {/* DAILY VIEW */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">
              Tasks for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <span className="text-xs text-slate-500">
              {dailyTasks.length} task{dailyTasks.length !== 1 ? 's' : ''} ({dailyTasks.filter(t => t.status === 'completed').length} completed)
            </span>
          </div>

          {dailyTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-2xs">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-800">No study tasks planned for this day</p>
              <p className="text-xs text-slate-500 mt-1">
                Add a study task or use the AI Auto-Distribute button to populate an intelligent study plan.
              </p>
              <button
                onClick={() => openAddModal()}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium shadow-2xs"
              >
                + Plan Study Task
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dailyTasks.map(task => {
                const sub = subjects.find(s => s.id === task.subjectId);
                const isCompleted = task.status === 'completed';
                const durationHrs = calculateTaskHours(task.startTime, task.endTime);

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-4 transition-all flex items-start gap-4 ${
                      isCompleted
                        ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200/80 hover:border-purple-200 shadow-2xs'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center transition-colors border shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-purple-500 bg-white'
                      }`}
                      title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {isCompleted && <Check className="w-3 h-3" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {task.topic}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {task.startTime} – {task.endTime} ({durationHrs}h)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                        <span className="font-medium text-purple-700">{sub?.subjectName || 'General Subject'}</span>
                        <span>·</span>
                        <span className="capitalize">{task.difficulty} Difficulty</span>
                        <span>·</span>
                        <span className="capitalize">{task.priority} Priority</span>
                        {task.notes && (
                          <>
                            <span>·</span>
                            <span className="text-slate-400 italic truncate max-w-xs">{task.notes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 rounded"
                        title="Edit task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this study task?')) onDeleteTask(task.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* WEEKLY OVERVIEW */}
      {viewMode === 'weekly' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDates.map(dateStr => {
              const dayTasks = tasks.filter(t => t.date === dateStr);
              const dateObj = new Date(dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={dateStr}
                  className={`bg-white rounded-xl border p-3 min-h-[180px] flex flex-col justify-between ${
                    isSelected ? 'ring-2 ring-purple-400' : 'border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {dateObj.toLocaleDateString(undefined, { weekday: 'short' })}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isToday ? 'text-purple-700 underline' : 'text-slate-800'
                          }`}
                        >
                          {dateObj.getDate()} {dateObj.toLocaleDateString(undefined, { month: 'short' })}
                        </span>
                      </div>
                      <button
                        onClick={() => openAddModal(dateStr)}
                        className="w-5 h-5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 flex items-center justify-center text-xs"
                        title="Add task on this day"
                      >
                        +
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {dayTasks.map(t => {
                        const sub = subjects.find(s => s.id === t.subjectId);
                        const isDone = t.status === 'completed';
                        return (
                          <div
                            key={t.id}
                            onClick={() => onToggleTask(t.id)}
                            className={`p-1.5 rounded-lg text-[10px] cursor-pointer transition-colors border ${
                              isDone
                                ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                                : 'bg-purple-50/70 border-purple-200/70 text-purple-950 font-medium hover:bg-purple-100'
                            }`}
                            title={`Click to toggle: ${t.topic}`}
                          >
                            <p className="truncate font-semibold">{t.topic}</p>
                            <div className="flex items-center justify-between text-[9px] text-purple-700/80 mt-0.5">
                              <span>{sub?.subjectName || 'Subject'}</span>
                              <span>{t.startTime}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {dayTasks.length === 0 && (
                    <span className="text-[10px] text-slate-400 italic text-center py-4">No tasks</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">
                {editingTask ? 'Edit Study Task' : 'Add Study Session Task'}
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
                {subjects.length === 0 ? (
                  <p className="text-xs text-rose-600">
                    No subjects registered! Please add a subject first in the Subjects tab.
                  </p>
                ) : (
                  <select
                    required
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.subjectName} ({s.difficulty} difficulty)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Topic / Chapter Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dynamic Programming & Memoization"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Study Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Difficulty</label>
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
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Study Notes / Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Solve 10 previous year numericals"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                />
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
                  disabled={subjects.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium shadow-2xs disabled:opacity-50"
                >
                  {editingTask ? 'Update Task' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
