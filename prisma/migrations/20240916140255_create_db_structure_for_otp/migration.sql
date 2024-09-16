-- CreateEnum
CREATE TYPE "OTPType" AS ENUM ('REGISTRATION', 'RESET_PASSWORD');

-- CreateTable
CREATE TABLE "t_otp_verification" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(30) NOT NULL,
    "otpCode" VARCHAR(6) NOT NULL,
    "type" "OTPType" NOT NULL DEFAULT 'REGISTRATION',
    "activationStatus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_otp_verification_pkey" PRIMARY KEY ("id")
);
