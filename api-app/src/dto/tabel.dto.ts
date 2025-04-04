import { z } from 'zod';

export const TabelSchema = z.object({
  nama: z.string(),
  dansos: z.number(),
  kas: z.number(),
});

export type TabelDto = z.infer<typeof TabelSchema>;
