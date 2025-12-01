-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_movie_id_fkey";

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id_movie") ON DELETE CASCADE ON UPDATE CASCADE;
