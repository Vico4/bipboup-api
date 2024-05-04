import { z } from "zod";

export const betCreationSchema = z.object({
  gameId: z.string(),
  winnerBet: z.string().max(255),
  scoreBet: z.number({ coerce: true }).optional(),
});

// todo use team list enum
export const betUpdateSchema = z
  .object({
    winnerBet: z.string().max(255).optional(),
    scoreBet: z.number({ coerce: true }).optional(),
  })
  .refine((body) => body.winnerBet || body.scoreBet, {
    message: "You must update at least one value",
  });
