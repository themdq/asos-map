// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    preview: {
      allowedHosts: ['windborne.malashikh.in', '.malashikh.in'],
    },
    server: {
      host: true,
      port: 4321,
      allowedHosts: ['windborne.malashikh.in', '.malashikh.in'],
    },
  },
  output: 'static',
  integrations: [react()],
});