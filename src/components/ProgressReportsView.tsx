import React from 'react';
import { UserProfile, Subject, StudyTask, PerformanceRecord, AIAnalysisResult } from '../types';
import { generateDynamicRecommendations, calculateTaskHours } from '../services/aiEngine';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Award,
  BookOpen,
  CalendarCheck,
  BrainCircuit,
  GraduationCap
} from 'lucide-react';

interface ProgressReportsViewProps {
  user: UserProfile;
  subjects: Subject[];
  tasks: StudyTask[];
  performance: PerformanceRecord[];
  analysis: AIAnalysisResult;
}

export const ProgressReportsView: React.FC<ProgressReportsViewProps> = ({
  user,
  subjects,
  tasks,
  performance,
  analysis
}) => {
  const recommendations = generateDynamicRecommendations(user, subjects, tasks, performance, analysis);

  // Compute stats
  const completedTasks = tasks.filter(t => t.status === 'completed');
  let totalStudyHours = 0;
  completedTasks.forEach(t => {
    totalStudyHours += calculateTaskHours(t.startTime, t.endTime);
  });
  totalStudyHours = Math.round(totalStudyHours * 10) / 10;

  const avgMarks =
    performance.length > 0
      ? Math.round(
          (performance.reduce((acc, r) => acc + (r.maximumMarks > 0 ? (r.marksObtained / r.maximumMarks) * 100 : 0), 0) /
            performance.length) *
            10
        ) / 10
      : 0;

  const avgAttendance =
    performance.length > 0
      ? Math.round(
          (performance.reduce((acc, r) => acc + (r.attendancePercent || 0), 0) / performance.length) * 10
        ) / 10
      : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (performance.length === 0) {
      alert('No performance data available to export.');
      return;
    }

    const headers = ['Subject', 'Exam Name', 'Marks Obtained', 'Maximum Marks', 'Percentage', 'Attendance %', 'Assignment Marks', 'Exam Date'];
    const rows = performance.map(r => {
      const sub = subjects.find(s => s.id === r.subjectId)?.subjectName || 'N/A';
      const pct = r.maximumMarks > 0 ? Math.round((r.marksObtained / r.maximumMarks) * 100) : 0;
      return [
        `"${sub.replace(/"/g, '""')}"`,
        `"${r.examName.replace(/"/g, '""')}"`,
        r.marksObtained,
        r.maximumMarks,
        `${pct}%`,
        `${r.attendancePercent || 0}%`,
        r.assignmentMarks || 0,
        r.examDate
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Academic_Performance_Report_${user.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      studentProfile: {
        name: user.name,
        email: user.email,
        course: user.course,
        branch: user.branch,
        year: user.year,
        semester: user.semester,
        college: user.college,
        targetMarksPercentage: user.targetMarksPercentage,
        targetCGPA: user.targetCGPA
      },
      summary: {
        totalSubjects: subjects.length,
        totalStudyHours,
        averageMarks: avgMarks,
        attendanceRate: avgAttendance,
        completedTasks: completedTasks.length,
        pendingTasks: tasks.length - completedTasks.length
      },
      aiModelOutputs: {
        expectedPerformance: analysis.expectedPerformance,
        trend: analysis.performanceTrend,
        trendSlope: analysis.trendSlope,
        riskLevel: analysis.riskLevel,
        weakSubjects: analysis.weakSubjects,
        strongSubjects: analysis.strongSubjects,
        suggestedWeeklyHours: analysis.suggestedWeeklyStudyHours
      },
      subjects,
      performance
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Academic_Audit_Report_${user.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
            <span>Academic Progress Reports</span>
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive printable academic audit synthesizing performance marks, attendance, and ML predictions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-700 mb-1">
              <GraduationCap className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-wider">Comprehensive Student Academic Audit</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {user.course || 'Degree Program'} {user.branch ? `· ${user.branch}` : ''}{' '}
              {user.semester ? `· Semester ${user.semester}` : ''} {user.college ? `| ${user.college}` : ''}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <span className="block font-medium text-slate-700">Audit Date</span>
            <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="block text-[11px] text-slate-400 mt-1">Student ID: {user.id}</span>
          </div>
        </div>

        {/* Section 1: Executive Academic Metrics */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">1. Executive Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
              <span className="text-purple-800 font-medium block">Evaluation Average</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{avgMarks}%</span>
              <span className="text-[10px] text-purple-700">Target: {user.targetMarksPercentage || 80}%</span>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100">
              <span className="text-blue-800 font-medium block">Tracked Study Hours</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{totalStudyHours} hrs</span>
              <span className="text-[10px] text-blue-700">{completedTasks.length} topics cleared</span>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
              <span className="text-emerald-800 font-medium block">Average Attendance</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{avgAttendance}%</span>
              <span className="text-[10px] text-emerald-700">
                {avgAttendance >= 75 ? 'Meets threshold' : 'Attendance shortfall'}
              </span>
            </div>

            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100">
              <span className="text-amber-800 font-medium block">AI Risk Status</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{analysis.riskLevel}</span>
              <span className="text-[10px] text-amber-700">
                {analysis.hasSufficientData ? `Projected: ${analysis.expectedPerformance}%` : 'Model calibrated'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Subject-Wise Breakdown Table */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">2. Subject-Wise Breakdown</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Subject Name</th>
                  <th className="py-2.5 px-3">Difficulty</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Target Marks</th>
                  <th className="py-2.5 px-3">Average Marks</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map(s => {
                  const sRecords = performance.filter(p => p.subjectId === s.id);
                  const sAvg =
                    sRecords.length > 0
                      ? Math.round(
                          (sRecords.reduce(
                            (acc, r) => acc + (r.maximumMarks > 0 ? (r.marksObtained / r.maximumMarks) * 100 : 0),
                            0
                          ) /
                            sRecords.length) *
                            10
                        ) / 10
                      : null;

                  return (
                    <tr key={s.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{s.subjectName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.difficulty}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.priority}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{s.targetMarks}%</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {sAvg !== null ? `${sAvg}%` : 'No tests logged'}
                      </td>
                      <td className="py-2.5 px-3">
                        {sAvg === null ? (
                          <span className="text-slate-400">Pending</span>
                        ) : sAvg >= s.targetMarks ? (
                          <span className="text-emerald-700 font-medium">Exceeds Target</span>
                        ) : sAvg < 60 ? (
                          <span className="text-rose-600 font-medium">Needs Attention</span>
                        ) : (
                          <span className="text-amber-700 font-medium">Moderate</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Diagnostic Weak & Strong Areas */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30">
            <h4 className="font-bold text-rose-800 mb-2">Weak Areas Requiring Focus</h4>
            {analysis.weakSubjects.length === 0 ? (
              <p className="text-slate-500">None identified. All subjects align with performance goals.</p>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {analysis.weakSubjects.map(w => (
                  <li key={w.subjectId}>
                    <span className="font-semibold">{w.subjectName}</span> ({w.averageMarks}% avg) – {w.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
            <h4 className="font-bold text-emerald-800 mb-2">Strong Academic Pillars</h4>
            {analysis.strongSubjects.length === 0 ? (
              <p className="text-slate-500">Subject scores currently in developing phase.</p>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {analysis.strongSubjects.map(s => (
                  <li key={s.subjectId}>
                    <span className="font-semibold">{s.subjectName}</span> ({s.averageMarks}% avg) – high conceptual mastery
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Section 4: Machine Learning Prediction & Strategic Advice */}
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 text-xs space-y-3">
          <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-purple-600" />
            <span>AI Predictive Synthesis & Prescriptive Next Steps</span>
          </h4>
          <p className="text-slate-700 leading-relaxed">
            {analysis.hasSufficientData
              ? `The regression ensemble models an expected aggregate performance of ${analysis.expectedPerformance}%, exhibiting a ${analysis.performanceTrend} trajectory (${analysis.trendSlope > 0 ? `+${analysis.trendSlope}` : analysis.trendSlope} pts per cycle). Recommended weekly study dedication: ${analysis.suggestedWeeklyStudyHours} hours.`
              : 'Statistical prediction model will initialize upon recording 2 or more evaluated tests. Current planning recommends maintaining a 20-25 hour weekly study cadence.'}
          </p>

          <div className="pt-2 border-t border-purple-200/60 space-y-1.5">
            <span className="font-semibold text-purple-950 block">Top Recommended Actions:</span>
            {recommendations.slice(0, 3).map((r, i) => (
              <p key={i} className="text-slate-600 text-[11px]">
                • <strong className="text-slate-800">{r.title}:</strong> {r.description}
              </p>
            ))}
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
          Generated automatically by AI-Based Study Planner and Performance Analyzer. Personal student audit copy.
        </div>
      </div>
    </div>
  );
};
