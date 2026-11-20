# Deployment on Vercel

1. Import this repository into Vercel and select the `copilot/eam-manager-foundation` branch for preview, or merge the branch into the production branch when reviewed.
2. Create a Supabase project and apply every SQL migration in `supabase/migrations` in order.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Vercel environment variables (Preview and Production as appropriate).
4. Do not set or expose the Supabase service-role key in client-side code. There is no service-role usage in this app.
5. Deploy and verify sign-in, RLS, asset reads, and asset creation in a non-production environment first.

The current Phase 1 application requires an administrator to provision auth accounts and user roles through Supabase. Organization setup UI, editable assets, and remaining modules are not complete yet.
