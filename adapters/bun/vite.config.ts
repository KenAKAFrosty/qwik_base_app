import { bunServerAdapter } from "@builder.io/qwik-city/adapters/bun-server/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config";

var _TextEncoderStream_polyfill = class {
  #pendingHighSurrogate = null;
  #handle = new TextEncoder();
  #transform = new TransformStream({
    transform: (chunk, controller) => {
      chunk = String(chunk);
      let finalChunk = "";
      for (const item of chunk) {
        const codeUnit = item.charCodeAt(0);
        if (this.#pendingHighSurrogate !== null) {
          const highSurrogate = this.#pendingHighSurrogate;
          this.#pendingHighSurrogate = null;
          if (codeUnit >= 56320 && codeUnit <= 57343) {
            finalChunk += highSurrogate + item;
            continue;
          }
          finalChunk += "\uFFFD";
        }
        if (codeUnit >= 55296 && codeUnit <= 56319) {
          this.#pendingHighSurrogate = item;
          continue;
        }
        if (codeUnit >= 56320 && codeUnit <= 57343) {
          finalChunk += "\uFFFD";
          continue;
        }
        finalChunk += item;
      }
      if (finalChunk) {
        controller.enqueue(this.#handle.encode(finalChunk));
      }
    },
    flush: (controller) => {
      if (this.#pendingHighSurrogate !== null) {
        controller.enqueue(new Uint8Array([239, 191, 189]));
      }
    }
  });
  get encoding() {
    return this.#handle.encoding;
  }
  get readable() {
    return this.#transform.readable;
  }
  get writable() {
    return this.#transform.writable;
  }
  get [Symbol.toStringTag]() {
    return "TextEncoderStream";
  }
};

// This polyfill is required when you use SSG and build your app with Bun, because Bun does not have TextEncoderStream. See: https://github.com/oven-sh/bun/issues/5648
globalThis.TextEncoderStream ||= _TextEncoderStream_polyfill;

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
        // {
        //   include: ["/*"],
        //   origin: "https://testing.frostytools.com",
        //   maxWorkers: 1, // Limit Workers to 1, otherwise SSG will hang when compiling Qwik City app with `bun run --bun build`.
        // },
      }),
    ],
  };
});
