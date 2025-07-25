-- DropForeignKey
ALTER TABLE "ActivitySubmission" DROP CONSTRAINT "ActivitySubmission_activityId_fkey";

-- AddForeignKey
ALTER TABLE "ActivitySubmission" ADD CONSTRAINT "ActivitySubmission_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
