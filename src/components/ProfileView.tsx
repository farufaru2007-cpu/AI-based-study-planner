import React, { useState } from 'react';
import { UserProfile } from '../types';
import { UserCircle, Save, Check, Award, GraduationCap, School, Target, Clock } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    course: user.course || '',
    branch: user.branch || '',
    year: user.year || '',
    semester: user.semester || '',
    college: user.college || '',
    academicGoals: user.academicGoals || '',
    targetMarksPercentage: user.targetMarksPercentage || 80,
    targetCGPA: user.targetCGPA || 8.5,
    dailyTargetStudyHours: user.dailyTargetStudyHours || 4
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">My Student Profile</h1>
            <p className="text-xs text-slate-500">Manage your degree, college, and academic achievement benchmarks</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <Check className="w-4 h-4" />
            <span>Profile saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic & Academic Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>Personal & Institution Details</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address (Registered)</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Degree / Course</label>
              <input
                type="text"
                placeholder="e.g. Bachelor of Technology (B.Tech)"
                value={formData.course}
                onChange={e => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Branch / Major</label>
              <input
                type="text"
                placeholder="e.g. Computer Science & Engineering"
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Current Academic Year</label>
              <select
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate / Master's">Postgraduate / Master's</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
              >
                <option value="">Select Semester</option>
                {Array.from({ length: 8 }, (_, i) => (
                  <option key={i + 1} value={`${i + 1}`}>Semester {i + 1}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">University / College Name</label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. National Institute of Technology"
                  value={formData.college}
                  onChange={e => setFormData({ ...formData, college: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Benchmarks & Targets */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span>Academic Target Benchmarks</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Marks (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="40"
                  max="100"
                  required
                  value={formData.targetMarksPercentage}
                  onChange={e => setFormData({ ...formData, targetMarksPercentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Used for ML performance gap analysis</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target CGPA (out of 10)</label>
              <input
                type="number"
                step="0.1"
                min="5"
                max="10"
                required
                value={formData.targetCGPA}
                onChange={e => setFormData({ ...formData, targetCGPA: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
              />
              <p className="text-[10px] text-slate-400 mt-1">Cumulative Grade Point Target</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Daily Study Target (Hours)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="14"
                  required
                  value={formData.dailyTargetStudyHours}
                  onChange={e => setFormData({ ...formData, dailyTargetStudyHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">hrs/day</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Calibrates recommendation workload</p>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">Academic Ambitions & Goals</label>
              <textarea
                rows={3}
                placeholder="Describe your target milestones, competitive exam aims, or research interests..."
                value={formData.academicGoals}
                onChange={e => setFormData({ ...formData, academicGoals: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
