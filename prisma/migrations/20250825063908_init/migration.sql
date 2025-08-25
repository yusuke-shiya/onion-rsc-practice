-- CreateEnum
CREATE TYPE "public"."TargetFrequency" AS ENUM ('daily', 'weekly', 'monthly');

-- CreateTable
CREATE TABLE "public"."habits" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "targetFrequency" "public"."TargetFrequency" NOT NULL DEFAULT 'daily',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."habit_records" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_minutes" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "habit_records_habitId_executedAt_idx" ON "public"."habit_records"("habitId", "executedAt");

-- CreateIndex
CREATE UNIQUE INDEX "habit_records_habitId_executedAt_key" ON "public"."habit_records"("habitId", "executedAt" DESC);

-- AddForeignKey
ALTER TABLE "public"."habit_records" ADD CONSTRAINT "habit_records_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
