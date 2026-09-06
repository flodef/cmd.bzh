import { neon } from '@neondatabase/serverless';

// Initialize neon client
// Note: process.env.DATABASE_URL is required for DB operations
// Pages that don't use DB will work fine without it since the module
// is only evaluated when imported, and the sql function is only called
// when actually querying the database
export const sql = neon((process.env.DATABASE_URL || '') as string);
