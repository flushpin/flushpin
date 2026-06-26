<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Protected Web Hero Screens

Do not modify these web hero experiences unless John explicitly approves that exact change in the current conversation:

- `app/HomePage.tsx` iPhone app screenshot hero using `public/flushpin-app-home-screen.png`
- `app/business/page.tsx` iPad business dashboard hero using `fp-ipad` / `fp-ipad-dashboard`

`npm run build` runs `scripts/protect-web-hero.js` and must fail if these protected screens are removed, replaced with the older CSS map/phone mockups, or missing required markers.
