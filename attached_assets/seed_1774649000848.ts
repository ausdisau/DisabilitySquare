import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const roles = [
  { key: "user", name: "User", description: "Standard signed-in user" },
  { key: "contributor", name: "Contributor", description: "Can contribute content across connected apps" },
  { key: "editor", name: "Editor", description: "Editorial role for content workflows" },
  { key: "moderator", name: "Moderator", description: "Moderation role" },
  { key: "admin", name: "Admin", description: "Administrative role" },
  { key: "super_admin", name: "Super Admin", description: "Break-glass platform administrator" },
  { key: "wiki_reader", name: "Wiki Reader", description: "Reader role for MediaWiki claim mapping" },
  { key: "wiki_editor", name: "Wiki Editor", description: "Editor role for MediaWiki claim mapping" },
  { key: "wiki_admin", name: "Wiki Admin", description: "Admin role for MediaWiki claim mapping" }
];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name, description: role.description },
      create: role
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
