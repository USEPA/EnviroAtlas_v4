import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

import path from 'path';
const projectRootDir = path.resolve(__dirname);

let proxy = {
    '/ea/api/': {
        target: 'http://localhost'
    }
};

// set up client side route proxy that translates /blt/client/* -> /*
// because vite dev server is serving everything from root / but references are all to /blt/client/*
//dont' need to proxy public, admin, admin/parts etc now because vite fallsback to index.html
//and we reference resource like css, images, etc absolutely nov via /blt/client/*
let routes = ['admin','public'];
for (let route of routes) {
    route = '/ea/' + route;
    let routeEscaped = route.replace(/\//g,'\\/');
    let re = new RegExp('^' + routeEscaped);
    proxy['^' + routeEscaped + '$'] = proxy[route + '/'] = {
        target: 'http://localhost:5173/ea/client',
        rewrite: (path) => path.replace(re, '')
    };

}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ea/client',
  publicDir: 'www',
//  build: {outDir:'www/dist'},
//  rollupOptions: {base: '/ea/client',output: {file: 'www/dist/index.js'}},
  resolve: {
    alias:[
        {
            find: 'src',
            replacement: path.resolve(projectRootDir, 'src')
        }
    ]
  },
  server: {
      proxy
  },
  plugins: [svelte()],
})
