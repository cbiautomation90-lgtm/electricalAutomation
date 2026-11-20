# Phase 1 Setup

## Supabase

1. Create a Supabase project.
2. Run migrations from `supabase/migrations` in timestamp order.
3. Add the public URL and anon key to environment variables.
4. Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Validation

```bash
npm run typecheck
npm run test
npm run build
```
