// Registration storage: one row per registration in the Prisma Postgres database (env DATABASE_URL).
// The table is created by `node scripts/registrations.js init`, not at request time.
const { Pool } = require('pg');

let pool;
const getPool = () =>
  (pool ||= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2, // instances are reused across requests; two connections cover the two writes this app ever makes at once
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
  }));

// Idempotent: a retry of the same submission id is a no-op, so the count never double-counts a retry.
async function saveRegistration(id, v) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  await getPool().query(
    `INSERT INTO registrations (submission_id, env, first_name, last_name, phone, email, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (submission_id) DO NOTHING`,
    [id, process.env.VERCEL_ENV || 'development', v.firstName, v.lastName, v.phone, v.email, v.address]
  );
}

module.exports = { saveRegistration };
