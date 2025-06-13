import { neon } from '@neondatabase/serverless';

// Initialize neon client
export const sql = neon(process.env.DATABASE_URL as string);
