ALTER TABLE "AuthUser" ADD COLUMN "publicHandle" TEXT;

UPDATE "AuthUser"
SET "publicHandle" = "username"
WHERE "publicHandle" IS NULL;

ALTER TABLE "AuthUser" ALTER COLUMN "publicHandle" SET NOT NULL;

CREATE UNIQUE INDEX "AuthUser_publicHandle_key" ON "AuthUser"("publicHandle");
