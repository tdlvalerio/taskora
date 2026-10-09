-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "assigneeId" TEXT;

-- CreateIndex
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "workspace_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
