-- WordPress-style content taxonomy storage:
-- ContentTerm ~= wp_terms
-- ContentTermTaxonomy ~= wp_term_taxonomy
-- ArticleTermRelationship ~= wp_term_relationships

CREATE TABLE "ContentTerm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "termGroup" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentTerm_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentTermTaxonomy" (
    "id" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "taxonomy" TEXT NOT NULL,
    "description" TEXT,
    "count" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,

    CONSTRAINT "ContentTermTaxonomy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArticleTermRelationship" (
    "articleId" TEXT NOT NULL,
    "termTaxonomyId" TEXT NOT NULL,
    "termOrder" INTEGER NOT NULL DEFAULT 0,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleTermRelationship_pkey" PRIMARY KEY ("articleId","termTaxonomyId")
);

CREATE UNIQUE INDEX "ContentTerm_slug_key" ON "ContentTerm"("slug");
CREATE INDEX "ContentTerm_name_idx" ON "ContentTerm"("name");
CREATE UNIQUE INDEX "ContentTermTaxonomy_termId_taxonomy_key" ON "ContentTermTaxonomy"("termId", "taxonomy");
CREATE INDEX "ContentTermTaxonomy_taxonomy_idx" ON "ContentTermTaxonomy"("taxonomy");
CREATE INDEX "ContentTermTaxonomy_parentId_idx" ON "ContentTermTaxonomy"("parentId");
CREATE INDEX "ArticleTermRelationship_termTaxonomyId_idx" ON "ArticleTermRelationship"("termTaxonomyId");

ALTER TABLE "ContentTermTaxonomy"
ADD CONSTRAINT "ContentTermTaxonomy_termId_fkey"
FOREIGN KEY ("termId") REFERENCES "ContentTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContentTermTaxonomy"
ADD CONSTRAINT "ContentTermTaxonomy_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "ContentTermTaxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ArticleTermRelationship"
ADD CONSTRAINT "ArticleTermRelationship_articleId_fkey"
FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ArticleTermRelationship"
ADD CONSTRAINT "ArticleTermRelationship_termTaxonomyId_fkey"
FOREIGN KEY ("termTaxonomyId") REFERENCES "ContentTermTaxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

WITH raw_terms AS (
    SELECT TRIM("category") AS "name"
    FROM "Article"
    WHERE "type" = 'insight' AND TRIM("category") <> ''
    UNION
    SELECT TRIM(tag) AS "name"
    FROM "Article", UNNEST("tags") AS tag
    WHERE "type" = 'insight' AND TRIM(tag) <> ''
),
normalized_terms AS (
    SELECT
        MIN("name") AS "name",
        COALESCE(NULLIF(REGEXP_REPLACE(REGEXP_REPLACE(LOWER(TRIM("name")), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'), ''), 'term') AS "slug"
    FROM raw_terms
    GROUP BY COALESCE(NULLIF(REGEXP_REPLACE(REGEXP_REPLACE(LOWER(TRIM("name")), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'), ''), 'term')
)
INSERT INTO "ContentTerm" ("id", "name", "slug", "updatedAt")
SELECT CONCAT('term_', MD5("slug")), "name", "slug", CURRENT_TIMESTAMP
FROM normalized_terms
ON CONFLICT ("slug") DO NOTHING;

WITH category_terms AS (
    SELECT DISTINCT
        COALESCE(NULLIF(REGEXP_REPLACE(REGEXP_REPLACE(LOWER(TRIM("category")), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'), ''), 'term') AS "slug"
    FROM "Article"
    WHERE "type" = 'insight' AND TRIM("category") <> ''
)
INSERT INTO "ContentTermTaxonomy" ("id", "termId", "taxonomy")
SELECT CONCAT('tax_category_', MD5(term."slug")), term."id", 'category'
FROM category_terms
JOIN "ContentTerm" term ON term."slug" = category_terms."slug"
ON CONFLICT ("termId", "taxonomy") DO NOTHING;

WITH tag_terms AS (
    SELECT DISTINCT
        COALESCE(NULLIF(REGEXP_REPLACE(REGEXP_REPLACE(LOWER(TRIM(tag)), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'), ''), 'term') AS "slug"
    FROM "Article", UNNEST("tags") AS tag
    WHERE "type" = 'insight' AND TRIM(tag) <> ''
)
INSERT INTO "ContentTermTaxonomy" ("id", "termId", "taxonomy")
SELECT CONCAT('tax_post_tag_', MD5(term."slug")), term."id", 'post_tag'
FROM tag_terms
JOIN "ContentTerm" term ON term."slug" = tag_terms."slug"
ON CONFLICT ("termId", "taxonomy") DO NOTHING;

INSERT INTO "ArticleTermRelationship" ("articleId", "termTaxonomyId")
SELECT article."id", taxonomy."id"
FROM "Article" article
JOIN "ContentTerm" term ON term."slug" = COALESCE(NULLIF(REGEXP_REPLACE(REGEXP_REPLACE(LOWER(TRIM(article."category")), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'), ''), 'term')
JOIN "ContentTermTaxonomy" taxonomy ON taxonomy."termId" = term."id" AND taxonomy."taxonomy" = 'category'
WHERE article."type" = 'insight' AND TRIM(article."category") <> ''
ON CONFLICT DO NOTHING;

INSERT INTO "ArticleTermRelationship" ("articleId", "termTaxonomyId")
SELECT article."id", taxonomy."id"
FROM "Article" article
CROSS JOIN UNNEST(article."tags") AS tag
JOIN "ContentTerm" term ON term."slug" = COALESCE(NULLIF(REGEXP_REPLACE(REGEXP_REPLACE(LOWER(TRIM(tag)), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'), ''), 'term')
JOIN "ContentTermTaxonomy" taxonomy ON taxonomy."termId" = term."id" AND taxonomy."taxonomy" = 'post_tag'
WHERE article."type" = 'insight' AND TRIM(tag) <> ''
ON CONFLICT DO NOTHING;

UPDATE "ContentTermTaxonomy" taxonomy
SET "count" = counts."total"
FROM (
    SELECT "termTaxonomyId", COUNT(*)::INTEGER AS "total"
    FROM "ArticleTermRelationship"
    GROUP BY "termTaxonomyId"
) counts
WHERE taxonomy."id" = counts."termTaxonomyId";
