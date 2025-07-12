import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Tailwind प्लगइन को इम्पोर्ट करें
import path from 'path'

export default defineConfig({
  // यहाँ tailwindcss() प्लगइन जोड़ें
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // यह सुनिश्चित करें कि path सही है
      '@': path.resolve(__dirname, './client/src'), 
    },
  },
})
