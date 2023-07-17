import { writable } from "svelte/store";

// Same type as Quiz but for each question also has information if the user marked it as correct or not
export const currentQuiz = writable<
  tquiz.Quiz & {
    finished?: boolean;
    questions: (
      tquiz.QuizQuestion & {
        answers: Array<
          tquiz.QuizQuestion["answers"][number] & { marked?: boolean }
        >;
      }
    )[];
  } | null
>(null);
