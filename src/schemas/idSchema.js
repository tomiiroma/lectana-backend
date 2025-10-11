export const idSchema = z.object({ id: z.coerce.number().int().positive() });
