import { bunServerAdapter } from "@builder.io/qwik-city/adapters/bun-server/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config";
import { _TextEncoderStream_polyfill, _TextDecoderStream_polyfill } from "./polyfills";


// This polyfill is required when you use SSG and build your app with Bun, because Bun does not have TextEncoderStream. See: https://github.com/oven-sh/bun/issues/5648
globalThis.TextEncoderStream ||= _TextEncoderStream_polyfill;
globalThis.TextDecoderStream ||= _TextDecoderStream_polyfill;

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.bun.ts", "src/entry.bun_cluster.ts", "@qwik-city-plan"],
      },
      minify: false,
    },
    plugins: [
      bunServerAdapter({
        ssg: null 
        // ssg: {
        //   include: ["/*"],
        //   origin: "https://testing.frostytools.com",
        //   maxWorkers: 1, // Limit Workers to 1, otherwise SSG will hang when compiling Qwik City app with `bun run --bun build`.
        // },
      }),
    ],
  };
});
