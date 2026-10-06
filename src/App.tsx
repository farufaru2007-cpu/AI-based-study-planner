/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  Subject,
  StudyTask,
  PerformanceRecord,
  NavigationPage
} from './types';
import {
  getActiveUserId,
  getCurrentProfile,
  getUserSubjects,
  getUserTasks,
  getUserPerformance,
  updateProfile,
  saveSubject,
  deleteSubject,
  saveTask,
  deleteTask,
  toggleTaskStatus,
  savePerformanceRecord,
  deletePerformanceRecord,
  logoutUser
} from './services/storage';
import { analyzeAcademicPerformance } from './services/aiEngine';
import { Navigation } from './components/Navigation';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { SubjectsView } from './components/SubjectsView';
import { PlannerView } from './components/PlannerView';
import { PerformanceTrackerView } from './components/PerformanceTrackerView';
import { AIAnalyzerView } from './components/AIAnalyzerView';
import { AIRecommendationsView } from './components/AIRecommendationsView';
import { ProgressReportsView } from './components/ProgressReportsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [activeUserId, setActiveUserIdState] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load active user on mount
  const refreshUserData = useCallback(() => {
    const uid = getActiveUserId();
    setActiveUserIdState(uid);
    if (uid) {
      const prof = getCurrentProfile(uid);
      if (prof) {
        setCurrentUser(prof);
        setSubjects(getUserSubjects(uid));
        setTasks(getUserTasks(uid));
        setPerformance(getUserPerformance(uid));
      } else {
        setActiveUserIdState(null);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
      setSubjects([]);
      setTasks([]);
      setPerformance([]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Auth handler
  const handleAuthSuccess = (user: UserProfile) => {
    setActiveUserIdState(user.id);
    setCurrentUser(user);
    setSubjects(getUserSubjects(user.id));
    setTasks(getUserTasks(user.id));
    setPerformance(getUserPerformance(user.id));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setActiveUserIdState(null);
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  // Profile update
  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!activeUserId) return;
    const updated = updateProfile(activeUserId, updates);
    if (updated) setCurrentUser(updated);
  };

  // Subject operations
  const handleSaveSubject = (subData: Omit<Subject, 'id' | 'userId'> & { id?: string }) => {
    if (!activeUserId) return;
    saveSubject(activeUserId, subData);
    setSubjects(getUserSubjects(activeUserId));
  };

  const handleDeleteSubject = (subId: string) => {
    if (!activeUserId) return;
    deleteSubject(activeUserId, subId);
    setSubjects(getUserSubjects(activeUserId));
    setTasks(getUserTasks(activeUserId));
    setPerformance(getUserPerformance(activeUserId));
  };

  // Task operations
  const handleSaveTask = (taskData: Omit<StudyTask, 'id' | 'userId' | 'createdAt'> & { id?: string }) => {
    if (!activeUserId) return;
    saveTask(activeUserId, taskData);
    setTasks(getUserTasks(activeUserId));
  };

  const handleDeleteTask = (taskId: string) => {
    if (!activeUserId) return;
    deleteTask(activeUserId, taskId);
    setTasks(getUserTasks(activeUserId));
  };

  const handleToggleTask = (taskId: string) => {
    if (!activeUserId) return;
    toggleTaskStatus(activeUserId, taskId);
    setTasks(getUserTasks(activeUserId));
  };

  const handleBulkAddTasks = (newTasks: (Omit<StudyTask, 'id' | 'userId' | 'createdAt'> & { id?: string })[]) => {
    if (!activeUserId) return;
    newTasks.forEach(t => saveTask(activeUserId, t));
    setTasks(getUserTasks(activeUserId));
  };

  // Performance operations
  const handleSavePerformance = (recordData: Omit<PerformanceRecord, 'id' | 'userId'> & { id?: string }) => {
    if (!activeUserId) return;
    savePerformanceRecord(activeUserId, recordData);
    setPerformance(getUserPerformance(activeUserId));
  };

  const handleDeletePerformance = (recordId: string) => {
    if (!activeUserId) return;
    deletePerformanceRecord(activeUserId, recordId);
    setPerformance(getUserPerformance(activeUserId));
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">
        Loading workspace...
      </div>
    );
  }

  // If no user is logged in, show Auth View
  if (!activeUserId || !currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // Compute AI performance analysis
  const aiAnalysis = analyzeAcademicPerformance(currentUser, subjects, tasks, performance);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col antialiased">
      {/* Navigation Sidebar & Header */}
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentPage === 'dashboard' && (
            <DashboardView
              user={currentUser}
              subjects={subjects}
              tasks={tasks}
              performance={performance}
              aiAnalysis={aiAnalysis}
              onNavigate={setCurrentPage}
              onToggleTask={handleToggleTask}
            />
          )}

          {currentPage === 'profile' && (
            <ProfileView
              user={currentUser}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentPage === 'subjects' && (
            <SubjectsView
              subjects={subjects}
              onSaveSubject={handleSaveSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {currentPage === 'planner' && (
            <PlannerView
              user={currentUser}
              subjects={subjects}
              tasks={tasks}
              performance={performance}
              onSaveTask={handleSaveTask}
              onDeleteTask={handleDeleteTask}
              onToggleTask={handleToggleTask}
              onBulkAddTasks={handleBulkAddTasks}
            />
          )}

          {currentPage === 'tracker' && (
            <PerformanceTrackerView
              subjects={subjects}
              performance={performance}
              onSavePerformance={handleSavePerformance}
              onDeletePerformance={handleDeletePerformance}
            />
          )}

          {currentPage === 'analyzer' && (
            <AIAnalyzerView
              user={currentUser}
              subjects={subjects}
              tasks={tasks}
              performance={performance}
              analysis={aiAnalysis}
              onNavigateToTracker={() => setCurrentPage('tracker')}
            />
          )}

          {currentPage === 'recommendations' && (
            <AIRecommendationsView
              user={currentUser}
              subjects={subjects}
              tasks={tasks}
              performance={performance}
              analysis={aiAnalysis}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'reports' && (
            <ProgressReportsView
              user={currentUser}
              subjects={subjects}
              tasks={tasks}
              performance={performance}
              analysis={aiAnalysis}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              user={currentUser}
              onRefreshData={refreshUserData}
              onLogout={handleLogout}
            />
          )}
        </div>
      </main>
    </div>
  );
}
