import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './client/src/**/*.{js,ts,jsx,tsx}', // Your client files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
