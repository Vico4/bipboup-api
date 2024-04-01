import { z } from "zod";

export const gameCreationSchema = z
  .object({
    team1: z.string(),
    team2: z.string(),
    startTime: z.string().datetime(),
  })
  .refine((body) => body.team1 !== body.team2, {
    message:
      "Both teams cannot have the same name, please enter two different teams !",
  });
