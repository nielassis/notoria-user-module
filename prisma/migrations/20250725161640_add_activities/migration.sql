-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ASSIGNMENT', 'EXERCISE', 'COMPLEMENTARY_MATERIAL');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "type" "ActivityType" NOT NULL,
    "classroomId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySubmission" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "fileUrl" TEXT,
    "content" TEXT,
    "grade" DOUBLE PRECISION,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ActivitySubmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
