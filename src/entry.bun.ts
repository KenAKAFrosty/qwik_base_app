/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for the Bun HTTP server when building for production.
 *
 * Learn more about the Bun integration here:
 * - https://qwik.dev/docs/deployments/bun/
 * - https://bun.sh/docs/api/http
 *
 */
import { createQwikCity } from "@builder.io/qwik-city/middleware/bun";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import render from "./entry.ssr";

// Create the Qwik City Bun middleware
const { router, notFound, staticFile } = createQwikCity({
  render,
  qwikCityPlan,
  manifest,
});

// Allow for dynamic port
const port = Number(Bun.env.PORT ?? 3000);

// eslint-disable-next-line no-console
console.log(`Server started: http://localhost:${port}/`);

Bun.serve({
  async fetch(request: Request) {
    console.log('Test 💙');
    try {
      console.log("Handling request", request.url.toString());
      const staticResponse = await staticFile(request).catch((e) => {
        console.log("Bun serve staticFile error", e);
        return null;
      });

      if (staticResponse) {
        staticResponse.headers.set(
          "Referrer-Policy",
          "no-referrer-when-downgrade"
        );
        staticResponse.headers.set(
          "Strict-Transport-Security",
          "max-age=31536000; includeSubDomains; preload"
        );
        staticResponse.headers.set("X-Frame-Options", "SAMEORIGIN");
        staticResponse.headers.set(
          "Permissions-Policy",
          "autoplay=(*), fullscreen=(*), geolocation=(), microphone=(), camera=(), payment=()"
        );
        staticResponse.headers.set(
          "Cache-Control",
          "public, max-age=30, s-maxage=2419200"
        );
        return staticResponse;
      }

      // Server-side render this request with Qwik City
      const qwikCityResponse = await router(request).catch((e) => {
        console.log("Bun serve router error", e);
        return null;
      });
      if (qwikCityResponse) {
        return qwikCityResponse;
      }

      // Path not found
      return notFound(request).catch((e) => {
        console.log("Bun serve notFound error:", e);
        return new Response("Not found", { status: 404 });
      });
    } catch (e) {
      console.log("Bun serve error:", e);
      return new Response("Internal server error", { status: 500 });
    }
  },
  port,
  reusePort: true,
});
