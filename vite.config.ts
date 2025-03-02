import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const ENVIRONMENT = process.env['ENVIRONMENT'];

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: ENVIRONMENT === 'prod' ? '/squirrel-time-tracking' : '/',
});
