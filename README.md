This repository contains an example of a bug in Vinext.

https://github.com/cloudflare/vinext/issues/3919

---

# vinext app

This project was created with create-vinext-app.

## Scripts

- `npm run dev` starts the vinext dev server.
- `npm run build` builds the Cloudflare Worker output.
- `npm run start` previews the built Worker locally.
- `npm run deploy` deploys the Cloudflare Worker.
- `npm test` runs unit and DOM tests. Unit tests are in `*.test.{ts,tsx}` files and DOM tests are in `*.dom.test.{ts,tsx}` files.
- `npm run test:integration` builds the app, then tests it end to end (HTML, RSC payloads, API routes). Integration tests are in `*.integration.test.{ts,tsx}` files.
