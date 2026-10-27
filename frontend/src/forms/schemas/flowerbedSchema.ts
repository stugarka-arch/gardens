import { z } from "zod";
export const flowerbedSchema = z.object({
  name: z.string().trim().min(1, "Вкажіть назву клумби").max(150),
  widthCm: z.coerce
    .number()
    .positive("Ширина має бути більшою за 0")
    .optional(),
  lengthCm: z.coerce
    .number()
    .positive("Довжина має бути більшою за 0")
    .optional(),
  description: z.string().max(10000).optional(),
});
export type FlowerbedFormValues = z.infer<typeof flowerbedSchema>;
