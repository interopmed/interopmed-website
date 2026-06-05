ALTER TABLE "Article" DROP CONSTRAINT IF EXISTS "Article_authorId_fkey";
ALTER TABLE "Article" ALTER COLUMN "authorId" DROP NOT NULL;
ALTER TABLE "Article"
  ADD CONSTRAINT "Article_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "Employee"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Article" ADD COLUMN "accountAuthorId" TEXT;
ALTER TABLE "Article"
  ADD CONSTRAINT "Article_accountAuthorId_fkey"
  FOREIGN KEY ("accountAuthorId") REFERENCES "AuthUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Article_accountAuthorId_idx" ON "Article"("accountAuthorId");
