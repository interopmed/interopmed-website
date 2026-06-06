-- CreateTable
CREATE TABLE "AuthNotificationPreference" (
    "id" TEXT NOT NULL,
    "accountUpdates" BOOLEAN NOT NULL DEFAULT true,
    "productNotes" BOOLEAN NOT NULL DEFAULT false,
    "supportReplies" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuthNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthNotificationPreference_userId_key" ON "AuthNotificationPreference"("userId");

-- AddForeignKey
ALTER TABLE "AuthNotificationPreference" ADD CONSTRAINT "AuthNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
