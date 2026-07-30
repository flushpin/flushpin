# Trip Stops activation

Trip Stops is present in the repository but disabled by default. The server
reads `TRIP_STOPS_ENABLED`; an absent value or any value other than `true`
keeps the feature unavailable.

While disabled:

- the homepage does not render the Trip Stops card;
- `/trip-stops` uses the Next.js `notFound()` flow;
- `/api/trip-stops` returns 404 before parsing the request or initializing
  Supabase or provider dependencies;
- the sitemap and public navigation do not advertise the feature.

To enable it safely:

1. Configure Supabase public credentials and the server-only
   `GOOGLE_MAPS_KEY` in a non-production environment.
2. Review and set `GOOGLE_PLACES_ENABLED`, `GOOGLE_ROUTES_ENABLED`,
   `EXTERNAL_PLACE_FALLBACK_ENABLED`, `MAX_GOOGLE_CALLS_PER_TRIP`,
   `MAX_GOOGLE_CALLS_PER_SESSION`, and `DAILY_GOOGLE_REQUEST_BUDGET`.
3. Set `TRIP_STOPS_ENABLED=true`, redeploy that environment, and run the Trip
   Stops tests, TypeScript, focused lint, production build, provider-budget
   checks, direct route/API checks, and mobile visual review.
4. Do not enable it in production while the documented direct database PIN
   exposure remains an unresolved release blocker.
5. Roll back by setting `TRIP_STOPS_ENABLED=false` and redeploying.
