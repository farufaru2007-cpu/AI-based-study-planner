import { UserProfile, Subject, StudyTask, PerformanceRecord } from '../types';

const USERS_REGISTRY_KEY = 'study_ai_users_registry_v1';
const ACTIVE_SESSION_KEY = 'study_ai_active_user_v1';

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + 'study_salt_sec_2026');
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface UserDataStore {
  profile: UserProfile;
  subjects: Subject[];
  tasks: StudyTask[];
  performance: PerformanceRecord[];
}

function getUserStoreKey(userId: string): string {
  return `study_ai_data_u_${userId}`;
}

export function getAllRegisteredUsers(): { id: string; email: string; name: string }[] {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getActiveUserId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

export function setActiveUserId(userId: string | null) {
  if (userId) {
    localStorage.setItem(ACTIVE_SESSION_KEY, userId);
  } else {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }
}

export function getUserStore(userId: string): UserDataStore | null {
  try {
    const raw = localStorage.getItem(getUserStoreKey(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUserStore(userId: string, data: UserDataStore) {
  try {
    localStorage.setItem(getUserStoreKey(userId), JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save user data store', err);
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!name.trim()) {
    return { success: false, error: 'Please provide your full name.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const users = getAllRegisteredUsers();
  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const userId = 'usr_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  const passwordHash = await hashPassword(password);

  const profile: UserProfile = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    course: '',
    branch: '',
    year: '',
    semester: '',
    college: '',
    academicGoals: '',
    targetMarksPercentage: 80,
    targetCGPA: 8.5,
    dailyTargetStudyHours: 4,
    createdAt: new Date().toISOString()
  };

  // Fresh user starts completely empty: no fake subjects, tasks, or performance!
  const emptyStore: UserDataStore = {
    profile,
    subjects: [],
    tasks: [],
    performance: []
  };

  saveUserStore(userId, emptyStore);

  users.push({ id: userId, email: cleanEmail, name: name.trim() });
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  setActiveUserId(userId);

  return { success: true, user: profile };
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllRegisteredUsers();
  const found = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!found) {
    return { success: false, error: 'No account found with this email. Please register first.' };
  }

  const store = getUserStore(found.id);
  if (!store || !store.profile) {
    return { success: false, error: 'User record corrupted or missing.' };
  }

  const hashedInput = await hashPassword(password);
  if (hashedInput !== store.profile.passwordHash) {
    return { success: false, error: 'Invalid password. Please check your credentials.' };
  }

  setActiveUserId(found.id);
  return { success: true, user: store.profile };
}

export function logoutUser() {
  setActiveUserId(null);
}

// User Profile Operations
export function getCurrentProfile(userId: string): UserProfile | null {
  const store = getUserStore(userId);
  return store ? store.profile : null;
}

export function updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
  const store = getUserStore(userId);
  if (!store) return null;
  store.profile = { ...store.profile, ...updates };
  saveUserStore(userId, store);
  return store.profile;
}

// Subjects Operations
export function getUserSubjects(userId: string): Subject[] {
  const store = getUserStore(userId);
  return store ? store.subjects : [];
}

export function saveSubject(userId: string, subject: Omit<Subject, 'id' | 'userId'> & { id?: string }): Subject {
  const store = getUserStore(userId);
  if (!store) throw new Error('User not found');

  const id = subject.id || 'sub_' + Math.random().toString(36).substring(2, 9);
  const colorThemes: Array<'lavender' | 'blue' | 'pink' | 'green' | 'yellow'> = ['lavender', 'blue', 'pink', 'green', 'yellow'];
  const assignedColor = subject.colorTheme || colorThemes[store.subjects.length % colorThemes.length];

  const fullSubject: Subject = {
    ...subject,
    id,
    userId,
    colorTheme: assignedColor
  };

  const existingIdx = store.subjects.findIndex(s => s.id === id);
  if (existingIdx >= 0) {
    store.subjects[existingIdx] = fullSubject;
  } else {
    store.subjects.push(fullSubject);
  }

  saveUserStore(userId, store);
  return fullSubject;
}

export function deleteSubject(userId: string, subjectId: string) {
  const store = getUserStore(userId);
  if (!store) return;
  store.subjects = store.subjects.filter(s => s.id !== subjectId);
  // Also clean up linked tasks & performance records
  store.tasks = store.tasks.filter(t => t.subjectId !== subjectId);
  store.performance = store.performance.filter(p => p.subjectId !== subjectId);
  saveUserStore(userId, store);
}

// Tasks Operations
export function getUserTasks(userId: string): StudyTask[] {
  const store = getUserStore(userId);
  return store ? store.tasks : [];
}

export function saveTask(userId: string, task: Omit<StudyTask, 'id' | 'userId' | 'createdAt'> & { id?: string }): StudyTask {
  const store = getUserStore(userId);
  if (!store) throw new Error('User not found');

  const id = task.id || 'tsk_' + Math.random().toString(36).substring(2, 9);
  const fullTask: StudyTask = {
    ...task,
    id,
    userId,
    createdAt: new Date().toISOString()
  };

  const existingIdx = store.tasks.findIndex(t => t.id === id);
  if (existingIdx >= 0) {
    store.tasks[existingIdx] = {
      ...store.tasks[existingIdx],
      ...fullTask
    };
  } else {
    store.tasks.push(fullTask);
  }

  saveUserStore(userId, store);
  return fullTask;
}

export function toggleTaskStatus(userId: string, taskId: string): StudyTask | null {
  const store = getUserStore(userId);
  if (!store) return null;
  const task = store.tasks.find(t => t.id === taskId);
  if (!task) return null;
  task.status = task.status === 'completed' ? 'pending' : 'completed';
  saveUserStore(userId, store);
  return task;
}

export function deleteTask(userId: string, taskId: string) {
  const store = getUserStore(userId);
  if (!store) return;
  store.tasks = store.tasks.filter(t => t.id !== taskId);
  saveUserStore(userId, store);
}

// Performance Records Operations
export function getUserPerformance(userId: string): PerformanceRecord[] {
  const store = getUserStore(userId);
  return store ? store.performance : [];
}

export function savePerformanceRecord(
  userId: string,
  record: Omit<PerformanceRecord, 'id' | 'userId'> & { id?: string }
): PerformanceRecord {
  const store = getUserStore(userId);
  if (!store) throw new Error('User not found');

  const id = record.id || 'perf_' + Math.random().toString(36).substring(2, 9);
  const fullRecord: PerformanceRecord = {
    ...record,
    id,
    userId
  };

  const existingIdx = store.performance.findIndex(p => p.id === id);
  if (existingIdx >= 0) {
    store.performance[existingIdx] = fullRecord;
  } else {
    store.performance.push(fullRecord);
  }

  saveUserStore(userId, store);
  return fullRecord;
}

export function deletePerformanceRecord(userId: string, recordId: string) {
  const store = getUserStore(userId);
  if (!store) return;
  store.performance = store.performance.filter(p => p.id !== recordId);
  saveUserStore(userId, store);
}

// Backup / Restore
export function exportUserData(userId: string): string {
  const store = getUserStore(userId);
  if (!store) return '{}';
  return JSON.stringify(store, null, 2);
}

export function importUserData(userId: string, jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as UserDataStore;
    if (!data.profile || !Array.isArray(data.subjects)) return false;
    data.profile.id = userId;
    data.subjects.forEach(s => (s.userId = userId));
    data.tasks.forEach(t => (t.userId = userId));
    data.performance.forEach(p => (p.userId = userId));
    saveUserStore(userId, data);
    return true;
  } catch {
    return false;
  }
}

export function resetUserData(userId: string) {
  const store = getUserStore(userId);
  if (!store) return;
  store.subjects = [];
  store.tasks = [];
  store.performance = [];
  saveUserStore(userId, store);
}

// Optional helper for demo evaluators to test ML features without manual typing
export function seedSampleAcademicData(userId: string) {
  const store = getUserStore(userId);
  if (!store) return;

  const subjects: Subject[] = [
    {
      id: 'sub_math',
      userId,
      subjectName: 'Advanced Mathematics',
      difficulty: 'Difficult',
      targetMarks: 85,
      examDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      priority: 'High',
      colorTheme: 'blue'
    },
    {
      id: 'sub_dsa',
      userId,
      subjectName: 'Data Structures & Algorithms',
      difficulty: 'Difficult',
      targetMarks: 90,
      examDate: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
      priority: 'High',
      colorTheme: 'lavender'
    },
    {
      id: 'sub_dbms',
      userId,
      subjectName: 'Database Management Systems',
      difficulty: 'Medium',
      targetMarks: 80,
      examDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      priority: 'Medium',
      colorTheme: 'green'
    },
    {
      id: 'sub_os',
      userId,
      subjectName: 'Operating Systems',
      difficulty: 'Medium',
      targetMarks: 75,
      examDate: new Date(Date.now() + 32 * 86400000).toISOString().split('T')[0],
      priority: 'Medium',
      colorTheme: 'yellow'
    },
    {
      id: 'sub_eng',
      userId,
      subjectName: 'Technical Communication',
      difficulty: 'Easy',
      targetMarks: 85,
      examDate: new Date(Date.now() + 40 * 86400000).toISOString().split('T')[0],
      priority: 'Low',
      colorTheme: 'pink'
    }
  ];

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const tasks: StudyTask[] = [
    {
      id: 'tsk_1',
      userId,
      subjectId: 'sub_math',
      topic: 'Multivariable Calculus & Partial Derivatives',
      date: todayStr,
      startTime: '09:00',
      endTime: '11:00',
      priority: 'High',
      difficulty: 'Difficult',
      status: 'completed',
      createdAt: now.toISOString()
    },
    {
      id: 'tsk_2',
      userId,
      subjectId: 'sub_dsa',
      topic: 'Binary Search Trees & AVL Tree Rotations',
      date: todayStr,
      startTime: '14:00',
      endTime: '16:00',
      priority: 'High',
      difficulty: 'Difficult',
      status: 'pending',
      createdAt: now.toISOString()
    },
    {
      id: 'tsk_3',
      userId,
      subjectId: 'sub_dbms',
      topic: 'B+ Tree Indexing & Query Optimization',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '12:00',
      priority: 'Medium',
      difficulty: 'Medium',
      status: 'pending',
      createdAt: now.toISOString()
    },
    {
      id: 'tsk_4',
      userId,
      subjectId: 'sub_os',
      topic: 'Process Synchronization & Semaphore Deadlocks',
      date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      startTime: '16:00',
      endTime: '17:30',
      priority: 'Medium',
      difficulty: 'Medium',
      status: 'pending',
      createdAt: now.toISOString()
    }
  ];

  const performance: PerformanceRecord[] = [
    {
      id: 'perf_1',
      userId,
      subjectId: 'sub_math',
      examName: 'Midterm Assessment 1',
      marksObtained: 68,
      maximumMarks: 100,
      attendancePercent: 78,
      assignmentMarks: 16,
      internalMarks: 22,
      examDate: new Date(Date.now() - 35 * 86400000).toISOString().split('T')[0]
    },
    {
      id: 'perf_2',
      userId,
      subjectId: 'sub_dsa',
      examName: 'Class Quiz 1',
      marksObtained: 84,
      maximumMarks: 100,
      attendancePercent: 92,
      assignmentMarks: 19,
      internalMarks: 24,
      examDate: new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0]
    },
    {
      id: 'perf_3',
      userId,
      subjectId: 'sub_dbms',
      examName: 'Lab Exam 1',
      marksObtained: 79,
      maximumMarks: 100,
      attendancePercent: 88,
      assignmentMarks: 17,
      internalMarks: 23,
      examDate: new Date(Date.now() - 21 * 86400000).toISOString().split('T')[0]
    },
    {
      id: 'perf_4',
      userId,
      subjectId: 'sub_math',
      examName: 'Unit Test 2',
      marksObtained: 72,
      maximumMarks: 100,
      attendancePercent: 82,
      assignmentMarks: 18,
      internalMarks: 23,
      examDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0]
    },
    {
      id: 'perf_5',
      userId,
      subjectId: 'sub_os',
      examName: 'Midterm Assessment 1',
      marksObtained: 74,
      maximumMarks: 100,
      attendancePercent: 85,
      assignmentMarks: 16,
      internalMarks: 21,
      examDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    }
  ];

  store.subjects = subjects;
  store.tasks = tasks;
  store.performance = performance;
  if (!store.profile.course) store.profile.course = 'Bachelor of Technology';
  if (!store.profile.branch) store.profile.branch = 'Computer Science & Engineering';
  if (!store.profile.year) store.profile.year = '3rd Year';
  if (!store.profile.semester) store.profile.semester = '5th Semester';
  if (!store.profile.college) store.profile.college = 'National Institute of Technology';
  if (!store.profile.academicGoals) store.profile.academicGoals = 'Aiming for First Class with Distinction, minimum 85% aggregate and top placement in software systems engineering.';

  saveUserStore(userId, store);
}
