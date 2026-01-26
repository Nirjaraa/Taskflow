-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- AlterTable
ALTER TABLE "WorkspaceMember" ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'PENDING';
