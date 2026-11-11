import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSchedule,
  hasOverlap,
  timeToMinutes,
  minutesToTime,
  mergeIntervals,
  computeFreeIntervals,
} from './scheduler.ts';
import { CalendarEvent, ScheduledSlot, Task } from '../types/index.ts';

const baseWorkingHours = { start: '08:00', end: '20:00' };
const testDate = '2026-11-05';

test('1. Two overlapping fixed events are detected and reported as conflict', () => {
  const fixedEvents: CalendarEvent[] = [
    {
      id: 'e1',
      userId: 'user1',
      title: 'Math Lecture',
      category: 'College',
      date: testDate,
      startTime: '09:00',
      endTime: '11:00',
      isFixed: true,
    },
    {
      id: 'e2',
      userId: 'user1',
      title: 'Physics Lab',
      category: 'College',
      date: testDate,
      startTime: '10:30',
      endTime: '12:00',
      isFixed: true,
    },
  ];

  const result = generateSchedule({
    date: testDate,
    workingHours: baseWorkingHours,
    breakDuration: 10,
    fixedEvents,
    tasks: [],
  });

  assert.equal(result.isValid, false);
  assert.ok(result.conflicts.length > 0);
  assert.match(result.conflicts[0], /Math Lecture.*Physics Lab/);
});

test('2. College and travel conflicts: Travel period blocks study placement', () => {
  const fixedEvents: CalendarEvent[] = [
    {
      id: 'col1',
      userId: 'user1',
      title: 'College Class',
      category: 'College',
      date: testDate,
      startTime: '09:00',
      endTime: '13:00',
      isFixed: true,
    },
    {
      id: 'trav1',
      userId: 'user1',
      title: 'Bus Travel Home',
      category: 'Travel',
      date: testDate,
      startTime: '13:00',
      endTime: '14:30',
      isFixed: true,
    },
  ];

  const task: Task = {
    id: 't1',
    userId: 'user1',
    title: 'Study Data Structures',
    category: 'University',
    priority: 'High',
    estimatedMinutes: 60,
    deadlineDate: testDate,
    deadlineTime: '18:00',
    minSessionMinutes: 30,
    canSplit: false,
    isCompleted: false,
    createdAt: '',
    updatedAt: '',
  };

  const result = generateSchedule({
    date: testDate,
    workingHours: baseWorkingHours,
    breakDuration: 10,
    fixedEvents,
    tasks: [task],
  });

  assert.equal(result.isValid, true);
  // The study task should NOT be placed between 09:00 and 14:30
  const studySlot = result.scheduledSlots.find(s => s.taskId === 't1');
  assert.ok(studySlot, 'Study slot must be scheduled');
  assert.ok(
    studySlot.startMinutes >= timeToMinutes('14:30') || studySlot.endMinutes <= timeToMinutes('09:00'),
    'Study task must not overlap with College or Travel'
  );
});

test('3. Urgent task with upcoming deadline is prioritized over lower-priority task', () => {
  const urgentTask: Task = {
    id: 't-urgent',
    userId: 'user1',
    title: 'Submit Assignment',
    category: 'Assignments',
    priority: 'Critical',
    estimatedMinutes: 60,
    deadlineDate: testDate,
    deadlineTime: '11:00',
    minSessionMinutes: 30,
    canSplit: false,
    isCompleted: false,
    createdAt: '',
    updatedAt: '',
  };

  const casualTask: Task = {
    id: 't-casual',
    userId: 'user1',
    title: 'Guitar Practice',
    category: 'Music',
    priority: 'Low',
    estimatedMinutes: 60,
    deadlineDate: '2026-11-10',
    minSessionMinutes: 30,
    canSplit: false,
    isCompleted: false,
    createdAt: '',
    updatedAt: '',
  };

  const result = generateSchedule({
    date: testDate,
    workingHours: { start: '08:00', end: '12:00' },
    breakDuration: 10,
    fixedEvents: [],
    tasks: [casualTask, urgentTask], // note order inverted
  });

  assert.equal(result.isValid, true);
  const urgentSlot = result.scheduledSlots.find(s => s.taskId === 't-urgent');
  const casualSlot = result.scheduledSlots.find(s => s.taskId === 't-casual');

  assert.ok(urgentSlot, 'Urgent task must be scheduled');
  assert.ok(urgentSlot.endMinutes <= timeToMinutes('11:00'), 'Must be scheduled before its 11:00 deadline');
  if (casualSlot) {
    assert.ok(urgentSlot.startMinutes < casualSlot.startMinutes, 'Urgent task gets earlier slot');
  }
});

test('4. A task that must be split across separated time windows', () => {
  // Free windows: 08:00-09:00 (60 mins) and 11:00-12:00 (60 mins)
  const fixedEvents: CalendarEvent[] = [
    {
      id: 'block1',
      userId: 'user1',
      title: 'Lab',
      category: 'College',
      date: testDate,
      startTime: '09:00',
      endTime: '11:00',
      isFixed: true,
    },
  ];

  const splittableTask: Task = {
    id: 't-split',
    userId: 'user1',
    title: 'Operating Systems Project',
    category: 'Programming',
    priority: 'High',
    estimatedMinutes: 90,
    deadlineDate: testDate,
    deadlineTime: '13:00',
    minSessionMinutes: 30,
    canSplit: true,
    isCompleted: false,
    createdAt: '',
    updatedAt: '',
  };

  const result = generateSchedule({
    date: testDate,
    workingHours: { start: '08:00', end: '12:00' },
    breakDuration: 10,
    fixedEvents,
    tasks: [splittableTask],
  });

  assert.equal(result.isValid, true);
  const parts = result.scheduledSlots.filter(s => s.taskId === 't-split');
  assert.equal(parts.length, 2, 'Task must be split into 2 parts across the blocking lab');
  assert.equal(parts[0].endMinutes, timeToMinutes('09:00'));
  assert.equal(parts[1].startMinutes, timeToMinutes('11:00'));
});

test('5. Insufficient available time: Task reported in unplacedTasks', () => {
  const fixedEvents: CalendarEvent[] = [
    {
      id: 'b1',
      userId: 'user1',
      title: 'Exam',
      category: 'Exam',
      date: testDate,
      startTime: '08:00',
      endTime: '19:30',
      isFixed: true,
    },
  ];

  const bigTask: Task = {
    id: 't-big',
    userId: 'user1',
    title: 'Research Paper',
    category: 'University',
    priority: 'Medium',
    estimatedMinutes: 120,
    deadlineDate: testDate,
    minSessionMinutes: 60,
    canSplit: false,
    isCompleted: false,
    createdAt: '',
    updatedAt: '',
  };

  const result = generateSchedule({
    date: testDate,
    workingHours: baseWorkingHours,
    breakDuration: 10,
    fixedEvents,
    tasks: [bigTask],
  });

  assert.equal(result.unplacedTasks.length, 1);
  assert.equal(result.unplacedTasks[0].task.id, 't-big');
  assert.match(result.unplacedTasks[0].reason, /no single free block/i);
});

test('6. Locked schedule sessions are preserved verbatim', () => {
  const lockedSlot: ScheduledSlot = {
    id: 'locked-study-1',
    userId: 'user1',
    date: testDate,
    title: 'Locked Focus Block',
    startTime: '10:00',
    endTime: '11:30',
    startMinutes: timeToMinutes('10:00'),
    endMinutes: timeToMinutes('11:30'),
    category: 'Study',
    isFixed: false,
    isLocked: true,
  };

  const newTask: Task = {
    id: 't-new',
    userId: 'user1',
    title: 'Read Textbook',
    category: 'University',
    priority: 'High',
    estimatedMinutes: 45,
    deadlineDate: testDate,
    minSessionMinutes: 30,
    canSplit: false,
    isCompleted: false,
    createdAt: '',
    updatedAt: '',
  };

  const result = generateSchedule({
    date: testDate,
    workingHours: baseWorkingHours,
    breakDuration: 10,
    fixedEvents: [],
    existingSlots: [lockedSlot],
    tasks: [newTask],
  });

  assert.equal(result.isValid, true);
  const foundLocked = result.scheduledSlots.find(s => s.id === 'locked-study-1');
  assert.ok(foundLocked, 'Locked slot must be preserved in final timetable');
  assert.equal(foundLocked.startTime, '10:00');
  assert.equal(foundLocked.endTime, '11:30');

  const newSlot = result.scheduledSlots.find(s => s.taskId === 't-new');
  assert.ok(newSlot);
  assert.ok(
    !hasOverlap(
      { start: foundLocked.startMinutes, end: foundLocked.endMinutes },
      { start: newSlot.startMinutes, end: newSlot.endMinutes }
    ),
    'New task must not overlap with locked slot'
  );
});

test('7. Regenerating a schedule without changing locked commitments', () => {
  const locked1: ScheduledSlot = {
    id: 'lock-a',
    userId: 'user1',
    date: testDate,
    title: 'Chemistry Revision',
    startTime: '08:30',
    endTime: '09:30',
    startMinutes: timeToMinutes('08:30'),
    endMinutes: timeToMinutes('09:30'),
    category: 'Study',
    isFixed: false,
    isLocked: true,
  };

  const unlocked1: ScheduledSlot = {
    id: 'unlocked-b',
    userId: 'user1',
    date: testDate,
    title: 'Old Placement',
    startTime: '14:00',
    endTime: '15:00',
    startMinutes: timeToMinutes('14:00'),
    endMinutes: timeToMinutes('15:00'),
    category: 'Personal',
    isFixed: false,
    isLocked: false,
  };

  const task: Task = {
    id: 't-regen',
    userId: 'user1',
    title: 'New Important Task',
    category: 'University',
    priority: 'Critical',
    estimatedMinutes: 60,
    deadlineDate: testDate,
    minSessionMinutes: 30,
    canSplit: false,
    isCompleted: false,
    createdAt: '',
    updatedAt: '',
  };

  const result = generateSchedule({
    date: testDate,
    workingHours: baseWorkingHours,
    breakDuration: 10,
    fixedEvents: [],
    existingSlots: [locked1, unlocked1],
    tasks: [task],
  });

  assert.equal(result.isValid, true);
  assert.ok(result.scheduledSlots.some(s => s.id === 'lock-a'), 'Locked commitment preserved');
  assert.ok(!result.scheduledSlots.some(s => s.id === 'unlocked-b'), 'Unlocked previous slot re-evaluated');
});

test('8. Tasks with past deadlines are flagged and not scheduled', () => {
  const pastTask: Task = {
    id: 't-past',
    userId: 'user1',
    title: 'Yesterday Assignment',
    category: 'University',
    priority: 'Medium',
    estimatedMinutes: 60,
    deadlineDate: '2026-11-04', // past
    minSessionMinutes: 30,
    canSplit: false,
    isCompleted: false,
    createdAt: '',
    updatedAt: '',
  };

  const result = generateSchedule({
    date: testDate,
    workingHours: baseWorkingHours,
    breakDuration: 10,
    fixedEvents: [],
    tasks: [pastTask],
  });

  assert.equal(result.unplacedTasks.length, 1);
  assert.equal(result.unplacedTasks[0].task.id, 't-past');
  assert.match(result.unplacedTasks[0].reason, /past/i);
});

test('9. No available time windows: Current time is past working hours', () => {
  const task: Task = {
    id: 't-late',
    userId: 'user1',
    title: 'Night study',
    category: 'University',
    priority: 'High',
    estimatedMinutes: 45,
    deadlineDate: testDate,
    minSessionMinutes: 30,
    canSplit: false,
    isCompleted: false,
    createdAt: '',
    updatedAt: '',
  };

  const result = generateSchedule({
    date: testDate,
    currentTime: '21:00', // Past 20:00
    workingHours: baseWorkingHours,
    breakDuration: 10,
    fixedEvents: [],
    tasks: [task],
  });

  assert.equal(result.unplacedTasks.length, 1);
  assert.match(result.unplacedTasks[0].reason, /past the daily working hours/i);
});

test('10. Exact boundary conditions between consecutive activities', () => {
  // Activity 1: 09:00 - 10:00
  // Activity 2: 10:00 - 11:00
  // They touch at 10:00 and must NOT be considered overlapping
  const a = { start: timeToMinutes('09:00'), end: timeToMinutes('10:00') };
  const b = { start: timeToMinutes('10:00'), end: timeToMinutes('11:00') };

  assert.equal(hasOverlap(a, b), false, 'Touching boundaries must not overlap');

  const freeIntervals = computeFreeIntervals(
    timeToMinutes('08:00'),
    timeToMinutes('12:00'),
    [
      { start: timeToMinutes('09:00'), end: timeToMinutes('10:00') },
      { start: timeToMinutes('10:00'), end: timeToMinutes('11:00') },
    ]
  );

  assert.equal(freeIntervals.length, 2);
  assert.equal(minutesToTime(freeIntervals[0].start), '08:00');
  assert.equal(minutesToTime(freeIntervals[0].end), '09:00');
  assert.equal(minutesToTime(freeIntervals[1].start), '11:00');
  assert.equal(minutesToTime(freeIntervals[1].end), '12:00');
});
