import { buildSchema, type Schema } from "$lib/utils/buildSchema";
import { z } from "zod";
import { LogicConstraints } from "../constraints";

export const CreateUserInputSchema: Schema<svct.inputs.user.Create> =
  buildSchema(
    "User Input Data",
    z.object({
      name: z.string()
        .min(LogicConstraints.User.USERNAME.min_chars)
        .max(LogicConstraints.User.USERNAME.max_chars),
      email: z.string().email(),
    }),
  );
