DROP INDEX IF EXISTS "Article_slug_companyId_key";

ALTER TABLE "Article" DROP CONSTRAINT IF EXISTS "Article_companyId_fkey";
ALTER TABLE "Article" ALTER COLUMN "companyId" DROP NOT NULL;
ALTER TABLE "Article"
  ADD CONSTRAINT "Article_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
