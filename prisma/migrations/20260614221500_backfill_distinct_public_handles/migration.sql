UPDATE "AuthUser"
SET "publicHandle" = concat('__public_handle_', md5("id"));

WITH normalized_handles AS (
  SELECT
    "id",
    COALESCE(
      NULLIF(
        trim(BOTH '-' FROM regexp_replace(lower(COALESCE("displayName", '')), '[^a-z0-9]+', '-', 'g')),
        ''
      ),
      concat('member-', substr(md5("id"), 1, 8))
    ) AS base_handle
  FROM "AuthUser"
),
ranked_handles AS (
  SELECT
    "id",
    base_handle,
    row_number() OVER (PARTITION BY base_handle ORDER BY "id") AS handle_rank
  FROM normalized_handles
)
UPDATE "AuthUser" AS users
SET "publicHandle" = CASE
  WHEN ranked.handle_rank = 1 THEN ranked.base_handle
  ELSE concat(ranked.base_handle, '-', substr(md5(users."id"), 1, 6))
END
FROM ranked_handles AS ranked
WHERE users."id" = ranked."id";
