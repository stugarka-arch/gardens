import { z } from "zod";
export const discoverySchema = z.object({
  query: z.string().trim().min(2, "Вкажіть назву рослини"),
  isNoSpecifiedVariety: z.boolean(),
  varietyName: z.string().trim().max(150),
  color: z.string().trim().max(100),
});
export type DiscoveryFormValues = z.infer<typeof discoverySchema>;
