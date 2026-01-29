-- CreateEnum
CREATE TYPE "PetAge" AS ENUM ('PUPPY', 'ADULT', 'SENIOR');

-- CreateEnum
CREATE TYPE "PetSize" AS ENUM ('TINY', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "EnergyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "IndependenceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('SMALL_SPACE', 'MEDIUM_SPACE', 'LARGE_SPACE');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "age" "PetAge" NOT NULL,
    "size" "PetSize" NOT NULL,
    "energy_level" "EnergyLevel" NOT NULL,
    "independence_level" "IndependenceLevel" NOT NULL,
    "environment" "Environment" NOT NULL,
    "photos" TEXT[],
    "adoption_requirements" TEXT[],
    "city" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_email_key" ON "organizations"("email");

-- CreateIndex
CREATE INDEX "pets_city_idx" ON "pets"("city");

-- CreateIndex
CREATE INDEX "pets_organization_id_idx" ON "pets"("organization_id");

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
