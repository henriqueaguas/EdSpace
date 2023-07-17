import jetpack from "fs-jetpack";
import { pickRandom } from "../utils";
import { MockQuizzes } from "./posts/quizzes/quizzes";
import { getBlobFromFile, getBlobFromObject } from "../blob-storage/utils";

const imagePagesPath = jetpack.cwd("tests/_mock-data/posts/images");

const availableQuizPages = MockQuizzes;
const availableImagePaths: string[] | undefined = imagePagesPath.list();

export async function getImageForPost(): Promise<Blob | null> {
  if (!availableImagePaths) {
    throw Error(`Could not find images at ${imagePagesPath.cwd()}`);
  }

  const imagePage = await getBlobFromFile(
    imagePagesPath,
    pickRandom(availableImagePaths),
  );
  return imagePage;
}

export async function getQuizForPost(): Promise<Blob | null> {
  const randomQuiz = pickRandom(availableQuizPages);
  return getBlobFromObject(randomQuiz, "QUIZ");
}
