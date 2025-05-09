import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: Number(env.VITE_APP_PORT),
      proxy: {
        '/api': {
          target: env.VITE_APP_API_BASE_URL,
          changeOrigin: true,
          secure: true,
        }
      },
    },
    build: {
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'vuetify', 'axios'],
            // 'ui': ['@mdi/font']
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    preview: {
      port: 5173,
      strictPort: true
    }
  }
})




// import { defineConfig } from 'vite';
// import vue from '@vitejs/plugin-vue';
// import vuetify from 'vite-plugin-vuetify';
// import path from 'path';
// import { fileURLToPath, URL } from 'node:url';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     vue(),
//     vuetify({ autoImport: true }),
//   ],
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url)),
//     },
//   },
//   server: {
//     port: Number(import.meta.env.VITE_APP_PORT),
//     proxy: {
//       '/api': {
//         target: import.meta.env.VITE_APP_API_BASE_URL,
//         changeOrigin: true,
//         secure: true,
//         // ws: true,
//       }
//     },
//   },
//   build: {
//     sourcemap: true,
//     minify: 'terser',
//     terserOptions: {
//       compress: {
//         drop_console: true,
//         drop_debugger: true
//       }
//     },
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           'vendor': ['vue', 'vue-router', 'vuetify', 'axios'],
//           'ui': ['@mdi/font']
//         },
//         chunkFileNames: 'assets/js/[name]-[hash].js',
//         entryFileNames: 'assets/js/[name]-[hash].js',
//         assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
//       }
//     }
//   },
//   preview: {
//     port: 5173,
//     strictPort: true
//   }
// });
