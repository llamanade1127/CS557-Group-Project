import { PrismaClient } from "../app/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Roles
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

  // Anime list
  const animeList = [
    {
      title: "Attack on Titan",
      genre: "Action",
      episodes: 87,
      release_year: 2013,
      description: "Humanity fights Titans."
    },
    {
      title: "Death Note",
      genre: "Thriller",
      episodes: 37,
      release_year: 2006,
      description: "A notebook that kills."
    },
    {
      title: "Fullmetal Alchemist: Brotherhood",
      genre: "Adventure",
      episodes: 64,
      release_year: 2009,
      description: "Alchemy and sacrifice."
    },
    {
      title: "Demon Slayer",
      genre: "Action",
      episodes: 55,
      release_year: 2019,
      description: "Demon hunting story."
    },
    {
      title: "Jujutsu Kaisen",
      genre: "Action",
      episodes: 47,
      release_year: 2020,
      description: "Curses and sorcery."
    },
    {
      title: "Naruto",
      genre: "Adventure",
      episodes: 220,
      release_year: 2002,
      description: "A ninja's journey."
    },
    {
      title: "Naruto Shippuden",
      genre: "Adventure",
      episodes: 500,
      release_year: 2007,
      description: "Continuation of Naruto."
    },
    {
      title: "One Piece",
      genre: "Adventure",
      episodes: 1000,
      release_year: 1999,
      description: "Pirates seeking treasure."
    },
    {
      title: "Bleach",
      genre: "Action",
      episodes: 366,
      release_year: 2004,
      description: "Soul reapers."
    },
    {
      title: "Tokyo Ghoul",
      genre: "Dark",
      episodes: 48,
      release_year: 2014,
      description: "Half-ghoul story."
    },
    {
      title: "Chainsaw Man",
      genre: "Action",
      episodes: 12,
      release_year: 2022,
      description: "Devils and chaos."
    },
    {
      title: "Spy x Family",
      genre: "Comedy",
      episodes: 25,
      release_year: 2022,
      description: "Fake family espionage."
    },
    {
      title: "My Hero Academia",
      genre: "Superhero",
      episodes: 138,
      release_year: 2016,
      description: "Heroes in training."
    },
    {
      title: "Steins;Gate",
      genre: "Sci-Fi",
      episodes: 24,
      release_year: 2011,
      description: "Time travel thriller."
    },
    {
      title: "Re:Zero",
      genre: "Fantasy",
      episodes: 50,
      release_year: 2016,
      description: "Death loop fantasy."
    },
    {
      title: "Vinland Saga",
      genre: "Historical",
      episodes: 48,
      release_year: 2019,
      description: "Viking revenge story."
    },
    {
      title: "Frieren: Beyond Journey’s End",
      genre: "Fantasy",
      episodes: 28,
      release_year: 2023,
      description: "Life after the hero."
    },
    {
      title: "Mob Psycho 100",
      genre: "Action",
      episodes: 37,
      release_year: 2016,
      description: "Psychic powers."
    },
    {
      title: "Code Geass",
      genre: "Mecha",
      episodes: 50,
      release_year: 2006,
      description: "Rebellion and strategy."
    },
    {
      title: "Sword Art Online",
      genre: "Isekai",
      episodes: 96,
      release_year: 2012,
      description: "Trapped in a game."
    }
  ];

  for (const anime of animeList) {
    await prisma.anime.upsert({
      where: {
        title_release_year: {
          title: anime.title,
          release_year: anime.release_year,
        },
      },
      update: {},
      create: anime,
    });
  }

  console.log("Seeded roles + anime.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());