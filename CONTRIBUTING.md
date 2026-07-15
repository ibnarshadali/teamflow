# Contributing

1. Create a focused branch for each change.
2. Keep route files thin and place feature logic under `src/features`.
3. Use shared UI primitives from `src/components/ui` before creating new components.
4. Do not commit `.env` files or Supabase secrets.
5. Run `npm run lint`, `npm run typecheck`, and `npm run build` before opening a PR.
6. Document schema changes in `docs/database.md` and add SQL under `supabase/`.
