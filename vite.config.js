import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: true,
    rollupOptions: {
      input: {
        client: 'src/entry-client.js',
        server: 'src/entry-server.js',
      },
    },
  },
});
