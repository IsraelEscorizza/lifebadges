import { z } from "zod";

export const claimAchievementSchema = z.object({
  achievementId: z.string().cuid(),
  note: z.string().max(500).optional(),
  proofImageUrl: z.string().url().optional(),
});

export const validateAchievementSchema = z.object({
  userAchievementId: z.string().cuid(),
  type: z.enum(["VALIDATE", "CONTEST"]),
  comment: z.string().max(300).optional(),
});

export type ClaimAchievementInput = z.infer<typeof claimAchievementSchema>;
export type ValidateAchievementInput = z.infer<typeof validateAchievementSchema>;
