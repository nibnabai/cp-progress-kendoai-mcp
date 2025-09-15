import z from "zod";

const envSchema = z.object({
  SECRET: z.string().min(1),
  SERVER_URL: z.string().min(1),
});

export const env = envSchema.parse(process.env);
