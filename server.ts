import http, {IncomingMessage, ServerResponse} from 'http';
import {parse, UrlWithParsedQuery} from 'url';
import next from 'next';
import conf from './next.config.js';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = false;
const app = next({conf, dev});
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
        if (!req.url) {
            res.statusCode = 400;
            res.end('Bad Request');
            return;
        }

        const parsedUrl: UrlWithParsedQuery = parse(req.url, true);

        if (parsedUrl.pathname?.startsWith('/_next/static/') || parsedUrl.pathname?.startsWith('/static/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
        }

        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        handle(req, res, parsedUrl).catch((err) => {
            console.error('❌ Error handling request:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        });
    });

    server.listen(port, () => {
        console.log(`🚀 Server ready at http://localhost:${port}`);
    });

    server.on('error', (err) => {
        console.error('❌ Server error:', err);
    });
});