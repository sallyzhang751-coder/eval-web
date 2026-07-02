import { defineConfig, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import fs from 'fs';
import path from 'path';
import { IncomingMessage, ServerResponse } from 'http';

const localApiPlugin = () => ({
  name: 'local-api',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      if (req.url === '/api/questions' && req.method === 'GET') {
        const dirA = '/Users/bytedance/Desktop/qw3rl0320';
        const dirB = '/Users/bytedance/Desktop/P2RL0515';
        
        try {
          const filesA = fs.existsSync(dirA) ? fs.readdirSync(dirA).filter(f => f.endsWith('.json')) : [];
          const filesB = fs.existsSync(dirB) ? fs.readdirSync(dirB).filter(f => f.endsWith('.json')) : [];
          
          const intersection = filesA.filter(f => filesB.includes(f));
          
          const questions = intersection.map(file => {
            const dataA = JSON.parse(fs.readFileSync(path.join(dirA, file), 'utf-8'));
            const dataB = JSON.parse(fs.readFileSync(path.join(dirB, file), 'utf-8'));
            
            const contentA = dataA.conversations?.[0]?.content || '';
            const contentB = dataB.conversations?.[0]?.content || '';
            const responseA = dataA.response || '';
            const responseB = dataB.response || '';
            const productCardsA = dataA.product_cards || [];
            const productCardsB = dataB.product_cards || [];
            
            return {
              id: file,
              dataA: {
                source: 'qw3rl0320',
                content: contentA,
                response: responseA,
                product_cards: productCardsA
              },
              dataB: {
                source: 'P2RL0515',
                content: contentB,
                response: responseB,
                product_cards: productCardsB
              }
            };
          });
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(questions));
        } catch (error: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
        return;
      }
      
      if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const resultsFile = path.resolve(__dirname, '../evaluation_results.json');
            
            let results: any[] = [];
            if (fs.existsSync(resultsFile)) {
              results = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
            }
            
            results.push({
              ...data,
              timestamp: Date.now()
            });
            
            fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
        return;
      }
      
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths(),
    localApiPlugin()
  ],
})
