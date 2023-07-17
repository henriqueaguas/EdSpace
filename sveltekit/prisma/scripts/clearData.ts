import { PrismaClient } from "@prisma/client";

export function clearPrismaData(
  prismaClient: PrismaClient = new PrismaClient(),
) {
  console.log("| -- Clear Database Script -- |\n");
  // Other tables will delete in cascade. Topics should not be removed
  return Promise.all([
    prismaClient.user.deleteMany(),
    prismaClient.account.deleteMany(),
    prismaClient.session.deleteMany(),
    prismaClient.verificationToken.deleteMany(),
  ]);
}

if (process.env.SCRIPT_CALL === "true") {
  clearPrismaData();
  console.log("[DONE]");
  process.exit(0);
}
