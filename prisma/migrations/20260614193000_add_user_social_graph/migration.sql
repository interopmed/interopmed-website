CREATE TABLE "UserPostLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserPostLike_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserFollow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,

    CONSTRAINT "UserFollow_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPostLike_postId_userId_key" ON "UserPostLike"("postId", "userId");
CREATE INDEX "UserPostLike_userId_createdAt_idx" ON "UserPostLike"("userId", "createdAt");
CREATE UNIQUE INDEX "UserFollow_followerId_followingId_key" ON "UserFollow"("followerId", "followingId");
CREATE INDEX "UserFollow_followingId_createdAt_idx" ON "UserFollow"("followingId", "createdAt");

ALTER TABLE "UserPostLike"
ADD CONSTRAINT "UserPostLike_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "UserPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserPostLike"
ADD CONSTRAINT "UserPostLike_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserFollow"
ADD CONSTRAINT "UserFollow_followerId_fkey"
FOREIGN KEY ("followerId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserFollow"
ADD CONSTRAINT "UserFollow_followingId_fkey"
FOREIGN KEY ("followingId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
