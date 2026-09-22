import { defineConfig } from "vite";

// Base must match the GitHub repo name so assets resolve correctly
// when served from https://<user>.github.io/allTracker-webapp/
export default defineConfig({
  base: "/allTracker-webapp/",
});
