import { z } from "zod";

export const subirImagenSchema = z.object({
  carpeta: z.enum(['items', 'avatares', 'marcos', 'fondos']).default('items'),
  tipo: z.string().optional(),
  categoria: z.string().optional()
});