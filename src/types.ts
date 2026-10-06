export type DifficultyLevel = 'Easy' | 'Medium' | 'Difficult';
export type PriorityLevel = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'pending' | 'completed';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  course: string;
  branch: string;
  year: string;
  semester: string;
  college: string;
  academicGoals: string;
  targetMarksPercentage: number;
  targetCGPA: number;
  dailyTargetStudyHours: number;
  createdAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  subjectName: string;
  difficulty: DifficultyLevel;
  targetMarks: number;
  examDate: string; // YYYY-MM-DD
  priority: PriorityLevel;
  colorTheme?: 'lavender' | 'blue' | 'pink' | 'green' | 'yellow';
}

export interface StudyTask {
  id: string;
  userId: string;
  subjectId: string;
  topic: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  priority: PriorityLevel;
  difficulty: DifficultyLevel;
  status: TaskStatus;
  notes?: string;
  createdAt: string;
}

export interface PerformanceRecord {
  id: string;
  userId: string;
  subjectId: string;
  examName: string;
  marksObtained: number;
  maximumMarks: number;
  attendancePercent: number;
  assignmentMarks: number;
  internalMarks: number;
  examDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface AIAnalysisResult {
  hasSufficientData: boolean;
  dataPointCount: number;
  expectedPerformance: number;
  performanceTrend: 'improving' | 'stable' | 'declining';
  trendSlope: number;
  weakSubjects: {
    subjectId: string;
    subjectName: string;
    averageMarks: number;
    targetMarks: number;
    reason: string;
  }[];
  strongSubjects: {
    subjectId: string;
    subjectName: string;
    averageMarks: number;
  }[];
  subjectsNeedingAttention: {
    subjectId: string;
    subjectName: string;
    reason: string;
    priority: PriorityLevel;
    daysUntilExam: number | null;
  }[];
  riskLevel: 'Low' | 'Moderate' | 'High';
  riskFactors: string[];
  suggestedWeeklyStudyHours: number;
  consistencyScore: number; // 0 - 100
  studyHoursCorrelation: number; // -1 to 1
  attendanceCorrelation: number;
  modelExplanation: string;
}

export interface AIRecommendation {
  id: string;
  category: 'priority' | 'hours' | 'revision' | 'exam' | 'consistency' | 'performance';
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  tag: string;
}

export type NavigationPage =
  | 'dashboard'
  | 'profile'
  | 'subjects'
  | 'planner'
  | 'tracker'
  | 'analyzer'
  | 'recommendations'
  | 'reports'
  | 'settings';
