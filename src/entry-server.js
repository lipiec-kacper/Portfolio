import { createApp } from './entry-client';

export async function render(url, manifest) {
  const { app } = createApp();
  // Handle server-side logic if needed
  return app; // Return the app instance
}
