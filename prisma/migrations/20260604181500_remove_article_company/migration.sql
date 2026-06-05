ALTER TABLE "Article" DROP CONSTRAINT IF EXISTS "Article_companyId_fkey";
DROP INDEX IF EXISTS "Article_slug_companyId_key";
ALTER TABLE "Article" DROP COLUMN IF EXISTS "companyId";
