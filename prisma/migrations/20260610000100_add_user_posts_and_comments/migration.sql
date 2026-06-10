-- Add member workspace posts and comments for the account social feed.
CREATE TABLE "UserPost" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topic" TEXT NOT NULL DEFAULT 'general',
    "visibility" TEXT NOT NULL DEFAULT 'workspace',
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "UserPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserPostComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "UserPostComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserPost_authorId_createdAt_idx" ON "UserPost"("authorId", "createdAt");
CREATE INDEX "UserPost_status_createdAt_idx" ON "UserPost"("status", "createdAt");
CREATE INDEX "UserPost_topic_createdAt_idx" ON "UserPost"("topic", "createdAt");

CREATE INDEX "UserPostComment_postId_createdAt_idx" ON "UserPostComment"("postId", "createdAt");
CREATE INDEX "UserPostComment_authorId_createdAt_idx" ON "UserPostComment"("authorId", "createdAt");
CREATE INDEX "UserPostComment_status_createdAt_idx" ON "UserPostComment"("status", "createdAt");

ALTER TABLE "UserPost" ADD CONSTRAINT "UserPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserPostComment" ADD CONSTRAINT "UserPostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "UserPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserPostComment" ADD CONSTRAINT "UserPostComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
