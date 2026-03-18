ALTER TABLE "pain_point"
ALTER COLUMN "budget" TYPE jsonb
USING CASE
  WHEN "budget" IS NULL OR btrim("budget") = '' THEN NULL
  ELSE jsonb_build_array(
    jsonb_build_object(
      'quote',
      "budget",
      'amountMinUsd',
      NULL,
      'amountMaxUsd',
      NULL,
      'cadence',
      'unknown',
      'annualizedMidpointUsd',
      NULL,
      'source',
      'post'
    )
  )
END;

ALTER TABLE "pain_point_cluster"
ADD COLUMN "estimatedTamUsdAnnual" integer;

ALTER TABLE "pain_point_cluster"
ADD COLUMN "budgetSignalCount" integer DEFAULT 0 NOT NULL;
