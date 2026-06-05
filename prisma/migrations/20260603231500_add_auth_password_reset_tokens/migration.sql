-- CreateTable
CREATE TABLE "AuthPasswordResetToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuthPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthPasswordResetToken_tokenHash_key" ON "AuthPasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AuthPasswordResetToken_userId_expiresAt_idx" ON "AuthPasswordResetToken"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "AuthPasswordResetToken_expiresAt_usedAt_idx" ON "AuthPasswordResetToken"("expiresAt", "usedAt");

-- AddForeignKey
ALTER TABLE "AuthPasswordResetToken" ADD CONSTRAINT "AuthPasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
