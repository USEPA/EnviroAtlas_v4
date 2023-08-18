import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

import path from 'path';
const projectRootDir = path.resolve(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  base: 'ea',
  publicDir: 'www',
  resolve: {
    alias:[
        {
            find: 'src',
            replacement: path.resolve(projectRootDir, 'src')
        }
    ]
  },
  plugins: [svelte()],
})
