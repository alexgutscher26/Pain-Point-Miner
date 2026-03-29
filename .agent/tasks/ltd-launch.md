# 🚀 LTD Launch: Founder & Professional Tiers

Implementation plan for the Lifetime Deal (LTD) for RPP.

## 🎯 Goal
Introduce two LTD tiers (Founder/Professional) with monthly recurring base credits and non-expiring top-up credits. Support pro-rated upgrades between tiers.

## 🛠️ Implementation Steps

### 1. Database Schema (`lib/db/schema.ts`)
- [ ] Add `ltd_tier` enum.
- [ ] Update `user` table with `ltdTier` and `ltdPricePaid`.
- [ ] Create `purchased_credits` table to track permanent rollover credits.
- [ ] Add `anniversaryDate` to `user_preferences`.

### 2. Credit Logic (`lib/plan-gating.ts`)
- [ ] Update `getRemainingCredits` to prioritize monthly base then top-ups.
- [ ] Implement `isAnniversaryToday` check for credit resets.
- [ ] Update `resolvePlanForIdentity` to handle 'founder' and 'professional' tiers.

### 3. Billing & Payments (`app/api/billing/`)
- [ ] Create one-time payment flows for $149 and $299.
- [ ] Implement pro-rated upgrade logic: If user is 'founder', checkout price = `$299 - $149`.
- [ ] Update Stripe webhook to handle `checkout.session.completed` for one-time LTD purchases.

### 4. UI/UX
- [ ] **Sidebar:** Enhance usage meter to display "Base" vs "Permanent" credits.
- [ ] **Badges:** Add premium "Founder ✨" and "Pro Founder 💎" badges for user profiles.
- [ ] **Pricing Page:** Add the "Lifetime" toggle/tab with the two tiers.

## ✅ Verification
- [ ] Test credit deduction: monthly base used first.
- [ ] Test rollover: permanent credits stay after anniversary.
- [ ] Test pro-rated upgrade: Founder pays only the difference for Professional.
- [ ] Test reset: monthly base resets on signup date.
