import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  },
  resolve: {
    dedupe: ['vue', 'vue-i18n', '@intlify/core-base', '@intlify/message-compiler']
  },
  optimizeDeps: {
    include: ['vue-i18n']
  }
});
