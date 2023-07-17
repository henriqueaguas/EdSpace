import { buildSchema, type Schema } from "$lib/utils/buildSchema";
import { z } from "zod";
import { LogicConstraints } from "../constraints";

const genericTextSchema = (fieldName: string, min: number, max: number) =>
  z
    .string()
    .min(min, `${fieldName} must have at least ${min} characters`)
    .max(max, `${fieldName} must have at max ${max} characters`);

export const QuizQuestionSchema = z.object({
  title: genericTextSchema(
    "Quiz question",
    LogicConstraints.Posts.QUIZ.MIN_TEXT,
    LogicConstraints.Posts.QUIZ.MAX_TEXT,
  ),
  answers: z
    .object({
      answer: genericTextSchema(
        "Quiz answer",
        1,
        LogicConstraints.Posts.QUIZ.MAX_TEXT,
      ),
      isCorrect: z.boolean(),
    })
    .array()
    .min(
      LogicConstraints.Posts.QUIZ.MIN_ANSWERS,
      `Quiz question must contain at least ${LogicConstraints.Posts.QUIZ.MIN_ANSWERS} answers`,
    )
    .max(
      LogicConstraints.Posts.QUIZ.MAX_ANSWERS,
      `Quiz question can contain at max ${LogicConstraints.Posts.QUIZ.MAX_ANSWERS} answers`,
    ),
});

export const QuizSchema: Schema<tquiz.Quiz> = buildSchema(
  "Quiz Schema",
  z.object({
    name: genericTextSchema(
      "Quiz name",
      LogicConstraints.Posts.QUIZ.MIN_TEXT,
      LogicConstraints.Posts.QUIZ.MAX_TEXT,
    ),
    questions: QuizQuestionSchema.array()
      .min(
        LogicConstraints.Posts.QUIZ.MIN_QUESTIONS,
        `Quiz must contain at least ${LogicConstraints.Posts.QUIZ.MIN_QUESTIONS} question${
          LogicConstraints.Posts.QUIZ.MIN_QUESTIONS > 1 ? "s" : ""
        }`,
      )
      .max(
        LogicConstraints.Posts.QUIZ.MAX_QUESTIONS,
        `Quiz can contain at max ${LogicConstraints.Posts.QUIZ.MAX_QUESTIONS} questions`,
      ),
  }),
);
