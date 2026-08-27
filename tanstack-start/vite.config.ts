import { URL, fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { nitro } from 'nitro/vite'
import { defineConfig, type PluginOption } from 'vite'

const reactCompilerBabel = (await babel({
  presets: [reactCompilerPreset()],
})) as PluginOption

const config = defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: {
      host: 'localhost',
      port: 3000,
      protocol: 'ws',
    },
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    devtools(),
    nitro({ preset: 'bun' }),
    tailwindcss(),
    tanstackStart({}),
    viteReact(),
    reactCompilerBabel,
  ],
})

export default config
