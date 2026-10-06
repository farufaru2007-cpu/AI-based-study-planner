import React from 'react';
import { Subject, StudyTask, PerformanceRecord, UserProfile, AIAnalysisResult } from '../types';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Clock,
  Target,
  Sparkles,
  Info,
  ShieldAlert,
  BarChart2,
  BookOpen
} from 'lucide-react';
import { BarChart } from './Charts';

interface AIAnalyzerViewProps {
  user: UserProfile;
  subjects: Subject[];
  tasks: StudyTask[];
  performance: PerformanceRecord[];
  analysis: AIAnalysisResult;
  onNavigateToTracker: () => void;
}

export const AIAnalyzerView: React.FC<AIAnalyzerViewProps> = ({
  user,
  subjects,
  tasks,
  performance,
  analysis,
  onNavigateToTracker
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-600" />
            <span>AI Academic Performance Analyzer</span>
          </h1>
          <p className="text-xs text-slate-500">
            Machine learning & multivariate statistical analysis trained on your personal academic history
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800 font-medium self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Status: {analysis.hasSufficientData ? 'Trained on Personal Data' : 'Awaiting Records'}</span>
        </div>
      </div>

      {/* Mandatory AI/ML Disclaimer Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-semibold block mb-0.5">Statistical Estimation Notice</span>
          Predictions and risk indicators are AI/ML statistical estimates derived from your recorded attendance, task consistency, and prior evaluations. They are guidance tools to aid your study planning, not guaranteed outcomes.
        </div>
      </div>

      {/* Insufficient Data State */}
      {!analysis.hasSufficientData ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-bold text-slate-800">
              More Assessment Records Required
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              The AI regression and risk prediction engines require at least <span className="font-semibold text-slate-700">2 evaluated examination records</span> to compute trends, regression coefficients, and subject variance.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Currently recorded: {analysis.dataPointCount} record{analysis.dataPointCount === 1 ? '' : 's'}.
            </p>
          </div>
          <button
            onClick={onNavigateToTracker}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            + Add Assessment Records in Performance Tracker
          </button>
        </div>
      ) : (
        <>
          {/* Main Prediction & Key ML Outputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Projected Score Card */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-200/80 rounded-2xl p-5 shadow-2xs">
              <span className="text-xs font-semibold text-purple-900 uppercase tracking-wide">
                Projected Academic Performance
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800">{analysis.expectedPerformance}%</span>
                <span className="text-xs text-slate-500 font-medium">Estimated Final</span>
              </div>
              <p className="text-[11px] text-purple-800/80 mt-2">
                Target goal: {user.targetMarksPercentage || 80}% ({analysis.expectedPerformance >= (user.targetMarksPercentage || 80) ? 'On track' : 'Gap of ' + Math.round(((user.targetMarksPercentage || 80) - analysis.expectedPerformance) * 10) / 10 + '%'})
              </p>
            </div>

            {/* Performance Trend Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                OLS Trajectory Trend
              </span>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-800 capitalize">
                  {analysis.performanceTrend}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    analysis.performanceTrend === 'improving'
                      ? 'bg-emerald-100 text-emerald-800'
                      : analysis.performanceTrend === 'declining'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {analysis.trendSlope > 0 ? `+${analysis.trendSlope}` : analysis.trendSlope} pts/test
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Slope computed across {analysis.dataPointCount} chronological evaluations
              </p>
            </div>

            {/* Risk Assessment Card */}
            <div
              className={`rounded-2xl border p-5 shadow-2xs ${
                analysis.riskLevel === 'High'
                  ? 'bg-rose-50/50 border-rose-200/80'
                  : analysis.riskLevel === 'Moderate'
                  ? 'bg-amber-50/50 border-amber-200/80'
                  : 'bg-emerald-50/50 border-emerald-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                  Risk Level Classification
                </span>
                <ShieldAlert
                  className={`w-4 h-4 ${
                    analysis.riskLevel === 'High'
                      ? 'text-rose-600'
                      : analysis.riskLevel === 'Moderate'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-800">{analysis.riskLevel} Risk</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-2">
                {analysis.riskFactors.length} risk factor indicator{analysis.riskFactors.length === 1 ? '' : 's'} identified
              </p>
            </div>
          </div>

          {/* Risk Factors List */}
          {analysis.riskFactors.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Identified Academic Risk Factors</span>
              </h2>
              <div className="space-y-2">
                {analysis.riskFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak vs Strong Subjects Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weak Subjects Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Identified Weak Subjects ({analysis.weakSubjects.length})</span>
                </h2>
                <span className="text-[11px] text-slate-400">Score &lt; 65% or below target</span>
              </div>

              {analysis.weakSubjects.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-emerald-50/30 rounded-xl border border-emerald-100">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-700">No weak subjects detected</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">All monitored courses are at or above benchmark target levels.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {analysis.weakSubjects.map(w => (
                    <div key={w.subjectId} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{w.subjectName}</span>
                        <span className="font-bold text-rose-700">{w.averageMarks}% avg</span>
                      </div>
                      <p className="text-slate-600 mt-1 text-[11px]">{w.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strong Subjects Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Strong Performance Pillars ({analysis.strongSubjects.length})</span>
                </h2>
                <span className="text-[11px] text-slate-400">Score ≥ 75%</span>
              </div>

              {analysis.strongSubjects.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
                  <p>No subjects have reached the 75%+ strong threshold yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {analysis.strongSubjects.map(s => (
                    <div key={s.subjectId} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{s.subjectName}</span>
                        <span className="font-bold text-emerald-700">{s.averageMarks}% avg</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 text-[11px]">Consistent high retention; maintain with spaced revision.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Suggested Study Hours & Consistency Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Recommended Study Load</span>
                </h2>
                <span className="text-xs font-bold text-purple-700">
                  {analysis.suggestedWeeklyStudyHours} hrs / week
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Based on syllabus difficulty weights ({subjects.filter(s => s.difficulty === 'Difficult').length} difficult,{' '}
                {subjects.filter(s => s.difficulty === 'Medium').length} medium) and your current performance delta from target, the model prescribes:
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Daily Average Target:</span>
                  <span className="font-bold text-slate-800">
                    {Math.round((analysis.suggestedWeeklyStudyHours / 7) * 10) / 10} hours/day
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Weekly Difficult Course Allocation:</span>
                  <span className="font-bold text-purple-700">
                    {Math.round(analysis.suggestedWeeklyStudyHours * 0.55)} hours
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Revision & Problem Drill Allocation:</span>
                  <span className="font-bold text-blue-700">
                    {Math.round(analysis.suggestedWeeklyStudyHours * 0.45)} hours
                  </span>
                </div>
              </div>
            </div>

            {/* Study Consistency Index */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-600" />
                  <span>Study Consistency Index</span>
                </h2>
                <span className="text-xs font-bold text-slate-800">{analysis.consistencyScore}/100</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden my-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 transition-all duration-700"
                  style={{ width: `${analysis.consistencyScore}%` }}
                />
              </div>

              <div className="space-y-2 mt-4 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Task Completion Regularity:</span>
                  <span className="font-semibold text-slate-800">
                    {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Attendance Correlation Coefficient:</span>
                  <span className="font-semibold text-slate-800">r = +{analysis.attendanceCorrelation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Study Hours Correlation:</span>
                  <span className="font-semibold text-slate-800">r = +{analysis.studyHoursCorrelation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Architecture Note */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Model Specification: </span>
            {analysis.modelExplanation}
          </div>
        </>
      )}
    </div>
  );
};
