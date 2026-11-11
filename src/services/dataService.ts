import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config.ts';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler.ts';
import {
  Task,
  CalendarEvent,
  AcademicGoal,
  Routine,
  FocusSession,
  ScheduledSlot,
  UserProfile,
} from '../types/index.ts';

function isDemoMode(): boolean {
  return !auth.currentUser;
}

// User Profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (isDemoMode()) return null;
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Tasks
export async function getTasks(userId: string): Promise<Task[]> {
  if (isDemoMode()) return [];
  const path = `users/${userId}/tasks`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'tasks'));
    return snap.docs.map(d => d.data() as Task);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveTask(userId: string, task: Task): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}/tasks/${task.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'tasks', task.id), task);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Events
export async function getEvents(userId: string): Promise<CalendarEvent[]> {
  if (isDemoMode()) return [];
  const path = `users/${userId}/events`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'events'));
    return snap.docs.map(d => d.data() as CalendarEvent);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveEvent(userId: string, event: CalendarEvent): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}/events/${event.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'events', event.id), event);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEvent(userId: string, eventId: string): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}/events/${eventId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'events', eventId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Academics
export async function getAcademics(userId: string): Promise<AcademicGoal[]> {
  if (isDemoMode()) return [];
  const path = `users/${userId}/academics`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'academics'));
    return snap.docs.map(d => d.data() as AcademicGoal);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveAcademic(userId: string, academic: AcademicGoal): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}/academics/${academic.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'academics', academic.id), academic);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAcademic(userId: string, academicId: string): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}/academics/${academicId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'academics', academicId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Routines
export async function getRoutines(userId: string): Promise<Routine[]> {
  if (isDemoMode()) return [];
  const path = `users/${userId}/routines`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'routines'));
    return snap.docs.map(d => d.data() as Routine);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveRoutine(userId: string, routine: Routine): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}/routines/${routine.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'routines', routine.id), routine);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteRoutine(userId: string, routineId: string): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}/routines/${routineId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'routines', routineId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Focus Sessions
export async function getFocusSessions(userId: string): Promise<FocusSession[]> {
  if (isDemoMode()) return [];
  const path = `users/${userId}/focus_sessions`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'focus_sessions'));
    return snap.docs.map(d => d.data() as FocusSession);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveFocusSession(userId: string, session: FocusSession): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}/focus_sessions/${session.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'focus_sessions', session.id), session);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Timetable Slots
export async function getTimetableSlots(userId: string): Promise<ScheduledSlot[]> {
  if (isDemoMode()) return [];
  const path = `users/${userId}/timetable`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'timetable'));
    return snap.docs.map(d => d.data() as ScheduledSlot);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveTimetableSlots(userId: string, slots: ScheduledSlot[], date: string): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}/timetable`;
  try {
    const batch = writeBatch(db);
    // Delete existing non-locked slots for this date
    const existing = await getDocs(collection(db, 'users', userId, 'timetable'));
    for (const d of existing.docs) {
      const data = d.data() as ScheduledSlot;
      if (data.date === date && !data.isLocked) {
        batch.delete(d.ref);
      }
    }
    // Add new slots
    for (const slot of slots) {
      const ref = doc(db, 'users', userId, 'timetable', slot.id);
      batch.set(ref, slot);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function toggleSlotLock(userId: string, slotId: string, isLocked: boolean): Promise<void> {
  if (isDemoMode()) return;
  const path = `users/${userId}/timetable/${slotId}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'timetable', slotId), { isLocked });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Seed Initial Data for New Owner Account
export async function seedInitialUserData(userId: string, email: string, name: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const defaultProfile: UserProfile = {
    uid: userId,
    email,
    displayName: name || 'Rakshith',
    targetSGPA: 9.0,
    currentSGPA: 8.75,
    mascotName: 'Astra-chan',
    aiEnabled: true,
    aiPrivacyStrict: false,
    workHoursStart: '07:30',
    workHoursEnd: '22:30',
    defaultFocusDuration: 45,
    defaultBreakDuration: 10,
  };
  await saveUserProfile(userId, defaultProfile);

  // Sample tasks
  const sampleTasks: Task[] = [
    {
      id: 'task-1',
      userId,
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
      userId,
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
      userId,
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
  ];

  for (const t of sampleTasks) {
    await saveTask(userId, t);
  }

  // Sample fixed events (College, Travel)
  const sampleEvents: CalendarEvent[] = [
    {
      id: 'ev-college',
      userId,
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
      userId,
      title: 'Metro / Campus Transit',
      category: 'Travel',
      date: today,
      startTime: '13:00',
      endTime: '13:45',
      isFixed: true,
      color: '#fb923c',
    },
    {
      id: 'ev-lunch',
      userId,
      title: 'Lunch & Rest Break',
      category: 'Personal',
      date: today,
      startTime: '13:45',
      endTime: '14:30',
      isFixed: true,
      color: '#10b981',
    },
  ];

  for (const ev of sampleEvents) {
    await saveEvent(userId, ev);
  }

  // Sample academic goals
  const sampleAcademics: AcademicGoal[] = [
    {
      id: 'acad-1',
      userId,
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
    {
      id: 'acad-2',
      userId,
      subjectName: 'Operating Systems & Kernels',
      subjectCode: 'CS302',
      credits: 4,
      targetGrade: 'A+',
      plannedHours: 35,
      completedHours: 22,
      semester: 'Semester 5',
      examType: 'Internal Test 2',
      examDate: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'acad-3',
      userId,
      subjectName: 'Database Management Systems',
      subjectCode: 'CS303',
      credits: 3,
      targetGrade: 'A',
      plannedHours: 30,
      completedHours: 24,
      semester: 'Semester 5',
      examType: 'Lab Viva',
      examDate: new Date(Date.now() + 86400000 * 16).toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const ac of sampleAcademics) {
    await saveAcademic(userId, ac);
  }

  // Sample routines
  const sampleRoutines: Routine[] = [
    {
      id: 'rout-1',
      userId,
      title: 'Morning Gym & Mobility Session',
      frequency: 'daily',
      preferredTime: '06:30',
      durationMinutes: 45,
      streak: 8,
      bestStreak: 14,
      lastCompletedDate: today,
      color: '#ec4899',
      icon: 'Dumbbell',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rout-2',
      userId,
      title: 'Competitive Programming Practice',
      frequency: 'daily',
      preferredTime: '17:00',
      durationMinutes: 60,
      streak: 12,
      bestStreak: 21,
      color: '#8b5cf6',
      icon: 'Code',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rout-3',
      userId,
      title: 'Mindful Evening Reading & Reflection',
      frequency: 'daily',
      preferredTime: '22:00',
      durationMinutes: 25,
      streak: 5,
      bestStreak: 9,
      color: '#f59e0b',
      icon: 'BookOpen',
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const r of sampleRoutines) {
    await saveRoutine(userId, r);
  }

  // Sample past focus session
  const sampleFocus: FocusSession = {
    id: 'foc-1',
    userId,
    taskId: 'task-1',
    taskTitle: 'Operating Systems - Process Scheduling',
    durationMinutes: 45,
    date: today,
    startedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    endedAt: new Date(Date.now() - 3600000 * 2.25).toISOString(),
    notes: 'Completed Round Robin logic and initialized waiting time calculations.',
  };
  await saveFocusSession(userId, sampleFocus);
}

// Export All User Data to JSON
export async function exportAllDataAsJSON(userId: string): Promise<string> {
  const profile = await getUserProfile(userId);
  const tasks = await getTasks(userId);
  const events = await getEvents(userId);
  const academics = await getAcademics(userId);
  const routines = await getRoutines(userId);
  const focusSessions = await getFocusSessions(userId);
  const timetable = await getTimetableSlots(userId);

  const payload = {
    exportedAt: new Date().toISOString(),
    appName: 'ASTRA-PLAN',
    version: '1.0',
    profile,
    tasks,
    events,
    academics,
    routines,
    focusSessions,
    timetable,
  };

  return JSON.stringify(payload, null, 2);
}

// Export Tasks to CSV
export function exportTasksToCSV(tasks: Task[]): string {
  const headers = ['ID', 'Title', 'Category', 'Priority', 'EstimatedMinutes', 'DeadlineDate', 'DeadlineTime', 'IsCompleted'];
  const rows = tasks.map(t => [
    `"${t.id}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    `"${t.priority}"`,
    t.estimatedMinutes,
    `"${t.deadlineDate || ''}"`,
    `"${t.deadlineTime || ''}"`,
    t.isCompleted ? 'YES' : 'NO',
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Export Calendar to iCalendar (.ics) format
export function exportEventsToICS(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ASTRA-PLAN//Personal Productivity Assistant//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const ev of events) {
    const cleanDate = ev.date.replace(/-/g, '');
    const cleanStart = ev.startTime.replace(/:/g, '') + '00';
    const cleanEnd = ev.endTime.replace(/:/g, '') + '00';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}@astraplan.app`);
    lines.push(`DTSTAMP:${cleanDate}T000000Z`);
    lines.push(`DTSTART:${cleanDate}T${cleanStart}`);
    lines.push(`DTEND:${cleanDate}T${cleanEnd}`);
    lines.push(`SUMMARY:${ev.title}`);
    lines.push(`DESCRIPTION:${ev.category} - ${ev.description || 'Personal schedule commitment'}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Delete All Owner Data
export async function deleteAllOwnerData(userId: string): Promise<void> {
  const batch = writeBatch(db);

  const taskDocs = await getDocs(collection(db, 'users', userId, 'tasks'));
  taskDocs.forEach(d => batch.delete(d.ref));

  const evDocs = await getDocs(collection(db, 'users', userId, 'events'));
  evDocs.forEach(d => batch.delete(d.ref));

  const acadDocs = await getDocs(collection(db, 'users', userId, 'academics'));
  acadDocs.forEach(d => batch.delete(d.ref));

  const routDocs = await getDocs(collection(db, 'users', userId, 'routines'));
  routDocs.forEach(d => batch.delete(d.ref));

  const focDocs = await getDocs(collection(db, 'users', userId, 'focus_sessions'));
  focDocs.forEach(d => batch.delete(d.ref));

  const timeDocs = await getDocs(collection(db, 'users', userId, 'timetable'));
  timeDocs.forEach(d => batch.delete(d.ref));

  batch.delete(doc(db, 'users', userId));
  await batch.commit();
}
