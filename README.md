# ASTRA-PLAN
## My Personal AI Productivity & Time-Intelligence Assistant

ASTRA-PLAN is an intimate personal life-management companion for one individual. It helps its owner manage university classes, exams, assignments, academic performance (SGPA 9.0+ targets), personal routines, fitness, and daily/weekly productivity—guided by Astra, a warm anime companion.

---

## 1. Strict Single-User Architecture & Security

ASTRA-PLAN is built with a zero-trust single-user model:

- **Configured Owner Email**: `krishnarakshith83@gmail.com`
- **Frontend Enforcement**: Google sign-in rejects any non-owner Google accounts and automatically signs them out with an explicit authorization notice.
- **Backend Firestore Security Rules**: Evaluates `request.auth.uid == userId` and `request.auth.token.email == 'krishnarakshith83@gmail.com'` with `email_verified == true`.
- **Default Deny**: All paths outside `/users/{userId}/*` are strictly blocked.

### Changing the Owner Email
1. In `src/firebase/config.ts`, update:
   ```ts
   export const OWNER_EMAIL = 'your-email@gmail.com';
   ```
2. In `firestore.rules`, update the `isOwner` helper:
   ```javascript
   function isOwner(userId) {
     return isSignedIn()
       && request.auth.uid == userId
       && request.auth.token.email_verified == true
       && request.auth.token.email == 'your-email@gmail.com';
   }
   ```
3. Deploy the rules using the Firebase CLI or `DeployRules` RPC action.

---

## 2. Core Features

1. **Main Dashboard**:
   - Live local time and date display.
   - Real-time task progress, remaining deadlines, and focus minutes.
   - Interactive animated Astra mascot with context-aware dialogue and emotions.
   - Today's visual timetable timeline with active session indicator.
   - Quick action shortcuts for tasks, exams, college events, and timetable generation.

2. **Personal Task & Deadline Manager**:
   - Full CRUD operations with priority tags (Critical, High, Medium, Low).
   - Category filtering (University, Assignments, Exams, Programming, Personal, Fitness, etc.).
   - Interactive sub-task checklist with progress counters.
   - **AI Task Breakdown**: Breaks complex tasks into manageable chronological steps via server-side Gemini.

3. **Intelligent Deterministic Timetable Generator**:
   - Zero-overlap constraint-aware scheduling algorithm in pure TypeScript (`src/engine/scheduler.ts`).
   - Respects fixed university hours, travel times, and meal breaks.
   - Prioritizes urgent deadlines and higher priority tasks.
   - Splittable task chunking with minimum duration rules.
   - Pin / Lock slot mechanism: Locked slots remain untouched across schedule regenerations.
   - Displays clear diagnostics and unplaced task explanations.

4. **Academic Goal & SGPA Management**:
   - Current SGPA vs Target SGPA (default 9.0, user-customizable).
   - Visual progress distance to academic milestone.
   - Subject-wise credit and study-hour tracking with "+ Log Study Hours" action.
   - Upcoming internal and external exam schedule.

5. **Personal Habits & Routines**:
   - Daily and weekly routines (Gym, Programming practice, Meditation, Reading).
   - Habit streaks with personal best tracker and confetti burst on completion.

6. **Calming Focus Mode**:
   - Pomodoro timer with customizable focus and break intervals.
   - Link focus sessions directly to pending tasks.
   - Peaceful Astra companion presence.
   - Persists actual completed focus minutes to Firestore.

7. **Grounded Productivity Analytics**:
   - Real calculated metrics using Recharts (no manufactured fake 100% scores).
   - 7-day focus minutes trend and category distribution pie chart.
   - Most productive day detection.

8. **Server-Side Gemini AI Companion**:
   - Server-side proxy (`/api/ai/*`) protecting API keys.
   - Privacy Gate: Opt-in required before enabling.
   - Strict Privacy Mode: Can run purely conversational without task context.
   - Graceful offline and rate-limit fallbacks.

9. **Data Management & Privacy**:
   - Export complete archive to JSON.
   - Export tasks to CSV.
   - Export calendar to iCalendar (`.ics`).
   - Permanent data wipe option.

---

## 3. Testing the Scheduling Engine

The scheduling engine is fully decoupled from the UI and covered by comprehensive unit tests:

```bash
# Run unit tests
npx --yes tsx --test src/engine/scheduler.test.ts
```

Test scenarios covered:
1. Two overlapping fixed events conflict detection.
2. College and travel periods blocking study placement.
3. Urgent tasks with upcoming deadlines receiving priority.
4. Splittable tasks divided across separated time windows.
5. Insufficient available time reporting in unplaced tasks.
6. Locked schedule sessions preserved during regeneration.
7. Schedule regeneration without altering locked commitments.
8. Past deadline task identification.
9. Handling cases when current time exceeds daily working hours.
10. Exact touching boundary conditions between consecutive intervals.

---

## 4. Full-Stack Development & Deployment

### Development:
```bash
npm run dev
```
Starts the Vite dev server with integrated API middleware on `http://localhost:3000`.

### Production Build:
```bash
npm run build
npm start
```
Starts the Express server (`server.ts`) serving production assets and `/api` endpoints on port 3000.
