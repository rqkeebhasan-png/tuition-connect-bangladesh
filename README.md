# Tuition Connect Bangladesh

বাংলা-প্রধান tuition marketplace-এর React + Vite + TypeScript foundation।

## চালানো

Node.js 20+ ইনস্টল করার পর:

```bash
npm install
copy .env.example .env.local
npm run dev
```

`.env.local`-এ Supabase project URL এবং browser-safe anon key যোগ করলে Supabase Authentication চালু হবে:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Supabase Dashboard-এর Authentication settings-এ Email provider চালু রাখুন। Sign up-এর পরে email confirmation চালু থাকলে confirmation link-এ ক্লিক করে লগইন করতে হবে। কোনো service-role key frontend-এ রাখা যাবে না।

## Validation

```bash
npm run build
npm run lint
npm test
```

## Phase 1 scope

- Responsive Bengali-first layout, navbar, footer এবং design tokens
- Homepage sections এবং সত্যভিত্তিক empty states
- Public routes এবং future dashboard/admin route placeholders
- Supabase client ও environment validation প্রস্তুত
- Supabase email/password authentication, session persistence এবং sign out

## পরবর্তী Phase

## Database setup

The marketplace migration is in [`supabase/migrations/20261028182000_marketplace.sql`](./supabase/migrations/20261028182000_marketplace.sql). Apply it from the Supabase Dashboard SQL Editor, or with the Supabase CLI:

```bash
supabase login
supabase init
supabase link --project-ref hgwubqpnddjwicaqaacl
supabase db push
```

After applying the migration, the tutor and tuition search pages read from Supabase with RLS-protected public results. Add tutor profiles and published tuition posts through the Supabase dashboard or the authenticated application workflow.

If the original marketplace migration was already applied before existing users were created, also run [`supabase/migrations/20261028184000_backfill_existing_profiles.sql`](./supabase/migrations/20261028184000_backfill_existing_profiles.sql) once.
