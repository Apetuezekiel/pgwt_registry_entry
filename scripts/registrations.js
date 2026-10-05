#!/usr/bin/env node
// Developer tool for the registrations table. Not part of the site bundle or the deployed function.
//
//   vercel env pull .env.registrations --environment=production --yes
//   node --env-file=.env.registrations scripts/registrations.js init            create the table (safe to repeat)
//   node --env-file=.env.registrations scripts/registrations.js list            count and details, real sign-ups only
//   node --env-file=.env.registrations scripts/registrations.js list --all      include preview and test rows
//   node --env-file=.env.registrations scripts/registrations.js list --csv      same, as CSV on stdout
//
// Delete the env file afterwards: it holds the database password.
const { Pool } = require('pg');

const [cmd = 'list', ...flags] = process.argv.slice(2);
const has = (f) => flags.includes(f);

const csv = (rows) => {
  const cell = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`;
  const cols = ['created_at', 'env', 'first_name', 'last_name', 'phone', 'email', 'address', 'submission_id'];
  return [cols.join(','), ...rows.map((r) => cols.map((c) => cell(c === 'created_at' ? r[c].toISOString() : r[c])).join(','))].join('\n');
};

(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set. Pull it first, see the usage at the top of this file.');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    if (cmd === 'init') {
      await pool.query(`CREATE TABLE IF NOT EXISTS registrations (
        id            bigserial PRIMARY KEY,
        submission_id text        NOT NULL UNIQUE,
        env           text        NOT NULL,
        first_name    text        NOT NULL,
        last_name     text        NOT NULL,
        phone         text        NOT NULL,
        email         text        NOT NULL,
        address       text        NOT NULL,
        created_at    timestamptz NOT NULL DEFAULT now()
      )`);
      console.log('registrations table is ready');
    } else if (cmd === 'list') {
      const { rows } = await pool.query(
        `SELECT * FROM registrations ${has('--all') ? '' : "WHERE env = 'production'"} ORDER BY created_at`
      );
      if (has('--csv')) return console.log(csv(rows));
      const people = new Set(rows.map((r) => r.email.toLowerCase())).size;
      console.log(`${rows.length} registration(s) from ${people} distinct email(s)${has('--all') ? ' (all environments)' : ' (production only)'}\n`);
      for (const r of rows) {
        console.log(`${r.created_at.toISOString().slice(0, 16).replace('T', ' ')}  ${r.env.padEnd(10)} ${r.first_name} ${r.last_name} | ${r.phone} | ${r.email} | ${r.address}`);
      }
    } else {
      throw new Error(`Unknown command "${cmd}". Use init or list.`);
    }
  } finally {
    await pool.end();
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
