ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";
ALTER TABLE "ActivityLog"
  ADD CONSTRAINT "ActivityLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
