import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';

function prefersMarkdown(acceptHeader?: string): boolean {
  if (!acceptHeader || acceptHeader.trim() === '' || acceptHeader === '*/*') return false;
  const parts = acceptHeader.split(',').map(part => {
    const [type, ...params] = part.trim().split(';');
    let q = 1.0;
    for (const p of params) {
      const [k, v] = p.trim().split('=');
      if (k === 'q' && v) {
        const parsed = parseFloat(v);
        if (!isNaN(parsed)) q = parsed;
      }
    }
    return { type: type.trim().toLowerCase(), q };
  });

  const md = parts.find(p => p.type === 'text/markdown');
  const html = parts.find(p => p.type === 'text/html' || p.type === 'application/xhtml+xml');
  if (!md) return false;
  if (!html) return true;
  return md.q > html.q;
}

// Serverless API dev server runner with Markdown & AI specs support for local development
function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const [cleanUrl, queryString] = url.split('?');

        try {
          // Decorate response for Vercel/Express-like handler signature
          (res as any).status = function (code: number) {
            this.statusCode = code;
            return this;
          };
          (res as any).json = function (data: any) {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(data));
          };

          // Always attach describedby Link headers
          res.setHeader(
            'Link',
            '<https://raisequity.com/llms.txt>; rel="describedby", <https://raisequity.com/llms-full.txt>; rel="describedby", <https://raisequity.com/ai.txt>; rel="describedby"'
          );

          // 1. LLMs & AI Manifests
          if (cleanUrl === '/llms.txt') {
            const mod = await server.ssrLoadModule('./api/llms-txt.ts');
            return mod.default(req, res);
          }
          if (cleanUrl === '/llms-full.txt') {
            const mod = await server.ssrLoadModule('./api/llms-full-txt.ts');
            return mod.default(req, res);
          }
          if (cleanUrl === '/ai.txt') {
            const mod = await server.ssrLoadModule('./api/ai-txt.ts');
            return mod.default(req, res);
          }

          // 2. Markdown Catalog
          if (cleanUrl === '/api/md/_catalog') {
            const mod = await server.ssrLoadModule('./api/catalog.ts');
            return mod.default(req, res);
          }

          // 3. Direct backend URL: /api/md/* or /api/md?path=...
          if (cleanUrl.startsWith('/api/md')) {
            const subPath = cleanUrl.replace('/api/md/', '').replace('/api/md', '');
            const queryParams = new URLSearchParams(queryString || '');
            const pathParam = queryParams.get('path') || subPath || '';
            (req as any).query = { path: pathParam };
            const mod = await server.ssrLoadModule('./api/md.ts');
            return mod.default(req, res);
          }

          // 4. .md Suffix on any public route (e.g. /pricing.md, /founders.md)
          if (cleanUrl.endsWith('.md')) {
            const pathParam = cleanUrl.replace(/\.md$/, '');
            (req as any).query = { path: pathParam };
            const mod = await server.ssrLoadModule('./api/md.ts');
            return mod.default(req, res);
          }

          // 5. Content negotiation (Accept: text/markdown with q > html)
          const accept = req.headers['accept'] as string | undefined;
          const isStaticAsset =
            cleanUrl.startsWith('/@') ||
            cleanUrl.startsWith('/src/') ||
            cleanUrl.startsWith('/node_modules/') ||
            cleanUrl.startsWith('/assets/') ||
            cleanUrl.startsWith('/api/') ||
            /\.(png|jpe?g|gif|svg|ico|webp|js|css|woff2?|map|json|ts|tsx)$/i.test(cleanUrl);

          if (!isStaticAsset && prefersMarkdown(accept)) {
            (req as any).query = { path: cleanUrl };
            const mod = await server.ssrLoadModule('./api/md.ts');
            return mod.default(req, res);
          }

          // 6. Regular /api/* endpoints
          if (cleanUrl.startsWith('/api/')) {
            const urlPath = cleanUrl.replace('/api/', '');

            if (req.method === 'POST') {
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
              }
              const rawBody = Buffer.concat(chunks).toString('utf-8');
              try {
                (req as any).body = JSON.parse(rawBody);
              } catch {
                (req as any).body = rawBody;
              }
            }

            let mod: any = null;
            if (urlPath === 'health') mod = await server.ssrLoadModule('./api/health.ts');
            else if (urlPath === 'create-checkout') mod = await server.ssrLoadModule('./api/create-checkout.ts');
            else if (urlPath === 'send-email') mod = await server.ssrLoadModule('./api/send-email.ts');
            else if (urlPath === 'ai') mod = await server.ssrLoadModule('./api/ai.ts');
            else if (urlPath === 'opensign-agreement') mod = await server.ssrLoadModule('./api/opensign-agreement.ts');
            else if (urlPath === 'dodo-webhook') mod = await server.ssrLoadModule('./api/dodo-webhook.ts');

            if (mod && mod.default) {
              await mod.default(req, res);
              return;
            }
          }

          next();
        } catch (err: any) {
          console.error('[API Dev Error]', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          res.end('# 500 Internal Server Error\n\n' + (err.message || 'Error executing endpoint'));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), apiDevPlugin()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'vendor-motion': ['framer-motion'],
            'vendor-query': ['@tanstack/react-query'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'motion/react': path.resolve(__dirname, 'node_modules/framer-motion'),
        'framer-motion': path.resolve(__dirname, 'node_modules/framer-motion'),
        'node-fetch': path.resolve(__dirname, 'src/lib/fetch-stub.ts'),
        'formdata-polyfill/esm.min.js': path.resolve(__dirname, 'src/lib/formdata-stub.ts'),
        'formdata-polyfill': path.resolve(__dirname, 'src/lib/formdata-stub.ts'),
      },
    },
    optimizeDeps: {
      entries: ['index.html'],
    },
    server: {
      port: 3005,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/scratch/**', '**/.system_generated/**'],
      },
    },
  };
});
