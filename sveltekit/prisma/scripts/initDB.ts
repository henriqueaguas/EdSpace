import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { topicsToInitDB } from "./topics";
import { readFileSync } from "fs";
import promptConfig from "prompt-sync"

const prompt = promptConfig({ sigint: true })

const CREATE_TABLES_SCRIPT_LOCATION = "prisma/createTables.sql";
const DROP_TABLES_SCRIPT_LOCATION = "prisma/dropTables.sql";

dotenv.config({
  path: process.cwd() + "/prisma/.env"
});

export async function initDB() {
  const dbUrl = process.env.INIT_PROD === "true"
    ? process.env.PROD_DATABASE_URL
    : process.env.DATABASE_URL

  console.log("Connecting to ", dbUrl)

  const pClient = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    }
  });

  try {
    console.log("| -- Database Initialization Script -- |\n");
    console.log(" Production ?", process.env.INIT_PROD === "true");

    const proceed = prompt(" ? Proceed ? (y/n) ")
    if (proceed !== "y") {
      console.log(" Cancelling...")
      process.exit(0)
    }
    const forceDrop = prompt(" ? Drop + Create tables even if they already exist ? (y/n) ") === "y"

    if (
      forceDrop ||
      // If database does not have tables
      await pClient.user.findFirst()
        .then(() => false)
        .catch((err: any) =>
          err.message.split("\n").slice(-1)[0].includes(
            "The table `public.user` does not exist in the current database.",
          )
        )
    ) {
      console.log(" > Dropping database structures...")

      const dropOperations = readFileSync(DROP_TABLES_SCRIPT_LOCATION, "utf-8")
        .split("\n").filter((line) => line.includes("drop"));

      for (const op of dropOperations) {
        await pClient.$executeRawUnsafe(op);
      }

      console.log(" > Database structures dropped!");

      console.log(" > Creating tables...")

      const createOperations = readFileSync(
        CREATE_TABLES_SCRIPT_LOCATION,
        "utf-8",
      )
        .replaceAll("\r\n", "\n")
        .split(";\n")
        .map(operation => operation.split("\n").filter(l => !l.startsWith("/*")).join("\n"))

      for (const op of createOperations) {
        await pClient.$executeRawUnsafe(op);
      }

      console.log(" > Database structures created!");
    }

    await pClient.topic.createMany({
      data: topicsToInitDB.map((topicName) => ({ id: topicName })),
      skipDuplicates: true,
    });
    console.log("[DONE] Topics created in the database");
  } catch (e) {
    console.error(e, "Error initializing database:");
  }
}

if (process.env.SCRIPT_CALL === "true") {
  await initDB();
  process.exit(0);
}