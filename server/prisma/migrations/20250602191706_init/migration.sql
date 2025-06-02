-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "patr" TEXT NOT NULL,
    "sex" VARCHAR(7) NOT NULL,
    "birthDate" VARCHAR(10) NOT NULL,
    "phone" VARCHAR(16) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "address" VARCHAR(100) NOT NULL,
    "complaint" TEXT NOT NULL,
    "anam" TEXT NOT NULL,
    "life" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "diag" TEXT NOT NULL,
    "mkb" TEXT NOT NULL,
    "sop_zab" TEXT NOT NULL,
    "rec" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusReport" TEXT NOT NULL,
    "locStat" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "state" VARCHAR(100) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_pulse" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "pulseValue" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_pulse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "dosage" VARCHAR(100) NOT NULL,
    "frequency" VARCHAR(100) NOT NULL,
    "administered" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patient_pulse" ADD CONSTRAINT "patient_pulse_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
