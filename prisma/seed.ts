import * as dotenv from "dotenv";
dotenv.config();

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../app/generated/prisma/client";
import { hashPassword } from "../lib/auth";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });
const animeList = [
  { title: "Attack on Titan",                genre: "Action",     episodes: 87,   release_year: 2013, description: "Humanity fights Titans." },
  { title: "Death Note",                      genre: "Thriller",   episodes: 37,   release_year: 2006, description: "A notebook that kills." },
  { title: "Fullmetal Alchemist: Brotherhood",genre: "Adventure",  episodes: 64,   release_year: 2009, description: "Alchemy and sacrifice." },
  { title: "Demon Slayer",                    genre: "Action",     episodes: 55,   release_year: 2019, description: "Demon hunting story." },
  { title: "Jujutsu Kaisen",                  genre: "Action",     episodes: 47,   release_year: 2020, description: "Curses and sorcery." },
  { title: "Naruto",                          genre: "Adventure",  episodes: 220,  release_year: 2002, description: "A ninja's journey." },
  { title: "Naruto Shippuden",                genre: "Adventure",  episodes: 500,  release_year: 2007, description: "Continuation of Naruto." },
  { title: "One Piece",                       genre: "Adventure",  episodes: 1000, release_year: 1999, description: "Pirates seeking treasure." },
  { title: "Bleach",                          genre: "Action",     episodes: 366,  release_year: 2004, description: "Soul reapers." },
  { title: "Tokyo Ghoul",                     genre: "Dark",       episodes: 48,   release_year: 2014, description: "Half-ghoul story." },
  { title: "Chainsaw Man",                    genre: "Action",     episodes: 12,   release_year: 2022, description: "Devils and chaos." },
  { title: "Spy x Family",                    genre: "Comedy",     episodes: 25,   release_year: 2022, description: "Fake family espionage." },
  { title: "My Hero Academia",                genre: "Superhero",  episodes: 138,  release_year: 2016, description: "Heroes in training." },
  { title: "Steins;Gate",                     genre: "Sci-Fi",     episodes: 24,   release_year: 2011, description: "Time travel thriller." },
  { title: "Re:Zero",                         genre: "Fantasy",    episodes: 50,   release_year: 2016, description: "Death loop fantasy." },
  { title: "Vinland Saga",                    genre: "Historical", episodes: 48,   release_year: 2019, description: "Viking revenge story." },
  { title: "Frieren: Beyond Journey's End",   genre: "Fantasy",    episodes: 28,   release_year: 2023, description: "Life after the hero." },
  { title: "Mob Psycho 100",                  genre: "Action",     episodes: 37,   release_year: 2016, description: "Psychic powers." },
  { title: "Code Geass",                      genre: "Mecha",      episodes: 50,   release_year: 2006, description: "Rebellion and strategy." },
  { title: "Sword Art Online",                genre: "Isekai",     episodes: 96,   release_year: 2012, description: "Trapped in a game." },
];

// test user's default watchlist: title -> status
const defaultWatchlist: Record<string, string> = {
  "Attack on Titan":                  "COMPLETED",
  "Death Note":                       "COMPLETED",
  "Fullmetal Alchemist: Brotherhood": "COMPLETED",
  "Jujutsu Kaisen":                   "WATCHING",
  "Demon Slayer":                     "WATCHING",
  "Naruto":                           "COMPLETED",
  "Naruto Shippuden":                 "PLAN_TO_WATCH",
  "One Piece":                        "ON_HOLD",
  "Steins;Gate":                      "COMPLETED",
  "Vinland Saga":                     "PLAN_TO_WATCH",
};

async function main() {
  // 1. Roles
  await prisma.role.upsert({
    where: { role_id: 1 },
    update: {},
    create: { role_id: 1, role_name: "USER" },
  });
  await prisma.role.upsert({
    where: { role_id: 2 },
    update: {},
    create: { role_id: 2, role_name: "ADMIN" },
  });

  // 2. Anime
  for (const anime of animeList) {
    await prisma.anime.upsert({
      where: { title_release_year: { title: anime.title, release_year: anime.release_year } },
      update: {},
      create: anime,
    });
  }

  // 3. Test user
  const hashedPassword = await hashPassword("password123");
  const testUser = await prisma.user.upsert({
    where: { username: "testuser" },
    update: {},
    create: {
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      role_id: 1,
    },
  });

  // 4. Default watchlist for test user
  for (const [title, status] of Object.entries(defaultWatchlist)) {
    const anime = await prisma.anime.findFirst({ where: { title } });
    if (!anime) continue;

    await prisma.watchlist.upsert({
      where: { user_id_anime_id: { user_id: testUser.user_id, anime_id: anime.anime_id } },
      update: {},
      create: {
        user_id: testUser.user_id,
        anime_id: anime.anime_id,
        status: status as any,
      },
    });
  }

  console.log("Seeded roles, anime, test user, and watchlist.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
