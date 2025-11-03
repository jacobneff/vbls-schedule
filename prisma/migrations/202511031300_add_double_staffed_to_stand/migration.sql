-- Add doubleStaffed flag to stands to track double coverage needs
ALTER TABLE "Stand"
ADD COLUMN "doubleStaffed" BOOLEAN NOT NULL DEFAULT false;
