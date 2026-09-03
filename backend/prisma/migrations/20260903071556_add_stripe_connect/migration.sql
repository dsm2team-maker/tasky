-- CreateEnum
CREATE TYPE "StripeOnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'RESTRICTED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "prestataires" DROP COLUMN "bankName",
DROP COLUMN "bic",
DROP COLUMN "iban",
DROP COLUMN "ibanVerified",
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeOnboardingStatus" "StripeOnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "prestations" ADD COLUMN     "stripeChargeId" TEXT;

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "prestationId" TEXT NOT NULL,
    "prestataireId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "stripeTransferId" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transfers_prestationId_key" ON "transfers"("prestationId");

-- CreateIndex
CREATE UNIQUE INDEX "prestataires_stripeAccountId_key" ON "prestataires"("stripeAccountId");

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_prestationId_fkey" FOREIGN KEY ("prestationId") REFERENCES "prestations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

