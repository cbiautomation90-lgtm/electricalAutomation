# Deployment on Vercel

## Before deployment

1. Review the project branch and its changes, then import the repository into Vercel.
2. In Vercel, configure the Next.js framework preset and use the repository's standard install/build commands (`npm install` and `npm run build`).
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the Preview environment first. Add the same variables to Production only after preview verification.
4. Configure Supabase Auth's site URL and redirect URLs for the Vercel preview and production domains. Use HTTPS production URLs.
5. Apply all SQL migrations in `supabase/migrations` in timestamp order to a staging Supabase project before production. Verify RLS using accounts for each role used by the app.
6. Create test accounts and assign least-privilege roles through Supabase administration. Confirm sign-in, sign-out, protected routes, record creation, and reporting in Preview.
7. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` in CI or locally with the lockfile-based package manager before promoting the deployment.

## Secrets and safety

- Never expose a Supabase service-role key to browser code or add it as a `NEXT_PUBLIC_` variable. The app uses the anon key and database RLS; do not configure a service-role key unless a reviewed server-only feature specifically requires it.
- Do not commit `.env.local` or production credentials.
- A successful Vercel build does not verify database migrations, RLS policy correctness, or operational workflows; test those against staging first.

## Rollout

Deploy the branch to a Vercel Preview deployment first. Review the build logs and complete the staging checklist before merging to the repository's production branch and promoting to Production. Configure a rollback path and monitor application and Supabase logs after release.
