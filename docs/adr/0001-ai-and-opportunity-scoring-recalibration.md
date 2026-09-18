# 1. AI and Opportunity Scoring Recalibration

## Status
Accepted

## Context
In the extraction and opportunity scoring pipeline, pain points and composite opportunity scores systematically failed to reach the top tier (9–10 on individual dimensions, and 90–100 on opportunity scores). The root causes were twofold:
1. **Prompt Conservatism**: Extraction rubrics defined 9–10 as catastrophic operational downtime or business emergencies, leading LLMs to cluster scores in the 5–7 range.
2. **Opportunity Score Formula Drag**: In `toOpportunityScore()`, composite scores blended `base * 0.75 + validation * 0.25`. For newly mined or low-comment threads, a low validation score (~5/100) acted as an aggressive 25% drag penalty, capping high-acuity 10/10 pain points at ~75/100.

## Decision
1. **Recalibrate AI Extraction Rubrics**:
   - Update `EXTRACTION_SYSTEM_PROMPT_V1` and `EXTRACTION_SYSTEM_PROMPT_V2` with clear SaaS operational criteria:
     - `painIntensity 9-10`: Severe workflow bottlenecks costing >5 hrs/week, direct revenue loss, or risky manual workarounds.
     - `monetizationScore 9-10`: Explicit willingness to pay ($ quoted), enterprise B2B buying intent, or active churn from an expensive incumbent.
     - `urgency 9-10`: Immediate active search for relief, broken critical workflows, or recent incumbent price hikes.
   - Include few-shot exemplar anchors in prompt guidelines.
2. **Reformulate Composite Opportunity Score**:
   - Remove the 25% drag penalty in `toOpportunityScore()`.
   - Treat community validation as an additive boost (+0 to +15 points based on normalized upvotes/comments) on top of the base weighted pain metrics, clamped at 100.
3. **Verification**:
   - Benchmark with `tests/golden-dataset.test.ts` and `tests/dashboard-metrics.test.ts` to ensure top-tier items reach 85–100 while mild items remain at 30–50.
