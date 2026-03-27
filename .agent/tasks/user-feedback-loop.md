# Task: User Feedback Loop Implementation

Implement a feedback mechanism for pain points to improve scoring accuracy and provide administrative oversight.

## Phase 1: Database Schema & Migration
- [ ] Update `user` table in `lib/db/schema.ts` to include `role` field.
- [ ] Add `pain_point_feedback` table in `lib/db/schema.ts`.
- [ ] Run drizzle-kit generate/migrate (or manual SQL if needed).

## Phase 2: Authentication & API
- [ ] Update `lib/auth.ts` to include `role` in `additionalFields`.
- [ ] Create `app/api/feedback/route.ts` (POST) for user feedback.
  - Required: `painPointId`, `vote` (1 for up, -1 for down).
  - Auth: Required.
- [ ] Create `app/api/admin/feedback/stats/route.ts` (GET) for administrative stats.
  - Auth: Admin only.

## Phase 3: UI Implementation
- [ ] Create `components/dashboard/pain-point-feedback.tsx`.
  - 👍/👎 buttons with optimistic UI updates.
  - "Thanks for the feedback!" toast or inline message.
- [ ] Integrate feedback buttons into `app/(dashboard)/dashboard/reports/[id]/page.tsx`.
- [ ] Create admin dashboard page `app/(dashboard)/dashboard/admin/page.tsx`.
  - Feedback accuracy chart.
  - Table of "Flagged for Review" pain points (>70% thumbs-down).

## Phase 4: Scoring V2 Integration
- [ ] Update `Scoring V2` (if already defined) or create a logic to weight `painIntensity` based on feedback signals.

## Acceptance Criteria
- [ ] Clicking 👍 on a pain point card saves feedback to DB.
- [ ] Card shows "Thanks for the feedback!" after voting.
- [ ] Admin can see aggregate feedback accuracy over time.
- [ ] Pain points with >70% thumbs-down are flagged in the admin view.
