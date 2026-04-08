/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - Added the required column `role_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Role" (
    "role_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Anime" (
    "anime_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "episodes" INTEGER NOT NULL,
    "release_year" INTEGER NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "watchlist_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Watchlist_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "Anime" ("anime_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User_Rating" (
    "rating_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "rating_score" INTEGER NOT NULL,
    "rated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_Rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_Rating_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "Anime" ("anime_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" INTEGER NOT NULL,
    CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role" ("role_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "password") SELECT "email", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_Rating_user_id_anime_id_key" ON "User_Rating"("user_id", "anime_id");
