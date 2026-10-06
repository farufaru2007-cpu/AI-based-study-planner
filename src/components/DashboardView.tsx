import React from 'react';
import {
  BookOpen,
  Clock,
  Award,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Brain,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Sparkles,
  Check
} from 'lucide-react';
import { UserProfile, Subject, StudyTask, PerformanceRecord, AIAnalysisResult, NavigationPage } from '../types';
import { MarksTrendChart, BarChart, AttendanceGauge, TasksRatioDoughnut } from './Charts';
import { calculateTaskHours } from '../services/aiEngine';

interface DashboardViewProps {
  user: UserProfile;
  subjects: Subject[];
  tasks: StudyTask[];
  performance: PerformanceRecord[];
  aiAnalysis: AIAnalysisResult;
  onNavigate: (page: NavigationPage) => void;
  onToggleTask: (taskId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  subjects,
  tasks,
  performance,
  aiAnalysis,
  onNavigate,
  onToggleTask
}) => {
  const hasAnyData = subjects.length > 0 || tasks.length > 0 || performance.length > 0;

  // Compute summary stats
  const totalSubjects = subjects.length;
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  let totalStudyHours = 0;
  completedTasks.forEach(t => {
    totalStudyHours += calculateTaskHours(t.startTime, t.endTime);
  });
  totalStudyHours = Math.round(totalStudyHours * 10) / 10;

  const averageMarks =
    performance.length > 0
      ? Math.round(
          (performance.reduce((acc, r) => acc + (r.maximumMarks > 0 ? (r.marksObtained / r.maximumMarks) * 100 : 0), 0) /
            performance.length) *
            10
        ) / 10
      : 0;

  const averageAttendance =
    performance.length > 0
      ? Math.round(
          (performance.reduce((acc, r) => acc + (r.attendancePercent || 0), 0) / performance.length) * 10
        ) / 10
      : 0;

  // Today's schedule
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(t => t.date === todayStr);

  // Subject-wise performance bar data
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
      color:
        s.difficulty === 'Difficult'
          ? '#DDD6FE' // pastel lavender
          : s.difficulty === 'Medium'
          ? '#BFDBFE' // pastel blue
          : '#BBF7D0' // pastel green
    };
  });

  // Marks trend data
  const marksTrendData = [...performance]
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .map(p => ({
      label: p.examName,
      value: p.maximumMarks > 0 ? Math.round((p.marksObtained / p.maximumMarks) * 100) : 0,
      date: p.examDate
    }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border border-purple-100 rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-purple-200/60 text-purple-800 text-[11px] font-medium mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Academic Overview</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {user.course
              ? `${user.course} ${user.branch ? `· ${user.branch}` : ''} ${user.semester ? `· Sem ${user.semester}` : ''}`
              : 'Keep up with your personalized daily study plan and academic trajectory.'}
          </p>
        </div>

        {/* Quick actions right aligned */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('subjects')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
          <button
            onClick={() => onNavigate('planner')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 shadow-2xs transition-colors"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Plan Study</span>
          </button>
          <button
            onClick={() => onNavigate('tracker')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Log Test Marks</span>
          </button>
        </div>
      </div>

      {/* Empty State Banner when no study data exists */}
      {!hasAnyData && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-slate-800">No study data available yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add your subjects and performance data to get started with personalized AI recommendations and progress analytics.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('subjects')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium shadow-2xs"
            >
              Add Your First Subject
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
            >
              Complete Profile
            </button>
          </div>
        </div>
      )}

      {/* 8 Pastel Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Total Subjects - Pastel Blue */}
        <div className="bg-blue-50/60 border border-blue-200/70 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-blue-800">Total Subjects</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{totalSubjects}</p>
          <span className="text-[10px] text-blue-700/80 mt-1 block">Course modules active</span>
        </div>

        {/* Total Study Hours - Pastel Lavender */}
        <div className="bg-purple-50/60 border border-purple-200/70 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-purple-800">Study Completed</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{totalStudyHours} <span className="text-xs font-normal text-slate-500">hrs</span></p>
          <span className="text-[10px] text-purple-700/80 mt-1 block">Tracked study sessions</span>
        </div>

        {/* Average Marks - Pastel Pink */}
        <div className="bg-pink-50/60 border border-pink-200/70 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-pink-800">Average Marks</span>
            <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{averageMarks}%</p>
          <span className="text-[10px] text-pink-700/80 mt-1 block">
            Target: {user.targetMarksPercentage || 80}%
          </span>
        </div>

        {/* Attendance - Pastel Green */}
        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-800">Attendance</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CalendarCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{averageAttendance}%</p>
          <span className="text-[10px] text-emerald-700/80 mt-1 block">Institutional standard ≥ 75%</span>
        </div>

        {/* Completed Tasks - Pastel Green Accent */}
        <div className="bg-emerald-50/40 border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-700">Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{completedTasks.length}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Topics mastered</span>
        </div>

        {/* Pending Tasks - Pastel Yellow */}
        <div className="bg-amber-50/50 border border-amber-200/70 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-900">Pending Tasks</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{pendingTasks.length}</p>
          <span className="text-[10px] text-amber-800/80 mt-1 block">In progress or planned</span>
        </div>

        {/* Current Academic Status */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-700">Academic Trajectory</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-base font-bold text-slate-800 mt-2 capitalize">
            {aiAnalysis.performanceTrend === 'improving' ? '📈 Improving' : aiAnalysis.performanceTrend === 'declining' ? '📉 Needs Focus' : '➡️ Consistent'}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Slope: {aiAnalysis.trendSlope > 0 ? `+${aiAnalysis.trendSlope}` : aiAnalysis.trendSlope} pts
          </span>
        </div>

        {/* AI Performance Status */}
        <div className="bg-purple-50/40 border border-purple-200/60 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-purple-900">AI Risk Status</span>
            <Brain className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                aiAnalysis.riskLevel === 'High'
                  ? 'bg-rose-500'
                  : aiAnalysis.riskLevel === 'Moderate'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <p className="text-base font-bold text-slate-800">{aiAnalysis.riskLevel} Risk</p>
          </div>
          <span className="text-[10px] text-purple-800/80 mt-1 block truncate">
            {aiAnalysis.hasSufficientData ? `Projected: ${aiAnalysis.expectedPerformance}%` : 'Awaiting 2+ tests'}
          </span>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Study Schedule & Tasks Doughnut */}
        <div className="space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Today's Schedule</h2>
                <p className="text-[11px] text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <button
                onClick={() => onNavigate('planner')}
                className="text-[11px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-0.5"
              >
                <span>Full Planner</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {todaysTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-xs">
                <p>No study tasks scheduled for today.</p>
                <button
                  onClick={() => onNavigate('planner')}
                  className="mt-2 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium hover:bg-purple-100"
                >
                  + Add Today's Tasks
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaysTasks.map(task => {
                  const sub = subjects.find(s => s.id === task.subjectId);
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isDone
                          ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                          : 'bg-white border-slate-200/80 hover:border-purple-200 shadow-2xs'
                      }`}
                    >
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center transition-colors border ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 hover:border-purple-400'
                        }`}
                        title="Toggle completed"
                      >
                        {isDone && <Check className="w-3 h-3" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-medium truncate ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {task.topic}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {task.startTime} - {task.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                          <span className="text-purple-700 font-medium">{sub?.subjectName || 'General'}</span>
                          <span>·</span>
                          <span className="capitalize">{task.priority} priority</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tasks Distribution Doughnut */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Task Completion Ratio</h2>
            <p className="text-[11px] text-slate-500 mb-2">Completed versus pending study assignments</p>
            <TasksRatioDoughnut completed={completedTasks.length} pending={pendingTasks.length} />
          </div>

          {/* Attendance Gauge */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Attendance Tracking</h2>
            <p className="text-[11px] text-slate-500 mb-2">Classroom attendance percentage</p>
            <AttendanceGauge percentage={averageAttendance} />
          </div>
        </div>

        {/* Middle & Right Column: Analytical Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Marks Trend Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Academic Marks Trend</h2>
                <p className="text-[11px] text-slate-500">Historical performance progression over evaluated exams</p>
              </div>
              <button
                onClick={() => onNavigate('tracker')}
                className="text-[11px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-0.5"
              >
                <span>Add Record</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <MarksTrendChart data={marksTrendData} targetValue={user.targetMarksPercentage || 80} />
          </div>

          {/* Subject-wise Performance */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Subject-Wise Performance</h2>
                <p className="text-[11px] text-slate-500">Average score across courses and modules</p>
              </div>
              <button
                onClick={() => onNavigate('subjects')}
                className="text-[11px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-0.5"
              >
                <span>Manage Subjects</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            {subjects.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-xs">
                No subjects registered. Add subjects in the Subjects tab.
              </div>
            ) : (
              <BarChart
                data={subjectAverages}
                maxValue={100}
                valueLabel="%"
              />
            )}
          </div>

          {/* AI Quick Insight Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider">AI Diagnostic Highlight</h3>
                  <button
                    onClick={() => onNavigate('analyzer')}
                    className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold underline"
                  >
                    View ML Model
                  </button>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {aiAnalysis.hasSufficientData
                    ? `Ensemble regression predicts your current semester performance at approximately ${aiAnalysis.expectedPerformance}%. ${
                        aiAnalysis.weakSubjects.length > 0
                          ? `Diagnostic flag: review ${aiAnalysis.weakSubjects[0].subjectName}.`
                          : 'All monitored modules meet or exceed target benchmarks.'
                      }`
                    : 'Log at least 2 exam or test evaluation records in the Performance Tracker to activate predictive machine learning modeling.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
