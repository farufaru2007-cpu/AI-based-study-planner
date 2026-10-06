import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { loginUser, registerUser } from '../services/storage';
import { UserProfile } from '../types';

interface AuthViewProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please verify.');
          setLoading(false);
          return;
        }
        const res = await registerUser(name, email, password);
        if (!res.success || !res.user) {
          setError(res.error || 'Failed to create account.');
        } else {
          onAuthSuccess(res.user);
        }
      } else {
        const res = await loginUser(email, password);
        if (!res.success || !res.user) {
          setError(res.error || 'Invalid email or password.');
        } else {
          onAuthSuccess(res.user);
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="text-center mb-6 max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 mb-3 shadow-xs">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          AI-Based Study Planner & Performance Analyzer
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Plan personalized study schedules, track academic marks, and unlock machine learning insights.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8">
        {/* Toggle Pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isRegistering ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isRegistering ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create New Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Turner"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
              />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 bg-slate-50/50"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {loading ? (
              'Processing...'
            ) : isRegistering ? (
              <>
                <span>Register & Create Profile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Log In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Isolation assurance note */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Zero-knowledge user isolation: Every student's subjects, study tasks, and marks are stored privately under their individual account.
          </p>
        </div>
      </div>
    </div>
  );
};
