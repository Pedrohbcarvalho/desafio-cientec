import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';

type RequestWithParams = IncomingMessage & { params: { [key: string]: string } };
export type RouteHandler = (req: RequestWithParams, res: ServerResponse) => void;

type Routes = {
    [method: string]: {
        [path: string]: RouteHandler;
    };
};

const routes: Routes = {};

export function handleRequest(req: IncomingMessage, res: ServerResponse) {
    const method = req.method?.toLowerCase() || '';
    const url = req.url || '';
    const parsedUrl = parse(url);

    let handler = routes[method]?.[parsedUrl.pathname || ''];

    if (!handler) {
        for (const routePath in routes[method]) {
            const routeRegex = new RegExp('^' + routePath.replace(/:[^\/]+/g, '([^/]+)') + '$');
            const match = (parsedUrl.pathname || '').match(routeRegex);

            if (match) {
                const paramNames = routePath.match(/:[^\/]+/g)?.map(name => name.substring(1)) || [];
                const params: { [key: string]: string } = {};

                paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });

                (req as RequestWithParams).params = params;
                handler = routes[method]?.[routePath];
                break;
            }
        }
    }

    if (handler) {
        handler(req as RequestWithParams, res);
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 Not Found');
    }
}

export function get(path: string, handler: RouteHandler) {
    routes.get = routes.get || {};
    routes.get[path] = handler;
}

export function post(path: string, handler: RouteHandler) {
    routes.post = routes.post || {};
    routes.post[path] = handler;
}
