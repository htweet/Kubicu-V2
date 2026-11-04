import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Real sign-in builds (M2.6) read their runtime switch from /config.js, a static file served next to the
 * app and never cached, which sets window.__KUBICU_CONFIG__. It is a plain script, loaded before the app's
 * module script, so start-up stays synchronous and makes no fetch. Prototype builds do not reference it.
 */
function runtimeConfigScript(): Plugin {
  return {
    name: 'kubicu-runtime-config',
    transformIndexHtml(html) {
      if (process.env.VITE_KUBICU_REAL_AUTH !== 'true') return html;
      return html.replace('</head>', '    <script src="/config.js"></script>\n  </head>');
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), runtimeConfigScript()],
})
