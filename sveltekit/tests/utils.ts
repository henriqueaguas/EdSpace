import { prismaClient } from "$lib/index.server";
import type { FSJetpack } from "fs-jetpack/types";

export function delay(seconds: number): Promise<void> {
  return new Promise((res) => setTimeout(res, seconds * 1000));
}

export function pickRandom<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function randomDate(): Date {
  const start = new Date(2020, 0, 1); // Start date (Jan 1, 2020)
  const end = new Date(); // Current date and time
  const randomDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  ); // Generate a random date within the range
  return randomDate;
}

export async function emptyDirectory(dir: FSJetpack) {
  const files = await dir.listAsync();
  if (!files) {
    throw Error("Directory not found!");
  }
  await Promise.all(files.map((file) => dir.removeAsync(file)));
}

export async function clearDataStorage() {
  // Will cascade delete the rest of the data
  await runInDB(() => prismaClient.user.deleteMany());
}

export async function runInDB<T>(block: () => T): Promise<T | null> {
  try {
    return await block();
  } catch (e) {
    console.error(e);
    return null;
  }
}