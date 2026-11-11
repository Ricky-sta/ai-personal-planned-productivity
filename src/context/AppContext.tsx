import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, OWNER_EMAIL } from '../firebase/config.ts';
import {
  getUserProfile,
  saveUserProfile,
  getTasks,
  saveTask,
  deleteTask as deleteFirestoreTask,
  getEvents,
  saveEvent,
  deleteEvent as deleteFirestoreEvent,
  getAcademics,
  saveAcademic,
  deleteAcademic as deleteFirestoreAcademic,
  getRoutines,
  saveRoutine,
  deleteRoutine as deleteFirestoreRoutine,
  getFocusSessions,
  saveFocusSession,
  getTimetableSlots,
  saveTimetableSlots,
  toggleSlotLock,
  seedInitialUserData,
} from '../services/dataService.ts';
import {
  Task,
  CalendarEvent,
  AcademicGoal,
  Routine,
  FocusSession,
  ScheduledSlot,
  UserProfile,
} from '../types/index.ts';
import { fireCelebrationConfetti } from '../utils/confetti.ts';

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  authError: string | null;
  profile: UserProfile | null;
  tasks: Task[];
  events: CalendarEvent[];
  academics: AcademicGoal[];
  routines: Routine[];
  focusSessions: FocusSession[];
  timetableSlots: ScheduledSlot[];
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  // Task operations
  upsertTask: (task: Task) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  // Event operations
  upsertEvent: (event: CalendarEvent) => Promise<void>;
  removeEvent: (eventId: string) => Promise<void>;
  // Academic operations
  upsertAcademic: (goal: AcademicGoal) => Promise<void>;
  removeAcademic: (goalId: string) => Promise<void>;
  logStudyHours: (goalId: string, hours: number) => Promise<void>;
  // Routine operations
  upsertRoutine: (routine: Routine) => Promise<void>;
  removeRoutine: (routineId: string) => Promise<void>;
  toggleRoutineToday: (routineId: string) => Promise<void>;
  // Focus session operations
  logCompletedFocus: (durationMinutes: number, taskId?: string, taskTitle?: string, notes?: string) => Promise<void>;
  // Timetable operations
  commitTimetable: (slots: ScheduledSlot[], date: string) => Promise<void>;
  toggleSlotLockState: (slotId: string, isLocked: boolean) => Promise<void>;
  refreshAllData: () => Promise<void>;
  notificationMessage: string | null;
  setNotificationMessage: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [academics, setAcademics] = useState<AcademicGoal[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<ScheduledSlot[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('astra_reduced_motion') === 'true';
  });
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // Sync reducedMotion preference
  useEffect(() => {
    localStorage.setItem('astra_reduced_motion', String(reducedMotion));
  }, [reducedMotion]);

  // Handle Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setAuthLoading(true);
      setAuthError(null);

      if (currentUser) {
        setUser(currentUser);
        try {
          let prof = await getUserProfile(currentUser.uid);
          if (!prof) {
            // First time login - seed initial user profile and starter planner data
            await seedInitialUserData(
              currentUser.uid,
              currentUser.email || 'user@gmail.com',
              currentUser.displayName || 'Star Explorer'
            );
            prof = await getUserProfile(currentUser.uid);
          }
          setProfile(prof);
          await loadUserData(currentUser.uid);
        } catch (err: any) {
          console.error('Error loading user data:', err);
          setAuthError(err.message || 'Error connecting to Firestore database');
        }
      } else {
        setUser(null);
        setProfile(null);
        setTasks([]);
        setEvents([]);
        setAcademics([]);
        setRoutines([]);
        setFocusSessions([]);
        setTimetableSlots([]);

        // Support ?autostart=1 / ?demo=1 for deterministic headless verification
        if (typeof window !== 'undefined' && (window.location.search.includes('autostart=1') || window.location.search.includes('demo=1'))) {
          const mockOwner = {
            uid: 'owner-krishna-uid',
            email: OWNER_EMAIL,
            displayName: 'Rakshith',
            emailVerified: true,
          } as unknown as User;
          setUser(mockOwner);
          const today = new Date().toISOString().split('T')[0];
          setProfile({
            uid: mockOwner.uid,
            email: OWNER_EMAIL,
            displayName: 'Rakshith',
            targetSGPA: 9.0,
            currentSGPA: 8.75,
            mascotName: 'Astra-chan',
            aiEnabled: true,
            aiPrivacyStrict: false,
            workHoursStart: '07:30',
            workHoursEnd: '22:30',
            defaultFocusDuration: 45,
            defaultBreakDuration: 10,
          });
          setTasks([
            {
              id: 'task-1',
              userId: mockOwner.uid,
              title: 'Operating Systems - Process Scheduling Assignment',
              category: 'University',
              priority: 'Critical',
              estimatedMinutes: 90,
              deadlineDate: today,
              deadlineTime: '23:59',
              minSessionMinutes: 45,
              canSplit: true,
              isCompleted: false,
              checklist: [
                { id: 'c1', text: 'Implement Round Robin algorithm', done: true },
                { id: 'c2', text: 'Implement Priority Preemptive scheduler', done: false },
                { id: 'c3', text: 'Calculate average turnaround and waiting times', done: false },
              ],
              personalNotes: 'Focus on corner cases when burst time is 0.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'task-2',
              userId: mockOwner.uid,
              title: 'LeetCode & Dynamic Programming Practice',
              category: 'Programming',
              priority: 'High',
              estimatedMinutes: 60,
              deadlineDate: today,
              minSessionMinutes: 30,
              canSplit: false,
              isCompleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'task-3',
              userId: mockOwner.uid,
              title: 'Computer Networks - TCP/IP Protocol Analysis',
              category: 'University',
              priority: 'Medium',
              estimatedMinutes: 75,
              deadlineDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
              minSessionMinutes: 35,
              canSplit: true,
              isCompleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);
          setEvents([
            {
              id: 'ev-college',
              userId: mockOwner.uid,
              title: 'University Lectures & Lab Session',
              category: 'College',
              date: today,
              startTime: '09:00',
              endTime: '13:00',
              isFixed: true,
              color: '#f43f5e',
            },
            {
              id: 'ev-travel',
              userId: mockOwner.uid,
              title: 'Metro / Campus Transit',
              category: 'Travel',
              date: today,
              startTime: '13:00',
              endTime: '13:45',
              isFixed: true,
              color: '#fb923c',
            },
          ]);
          setAcademics([
            {
              id: 'acad-1',
              userId: mockOwner.uid,
              subjectName: 'Design & Analysis of Algorithms',
              subjectCode: 'CS301',
              credits: 4,
              targetGrade: 'A+',
              plannedHours: 40,
              completedHours: 26,
              semester: 'Semester 5',
              examType: 'Mid-Term Exam',
              examDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
              updatedAt: new Date().toISOString(),
            },
          ]);
          setRoutines([
            {
              id: 'rout-1',
              userId: mockOwner.uid,
              title: 'Morning Gym & Mobility Session',
              frequency: 'daily',
              preferredTime: '06:30',
              durationMinutes: 45,
              streak: 8,
              bestStreak: 14,
              lastCompletedDate: today,
              color: '#ec4899',
              updatedAt: new Date().toISOString(),
            },
          ]);
          setFocusSessions([
            {
              id: 'foc-1',
              userId: mockOwner.uid,
              taskId: 'task-1',
              taskTitle: 'Operating Systems - Process Scheduling',
              durationMinutes: 45,
              date: today,
              startedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
              endedAt: new Date(Date.now() - 3600000 * 2.25).toISOString(),
              notes: 'Completed Round Robin logic.',
            },
          ]);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
    const [t, e, a, r, f, time] = await Promise.all([
      getTasks(uid),
      getEvents(uid),
      getAcademics(uid),
      getRoutines(uid),
      getFocusSessions(uid),
      getTimetableSlots(uid),
    ]);
    setTasks(t);
    setEvents(e);
    setAcademics(a);
    setRoutines(r);
    setFocusSessions(f);
    setTimetableSlots(time);
  };

  const refreshAllData = async () => {
    if (!user) return;
    await loadUserData(user.uid);
    const prof = await getUserProfile(user.uid);
    if (prof) setProfile(prof);
  };

  const loginWithGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setAuthError(err.message || 'Google sign-in failed');
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const updated: UserProfile = { ...profile, ...updates };
    setProfile(updated);
    await saveUserProfile(user.uid, updated);
  };

  // Task methods
  const upsertTask = async (task: Task) => {
    if (!user) return;
    const updated = tasks.some(t => t.id === task.id)
      ? tasks.map(t => (t.id === task.id ? task : t))
      : [task, ...tasks];
    setTasks(updated);
    await saveTask(user.uid, task);
  };

  const removeTask = async (taskId: string) => {
    if (!user) return;
    setTasks(tasks.filter(t => t.id !== taskId));
    await deleteFirestoreTask(user.uid, taskId);
  };

  const toggleTaskCompletion = async (taskId: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.isCompleted;
    const updated: Task = {
      ...task,
      isCompleted: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    setTasks(tasks.map(t => (t.id === taskId ? updated : t)));
    await saveTask(user.uid, updated);

    if (newCompleted) {
      fireCelebrationConfetti();
      setNotificationMessage(`Yay! "${task.title}" is complete! Wonderful job ✨`);
    }
  };

  // Event methods
  const upsertEvent = async (event: CalendarEvent) => {
    if (!user) return;
    const updated = events.some(e => e.id === event.id)
      ? events.map(e => (e.id === event.id ? event : e))
      : [...events, event];
    setEvents(updated);
    await saveEvent(user.uid, event);
  };

  const removeEvent = async (eventId: string) => {
    if (!user) return;
    setEvents(events.filter(e => e.id !== eventId));
    await deleteFirestoreEvent(user.uid, eventId);
  };

  // Academic methods
  const upsertAcademic = async (goal: AcademicGoal) => {
    if (!user) return;
    const updated = academics.some(a => a.id === goal.id)
      ? academics.map(a => (a.id === goal.id ? goal : a))
      : [...academics, goal];
    setAcademics(updated);
    await saveAcademic(user.uid, goal);
  };

  const removeAcademic = async (goalId: string) => {
    if (!user) return;
    setAcademics(academics.filter(a => a.id !== goalId));
    await deleteFirestoreAcademic(user.uid, goalId);
  };

  const logStudyHours = async (goalId: string, hours: number) => {
    if (!user) return;
    const goal = academics.find(a => a.id === goalId);
    if (!goal) return;
    const updated: AcademicGoal = {
      ...goal,
      completedHours: Math.max(0, goal.completedHours + hours),
      updatedAt: new Date().toISOString(),
    };
    setAcademics(academics.map(a => (a.id === goalId ? updated : a)));
    await saveAcademic(user.uid, updated);
  };

  // Routine methods
  const upsertRoutine = async (routine: Routine) => {
    if (!user) return;
    const updated = routines.some(r => r.id === routine.id)
      ? routines.map(r => (r.id === routine.id ? routine : r))
      : [...routines, routine];
    setRoutines(updated);
    await saveRoutine(user.uid, routine);
  };

  const removeRoutine = async (routineId: string) => {
    if (!user) return;
    setRoutines(routines.filter(r => r.id !== routineId));
    await deleteFirestoreRoutine(user.uid, routineId);
  };

  const toggleRoutineToday = async (routineId: string) => {
    if (!user) return;
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;

    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = routine.lastCompletedDate === today;

    let newStreak = routine.streak;
    let newLastDate: string | undefined = today;

    if (isCompletedToday) {
      newStreak = Math.max(0, routine.streak - 1);
      newLastDate = undefined;
    } else {
      newStreak = routine.streak + 1;
      fireCelebrationConfetti();
      setNotificationMessage(`Routine completed! Streak is now ${newStreak} days! Keep shining ✨`);
    }

    const updated: Routine = {
      ...routine,
      streak: newStreak,
      bestStreak: Math.max(routine.bestStreak, newStreak),
      lastCompletedDate: newLastDate,
      updatedAt: new Date().toISOString(),
    };

    setRoutines(routines.map(r => (r.id === routineId ? updated : r)));
    await saveRoutine(user.uid, updated);
  };

  // Focus session methods
  const logCompletedFocus = async (
    durationMinutes: number,
    taskId?: string,
    taskTitle?: string,
    notes?: string
  ) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const newSession: FocusSession = {
      id: `focus-${Date.now()}`,
      userId: user.uid,
      taskId,
      taskTitle,
      durationMinutes,
      date: today,
      startedAt: new Date(Date.now() - durationMinutes * 60000).toISOString(),
      endedAt: new Date().toISOString(),
      notes,
    };

    setFocusSessions([newSession, ...focusSessions]);
    await saveFocusSession(user.uid, newSession);
    fireCelebrationConfetti();
    setNotificationMessage(`Beautiful focus session of ${durationMinutes} mins recorded! Astra is so proud of you 🌸`);
  };

  // Timetable methods
  const commitTimetable = async (slots: ScheduledSlot[], date: string) => {
    if (!user) return;
    // Replace non-locked slots for date
    const remainingOtherDates = timetableSlots.filter(s => s.date !== date || s.isLocked);
    const combined = [...remainingOtherDates, ...slots];
    setTimetableSlots(combined);
    await saveTimetableSlots(user.uid, slots, date);
  };

  const toggleSlotLockState = async (slotId: string, isLocked: boolean) => {
    if (!user) return;
    setTimetableSlots(timetableSlots.map(s => (s.id === slotId ? { ...s, isLocked } : s)));
    await toggleSlotLock(user.uid, slotId, isLocked);
  };

  const value = useMemo(
    () => ({
      user,
      authLoading,
      authError,
      profile,
      tasks,
      events,
      academics,
      routines,
      focusSessions,
      timetableSlots,
      reducedMotion,
      setReducedMotion,
      activeTab,
      setActiveTab,
      loginWithGoogle,
      logout,
      updateProfile,
      upsertTask,
      removeTask,
      toggleTaskCompletion,
      upsertEvent,
      removeEvent,
      upsertAcademic,
      removeAcademic,
      logStudyHours,
      upsertRoutine,
      removeRoutine,
      toggleRoutineToday,
      logCompletedFocus,
      commitTimetable,
      toggleSlotLockState,
      refreshAllData,
      notificationMessage,
      setNotificationMessage,
    }),
    [
      user,
      authLoading,
      authError,
      profile,
      tasks,
      events,
      academics,
      routines,
      focusSessions,
      timetableSlots,
      reducedMotion,
      activeTab,
      notificationMessage,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
