# Loops.so Integration Plan

> **Goal:** Implement Loops.so for marketing (user sync) and transactional (report ready) emails.

## 📐 Project Foundation

- **Project Type:** WEB (Next.js 15 App Router)
- **Primary Agent:** `backend-specialist`
- **Secondary Agent:** `project-planner`

## ✅ Success Criteria

- [ ] New users are automatically added to the Loops audience on sign-up.
- [ ] A `report_ready` event is triggered in Loops when a mining scan finishes successfully.
- [ ] API Key is stored securely in `.env.local` and `LOOPS_API_KEY` is validated.
- [ ] Basic error handling ensures that failed Loops calls don't break the core app flow.

## 🛠️ Tech Stack

- **Provider:** Loops.so
- **SDK:** `loops` (Official Node.js SDK)
- **Integration Points:** Better Auth Hooks & Mining Runner Pipeline

## 📁 Proposed File Structure

```text
lib/
├── loops/
│   ├── client.ts         # Base Loops client configuration
│   └── service.ts        # Business logic: syncUser, sendReportReadyEvent
```

## 📝 Task Breakdown

### Phase 1: Foundation (P0)

- [x] **Task 1: Install Dependency**
  - **Agent:** `backend-specialist`
  - **Action:** `bun add loops`
  - **Verify:** `package.json` contains `loops`.

- [x] **Task 2: Environment Setup**
  - **Agent:** `backend-specialist`
  - **Action:** Add `LOOPS_API_KEY` to `.env.example` and instruct user to update `.env`.

- [x] **Task 3: Initialize Loops Client**
  - **Agent:** `backend-specialist`
  - **Path:** `lib/loops/client.ts`
  - **Input:** `process.env.LOOPS_API_KEY`
  - **Output:** Exported `loops` singleton.

### Phase 2: Marketing Sync (P1)

- [x] **Task 4: Implement Sync Logic**
  - **Agent:** `backend-specialist`
  - **Path:** `lib/loops/service.ts`
  - **Action:** Implement `createContact(email, name, properties)` function.

- [x] **Task 5: Hook into Better Auth**
  - **Agent:** `backend-specialist`
  - **Path:** `lib/auth.ts`
  - **Action:** Add `hooks.after` for `/sign-up/email` to trigger `createContact`.

### Phase 3: Transactional Events (P1)

- [x] **Task 6: Implement Event Logic**
  - **Agent:** `backend-specialist`
  - **Path:** `lib/loops/service.ts`
  - **Action:** Implement `sendEvent(email, eventName, properties)` function.

- [x] **Task 7: Hook into Mining Runner**
  - **Agent:** `backend-specialist`
  - **Path:** `lib/mining-runner.ts`
  - **Action:** Fire `report_ready` event after `status` is set to `completed`.

### Phase 4: Verification (P2)

- **Task 8: Manual verification guide**
  - **Agent:** `project-planner`
  - **Action:** Provide instructions to user on how to check Loops dashboard for contacts and events.

## 🧪 Phase X: Final Verification

- [ ] `bun run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] No hardcoded keys in `lib/loops/`
- [ ] Verified `report_ready` trigger includes `runId` and `keyword` properties.

---

## 🛠️ Guide: Setting up Loops Dashboard (For User)

1. **API Key**: Go to **Settings > API** in Loops and generate a key.
2. **Audience**: Users will appear automatically under **Audience** after their first sign-up.
3. **Transactional Emails**:
   - Go to **Transactional** tab.
   - Create a new email named "Report Ready".
   - Set the trigger to **Event** with name `report_ready`.
   - Use properties like `{{keyword}}` and `{{runId}}` in your template.
