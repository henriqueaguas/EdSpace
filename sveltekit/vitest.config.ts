import { defineConfig } from "vite";

export default defineConfig({
  test: {
    // Makes test tests run in sequence. Avoids inconsistent and unexpected DB states.
    singleThread: true,
    env: {
      NODE_ENV: "test",
    },
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      $lib: "./src/lib",
      $envvars: "./environment",
    },
  },
});
