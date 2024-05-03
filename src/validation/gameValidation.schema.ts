import { z } from "zod";

const teamNames = [
  "Silly Geez - Tours",
  "Brutales Deluxe - Annecy",
  "Mecusa - Metz",
  "Les Petites Morts - Bordeaux",
  "Les Amazones - Aix en provence",
  "Les V'Hermines - Vannes",
  "La Horde - Orcet",
  "Les Glorious Batardes - Lomme",
] as const;

export const gameCreationSchema = z
  .object({
    team1: z.enum(teamNames),
    team2: z.enum(teamNames),
    startTime: z
      .string()
      .datetime({ offset: true })
      .refine((date) => new Date(date) > new Date(), {
        message: "start time must be in the future !",
      }),
  })
  .refine((body) => body.team1 !== body.team2, {
    message:
      "Both teams cannot have the same name, please enter two different teams !",
  });

export const gameUpdateSchema = z
  .object({
    team1: z.enum(teamNames).optional(),
    team2: z.enum(teamNames).optional(),
    startTime: z
      .string()
      .datetime()
      .refine((date) => new Date(date) > new Date(), {
        message: "start time must be in the future !",
      })
      .optional(),
    scoreTeam1: z.number({ coerce: true }).optional(),
    scoreTeam2: z.number({ coerce: true }).optional(),
  })
  .refine(
    (body) =>
      (body.scoreTeam1 !== undefined && body.scoreTeam2 !== undefined) ||
      (body.scoreTeam1 === undefined && body.scoreTeam2 === undefined),
    { message: "You cannot enter a score for only one team" },
  );
// to-do test case when a team has zero points
