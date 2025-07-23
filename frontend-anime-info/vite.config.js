import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../cert/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../cert/server.crt')),
    },
    port: 5173,
    host: 'localhost',
  },
  preview: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../cert/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../cert/server.crt')),
    },
    port: 5173,
    host: 'localhost',
  }
});
