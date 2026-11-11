export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TaskCategory =
  | 'University'
  | 'Assignments'
  | 'Exams'
  | 'Programming'
  | 'Personal'
  | 'Fitness'
  | 'Music'
  | 'Creative'
  | 'Travel'
  | 'Other';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'any';

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory | string;
  priority: TaskPriority;
  estimatedMinutes: number;
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime?: string; // HH:MM
  preferredTimeOfDay?: TimeOfDay;
  minSessionMinutes: number;
  canSplit: boolean;
  isCompleted: boolean;
  completedAt?: string;
  checklist?: TaskChecklistItem[];
  personalNotes?: string;
  recurringSchedule?: string;
  reminderMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  category: 'College' | 'Travel' | 'Exam' | 'Appointment' | 'Routine' | 'Personal' | 'Study' | string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isFixed: boolean;
  isPinned?: boolean;
  description?: string;
  color?: string;
}

export interface ScheduledSlot {
  id: string;
  userId: string;
  date: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  startMinutes: number;
  endMinutes: number;
  category: string;
  taskId?: string;
  isFixed: boolean;
  isLocked: boolean;
  isBreak?: boolean;
  isCompleted?: boolean;
}

export interface ScheduleGenerationParams {
  date: string; // YYYY-MM-DD
  currentTime?: string; // HH:MM (if scheduling for today, tasks won't be scheduled earlier than now)
  workingHours: { start: string; end: string };
  breakDuration: number; // minutes
  fixedEvents: CalendarEvent[];
  existingSlots?: ScheduledSlot[];
  tasks: Task[];
  preferredStudyTimes?: ('morning' | 'afternoon' | 'evening' | 'night')[];
}

export interface ScheduleResult {
  scheduledSlots: ScheduledSlot[];
  unplacedTasks: { task: Task; reason: string }[];
  totalFocusMinutes: number;
  totalFreeMinutes: number;
  isValid: boolean;
  conflicts: string[];
}

export interface AcademicGoal {
  id: string;
  userId: string;
  subjectName: string;
  subjectCode?: string;
  credits: number;
  targetGrade?: string;
  plannedHours: number;
  completedHours: number;
  examDate?: string;
  examType?: string;
  semester: string;
  updatedAt: string;
}

export interface Routine {
  id: string;
  userId: string;
  title: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'weekly';
  preferredTime?: string;
  durationMinutes: number;
  streak: number;
  bestStreak: number;
  lastCompletedDate?: string;
  color?: string;
  icon?: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  startedAt: string;
  endedAt?: string;
  notes?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  targetSGPA: number;
  currentSGPA: number;
  mascotName: string;
  aiEnabled: boolean;
  aiPrivacyStrict: boolean;
  workHoursStart: string;
  workHoursEnd: string;
  defaultFocusDuration: number;
  defaultBreakDuration: number;
}
