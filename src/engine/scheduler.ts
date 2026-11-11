import { CalendarEvent, ScheduledSlot, ScheduleGenerationParams, ScheduleResult, Task } from '../types/index.ts';

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(1439, Math.floor(minutes)));
  const hrs = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export interface Interval {
  start: number;
  end: number;
  source?: string;
}

/**
 * Checks if two intervals overlap.
 * Exact boundaries (endA === startB) do NOT overlap.
 */
export function hasOverlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Validates that an entire list of scheduled slots contains no internal overlaps.
 */
export function validateNoOverlaps(slots: ScheduledSlot[]): { isValid: boolean; conflicts: string[] } {
  const conflicts: string[] = [];
  const sorted = [...slots].sort((a, b) => a.startMinutes - b.startMinutes);

  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const nxt = sorted[i + 1];
    if (cur.startMinutes < nxt.endMinutes && nxt.startMinutes < cur.endMinutes) {
      conflicts.push(`Conflict between "${cur.title}" (${cur.startTime}-${cur.endTime}) and "${nxt.title}" (${nxt.startTime}-${nxt.endTime})`);
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts,
  };
}

/**
 * Merges a list of blocking intervals into a sorted, disjoint list of busy intervals.
 */
export function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];

  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: Interval[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
      if (current.source && !last.source?.includes(current.source)) {
        last.source = `${last.source || ''}, ${current.source}`;
      }
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

/**
 * Computes available free intervals within [workStart, workEnd] excluding busy intervals.
 */
export function computeFreeIntervals(
  workStart: number,
  workEnd: number,
  busyIntervals: Interval[]
): Interval[] {
  if (workStart >= workEnd) return [];

  const relevant = busyIntervals
    .map(b => ({
      start: Math.max(workStart, b.start),
      end: Math.min(workEnd, b.end),
    }))
    .filter(b => b.start < b.end);

  const merged = mergeIntervals(relevant);
  const free: Interval[] = [];

  let cursor = workStart;
  for (const busy of merged) {
    if (busy.start > cursor) {
      free.push({ start: cursor, end: busy.start });
    }
    cursor = Math.max(cursor, busy.end);
  }

  if (cursor < workEnd) {
    free.push({ start: cursor, end: workEnd });
  }

  return free;
}

/**
 * Calculates priority score for ranking pending tasks.
 * Critical > High > Medium > Low.
 * Closeness to deadline increases score.
 */
export function calculateTaskPriorityScore(task: Task, targetDate: string): number {
  let score = 0;
  // Priority weight
  switch (task.priority) {
    case 'Critical': score += 1000; break;
    case 'High': score += 500; break;
    case 'Medium': score += 200; break;
    case 'Low': score += 50; break;
  }

  // Urgency based on deadline
  if (task.deadlineDate) {
    if (task.deadlineDate === targetDate) {
      score += 400;
      if (task.deadlineTime) {
        // Earlier deadline time gets higher urgency
        const dlMin = timeToMinutes(task.deadlineTime);
        score += Math.max(0, 1440 - dlMin) / 10;
      }
    } else if (task.deadlineDate < targetDate) {
      // Overdue! Needs urgent completion
      score += 800;
    } else {
      // Future date
      const daysDiff = (new Date(task.deadlineDate).getTime() - new Date(targetDate).getTime()) / (1000 * 3600 * 24);
      if (daysDiff <= 1) score += 250;
      else if (daysDiff <= 3) score += 100;
      else if (daysDiff <= 7) score += 40;
    }
  }

  return score;
}

/**
 * Main deterministic scheduling engine.
 */
export function generateSchedule(params: ScheduleGenerationParams): ScheduleResult {
  const {
    date,
    currentTime,
    workingHours,
    breakDuration = 10,
    fixedEvents = [],
    existingSlots = [],
    tasks = [],
  } = params;

  const workStartMin = timeToMinutes(workingHours.start);
  const workEndMin = timeToMinutes(workingHours.end);

  // If scheduling for today and currentTime is later than workStart, clamp start
  let effectiveStart = workStartMin;
  if (currentTime) {
    const currentMin = timeToMinutes(currentTime);
    if (currentMin > effectiveStart) {
      effectiveStart = currentMin;
    }
  }

  // Collect all non-movable intervals:
  // 1. Fixed events for this date (College, Travel, Exam, Appointment, etc.)
  // 2. Existing locked slots from previous timetable
  const fixedSlots: ScheduledSlot[] = [];
  const blockingIntervals: Interval[] = [];

  // Filter fixed events for this specific date
  const eventsForDate = fixedEvents.filter(e => e.date === date);

  // Check if any fixed events overlap with each other
  const fixedConflicts: string[] = [];
  for (let i = 0; i < eventsForDate.length; i++) {
    for (let j = i + 1; j < eventsForDate.length; j++) {
      const e1 = eventsForDate[i];
      const e2 = eventsForDate[j];
      const e1Start = timeToMinutes(e1.startTime);
      const e1End = timeToMinutes(e1.endTime);
      const e2Start = timeToMinutes(e2.startTime);
      const e2End = timeToMinutes(e2.endTime);

      if (hasOverlap({ start: e1Start, end: e1End }, { start: e2Start, end: e2End })) {
        fixedConflicts.push(
          `Conflict between fixed events "${e1.title}" (${e1.startTime}-${e1.endTime}) and "${e2.title}" (${e2.startTime}-${e2.endTime})`
        );
      }
    }
  }

  for (const ev of eventsForDate) {
    const startMin = timeToMinutes(ev.startTime);
    const endMin = timeToMinutes(ev.endTime);

    if (endMin > startMin) {
      blockingIntervals.push({ start: startMin, end: endMin, source: `Event: ${ev.title}` });
      fixedSlots.push({
        id: `fixed-${ev.id}`,
        userId: ev.userId,
        date,
        title: ev.title,
        startTime: ev.startTime,
        endTime: ev.endTime,
        startMinutes: startMin,
        endMinutes: endMin,
        category: ev.category,
        isFixed: true,
        isLocked: true,
      });
    }
  }

  // Preserve locked existing slots (that aren't already represented by fixed events)
  const lockedSlots = existingSlots.filter(s => s.date === date && s.isLocked);
  for (const slot of lockedSlots) {
    const alreadyPresent = fixedSlots.some(f => f.startMinutes === slot.startMinutes && f.endMinutes === slot.endMinutes);
    if (!alreadyPresent) {
      blockingIntervals.push({ start: slot.startMinutes, end: slot.endMinutes, source: `Locked: ${slot.title}` });
      fixedSlots.push({ ...slot });
    }
  }

  // Filter pending, uncompleted tasks
  const pendingTasks = tasks.filter(t => !t.isCompleted);

  // Rank pending tasks
  const rankedTasks = [...pendingTasks].sort((a, b) => {
    const scoreA = calculateTaskPriorityScore(a, date);
    const scoreB = calculateTaskPriorityScore(b, date);
    return scoreB - scoreA;
  });

  const scheduledTaskSlots: ScheduledSlot[] = [];
  const unplacedTasks: { task: Task; reason: string }[] = [];

  // If effective start is already at or past workEnd, no windows are available
  if (effectiveStart >= workEndMin) {
    for (const task of rankedTasks) {
      unplacedTasks.push({ task, reason: 'Current time is past the daily working hours window.' });
    }
    const finalSlots = [...fixedSlots].sort((a, b) => a.startMinutes - b.startMinutes);
    const validation = validateNoOverlaps(finalSlots);
    return {
      scheduledSlots: finalSlots,
      unplacedTasks,
      totalFocusMinutes: 0,
      totalFreeMinutes: 0,
      isValid: validation.isValid && fixedConflicts.length === 0,
      conflicts: [...fixedConflicts, ...validation.conflicts],
    };
  }

  // Calculate free time intervals
  let freeIntervals = computeFreeIntervals(effectiveStart, workEndMin, blockingIntervals);

  for (const task of rankedTasks) {
    // Check deadline
    if (task.deadlineDate && task.deadlineDate < date) {
      unplacedTasks.push({
        task,
        reason: `Deadline (${task.deadlineDate}) is already in the past.`,
      });
      continue;
    }

    // Determine deadline cutoff for today
    let maxAllowedMinutes = workEndMin;
    if (task.deadlineDate === date && task.deadlineTime) {
      const deadlineMin = timeToMinutes(task.deadlineTime);
      maxAllowedMinutes = Math.min(workEndMin, deadlineMin);
      if (maxAllowedMinutes <= effectiveStart) {
        unplacedTasks.push({
          task,
          reason: `Deadline time (${task.deadlineTime}) has already passed for today.`,
        });
        continue;
      }
    }

    const minChunk = Math.max(15, task.minSessionMinutes || 30);
    let remainingMinutes = task.estimatedMinutes;
    let placedMinutes = 0;

    // Try placing the task into available intervals
    let canPlace = false;

    // Check if task can fit in one single interval if !task.canSplit
    if (!task.canSplit) {
      const neededWithBreak = remainingMinutes + breakDuration;
      let targetIntervalIdx = -1;

      for (let i = 0; i < freeIntervals.length; i++) {
        const interval = freeIntervals[i];
        const effectiveEnd = Math.min(interval.end, maxAllowedMinutes);
        const available = effectiveEnd - interval.start;

        if (available >= remainingMinutes) {
          targetIntervalIdx = i;
          break;
        }
      }

      if (targetIntervalIdx !== -1) {
        const interval = freeIntervals[targetIntervalIdx];
        const slotStart = interval.start;
        const slotEnd = slotStart + remainingMinutes;

        scheduledTaskSlots.push({
          id: `task-${task.id}-0`,
          userId: task.userId,
          date,
          title: task.title,
          startTime: minutesToTime(slotStart),
          endTime: minutesToTime(slotEnd),
          startMinutes: slotStart,
          endMinutes: slotEnd,
          category: task.category,
          taskId: task.id,
          isFixed: false,
          isLocked: false,
        });

        // Add break if there's enough time before workEnd
        const breakEnd = Math.min(workEndMin, slotEnd + breakDuration);
        const nextStart = breakEnd;

        // Update interval
        if (nextStart < interval.end) {
          freeIntervals[targetIntervalIdx] = { start: nextStart, end: interval.end };
        } else {
          freeIntervals.splice(targetIntervalIdx, 1);
        }
        canPlace = true;
      } else {
        unplacedTasks.push({
          task,
          reason: `Requires contiguous ${remainingMinutes}m, but no single free block is large enough before deadline.`,
        });
      }
    } else {
      // Task can be split into chunks of at least minChunk
      let chunkIndex = 0;
      let i = 0;

      while (remainingMinutes > 0 && i < freeIntervals.length) {
        const interval = freeIntervals[i];
        const effectiveEnd = Math.min(interval.end, maxAllowedMinutes);
        const available = effectiveEnd - interval.start;

        if (available >= minChunk) {
          const chunkDuration = Math.min(remainingMinutes, available);
          // Don't leave a tiny leftover smaller than minChunk unless it completes the task
          const slotStart = interval.start;
          const slotEnd = slotStart + chunkDuration;

          scheduledTaskSlots.push({
            id: `task-${task.id}-${chunkIndex++}`,
            userId: task.userId,
            date,
            title: `${task.title}${chunkIndex > 1 || remainingMinutes > chunkDuration ? ` (Part ${chunkIndex})` : ''}`,
            startTime: minutesToTime(slotStart),
            endTime: minutesToTime(slotEnd),
            startMinutes: slotStart,
            endMinutes: slotEnd,
            category: task.category,
            taskId: task.id,
            isFixed: false,
            isLocked: false,
          });

          remainingMinutes -= chunkDuration;
          placedMinutes += chunkDuration;

          const breakEnd = Math.min(workEndMin, slotEnd + breakDuration);
          if (breakEnd < interval.end) {
            freeIntervals[i] = { start: breakEnd, end: interval.end };
          } else {
            freeIntervals.splice(i, 1);
            continue; // don't increment i since we spliced
          }
        }
        i++;
      }

      if (remainingMinutes === 0) {
        canPlace = true;
      } else if (placedMinutes > 0) {
        unplacedTasks.push({
          task,
          reason: `Partially scheduled (${placedMinutes}m of ${task.estimatedMinutes}m); ran out of available time before deadline.`,
        });
      } else {
        unplacedTasks.push({
          task,
          reason: `Insufficient available time slots of at least ${minChunk}m before deadline.`,
        });
      }
    }
  }

  // Combine fixed slots, locked slots, and scheduled task slots
  const allSlots = [...fixedSlots, ...scheduledTaskSlots].sort((a, b) => a.startMinutes - b.startMinutes);

  // Validate that no slots overlap
  const validation = validateNoOverlaps(allSlots);

  // Calculate statistics
  const totalFocusMinutes = scheduledTaskSlots.reduce((sum, s) => sum + (s.endMinutes - s.startMinutes), 0);
  const totalFreeMinutes = freeIntervals.reduce((sum, int) => sum + (int.end - int.start), 0);

  return {
    scheduledSlots: allSlots,
    unplacedTasks,
    totalFocusMinutes,
    totalFreeMinutes,
    isValid: validation.isValid && fixedConflicts.length === 0,
    conflicts: [...fixedConflicts, ...validation.conflicts],
  };
}
