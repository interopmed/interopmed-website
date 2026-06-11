-- CreateTable
CREATE TABLE "InteropMindThread" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New chat',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "InteropMindThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteropMindMessage" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "threadId" TEXT NOT NULL,

    CONSTRAINT "InteropMindMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InteropMindThread_userId_updatedAt_idx" ON "InteropMindThread"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "InteropMindThread_status_updatedAt_idx" ON "InteropMindThread"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "InteropMindMessage_threadId_createdAt_idx" ON "InteropMindMessage"("threadId", "createdAt");

-- AddForeignKey
ALTER TABLE "InteropMindThread" ADD CONSTRAINT "InteropMindThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteropMindMessage" ADD CONSTRAINT "InteropMindMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "InteropMindThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
