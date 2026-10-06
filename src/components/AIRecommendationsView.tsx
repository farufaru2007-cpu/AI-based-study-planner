import React from 'react';
import { UserProfile, Subject, StudyTask, PerformanceRecord, AIAnalysisResult, AIRecommendation, NavigationPage } from '../types';
import { generateDynamicRecommendations } from '../services/aiEngine';
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AIRecommendationsViewProps {
  user: UserProfile;
  subjects: Subject[];
  tasks: StudyTask[];
  performance: PerformanceRecord[];
  analysis: AIAnalysisResult;
  onNavigate: (page: NavigationPage) => void;
}

export const AIRecommendationsView: React.FC<AIRecommendationsViewProps> = ({
  user,
  subjects,
  tasks,
  performance,
  analysis,
  onNavigate
}) => {
  const recommendations = generateDynamicRecommendations(user, subjects, tasks, performance, analysis);

  const getUrgencyBadge = (urgency: AIRecommendation['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getCategoryIcon = (category: AIRecommendation['category']) => {
    switch (category) {
      case 'priority':
        return <Flame className="w-4 h-4 text-rose-600" />;
      case 'hours':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'revision':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'exam':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'consistency':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'performance':
      default:
        return <Lightbulb className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <span>AI Study Recommendations</span>
          </h1>
          <p className="text-xs text-slate-500">
            Prescriptive study guidance synthesized directly from your current academic profile and exam deadlines
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800 font-medium self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Real-time Dynamic Plan</span>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-2xs space-y-3">
          <Lightbulb className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-sm font-semibold text-slate-800">No Personal Data Available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Recommendations are generated strictly from your own registered subjects and assessment marks. Add subjects to view personalized study recommendations.
          </p>
          <button
            onClick={() => onNavigate('subjects')}
            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            + Add Subjects Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(rec => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        {getCategoryIcon(rec.category)}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {rec.tag}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${getUrgencyBadge(
                        rec.urgency
                      )}`}
                    >
                      {rec.urgency} urgency
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 mt-2">{rec.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rec.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Target Action</span>
                  <button
                    onClick={() => {
                      if (rec.category === 'priority' || rec.category === 'revision' || rec.category === 'consistency') {
                        onNavigate('planner');
                      } else if (rec.category === 'hours') {
                        onNavigate('profile');
                      } else {
                        onNavigate('tracker');
                      }
                    }}
                    className="text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 text-xs"
                  >
                    <span>Execute in {rec.category === 'hours' ? 'Profile' : rec.category === 'priority' ? 'Planner' : 'Tracker'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Spaced Repetition Protocol Box */}
          <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border border-purple-200/80 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Scientifically Proven Revision Protocol</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              To achieve maximum retention in technical and analytical subjects, structure your learning rhythm using the Ebbinghaus Forgetting Curve intervals:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="font-bold text-purple-900 block text-xs">Interval 1: 24 Hours</span>
                <span className="text-[11px] text-slate-600 mt-1 block">Quick 15-minute summary notes and key formulas review</span>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-blue-100 shadow-2xs">
                <span className="font-bold text-blue-900 block text-xs">Interval 2: Day 3</span>
                <span className="text-[11px] text-slate-600 mt-1 block">Solve 3 representative numerical or algorithmic problems</span>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-pink-100 shadow-2xs">
                <span className="font-bold text-pink-900 block text-xs">Interval 3: Day 7</span>
                <span className="text-[11px] text-slate-600 mt-1 block">Active recall quiz without looking at reference textbook</span>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="font-bold text-emerald-900 block text-xs">Interval 4: Day 21</span>
                <span className="text-[11px] text-slate-600 mt-1 block">Full timed past year exam question mock drill</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
