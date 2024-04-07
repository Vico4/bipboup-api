import { z } from "zod";

export const betCreationSchema = z.object({
    gameId: z.string(),
    winnerBet: z.string().max(255).optional(),
    scoreBet: z.number().optional(),
}).refine((body) => body.winnerBet || body.scoreBet, {
    message: "You must provide at least a winner bet or a score bet",
});
