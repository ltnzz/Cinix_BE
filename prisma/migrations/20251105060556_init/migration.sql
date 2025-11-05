-- CreateTable
CREATE TABLE "otp" (
    "id_otp" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "cooldown_until" TIMESTAMP(3),

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id_otp")
);

-- CreateTable
CREATE TABLE "admins" (
    "id_admin" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id_admin")
);

-- CreateTable
CREATE TABLE "movies" (
    "id_movie" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "genre" TEXT,
    "language" TEXT,
    "age_rating" TEXT,
    "duration" INTEGER,
    "rating" DOUBLE PRECISION,
    "poster_url" TEXT,
    "trailer_url" TEXT,
    "release_date" TIMESTAMP(3),
    "movie_update_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id_movie")
);

-- CreateTable
CREATE TABLE "theaters" (
    "id_theater" UUID NOT NULL DEFAULT gen_random_uuid(),
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theaters_pkey" PRIMARY KEY ("id_theater")
);

-- CreateTable
CREATE TABLE "studios" (
    "id_studio" UUID NOT NULL DEFAULT gen_random_uuid(),
    "theater_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "layout_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studios_pkey" PRIMARY KEY ("id_studio")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id_schedule" UUID NOT NULL DEFAULT gen_random_uuid(),
    "movie_id" UUID NOT NULL,
    "studio_id" UUID NOT NULL,
    "theater_id" UUID NOT NULL,
    "admin_id" UUID,
    "show_date" TIMESTAMP(3) NOT NULL,
    "show_time" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "schedule_update_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id_schedule")
);

-- CreateTable
CREATE TABLE "seats" (
    "id_seat" UUID NOT NULL DEFAULT gen_random_uuid(),
    "studio_id" UUID NOT NULL,
    "seat_number" TEXT NOT NULL,
    "seat_type" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id_seat")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id_booking" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "booking_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id_booking")
);

-- CreateTable
CREATE TABLE "booking_seats" (
    "id_booking_seats" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "seat_id" UUID NOT NULL,

    CONSTRAINT "booking_seats_pkey" PRIMARY KEY ("id_booking_seats")
);

-- CreateTable
CREATE TABLE "payments" (
    "id_payment" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_id" TEXT,
    "order_id" TEXT,
    "user_id" UUID NOT NULL,
    "movie_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "transaction_time" TIMESTAMP(3),
    "transaction_expired" TIMESTAMP(3),
    "va_number" TEXT,
    "qr_code_url" TEXT,
    "currency" TEXT,
    "gross_amount" DOUBLE PRECISION,
    "midtrans_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id_payment")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "studios" ADD CONSTRAINT "studios_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id_theater") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id_movie") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id_studio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id_theater") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id_admin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id_studio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id_schedule") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_seats" ADD CONSTRAINT "booking_seats_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id_booking") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_seats" ADD CONSTRAINT "booking_seats_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id_seat") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id_movie") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id_booking") ON DELETE RESTRICT ON UPDATE CASCADE;
