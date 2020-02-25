import * as path from 'path'
import * as express from 'express'
import { routes } from './routes'
import { IRouterMatcher } from 'express'

const PORT = process.env['SERVER_PORT'] || '3020'
const IS_DEV = process.env['NODE_ENV'] === 'dev'

const app = express()
app.use(express.json())

export type APIResponse<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      err: object
      data?: T
    }

type ResponseHandlerOptions = {
  req: express.Request
  resp: express.Response
  params: express.Request['params']
  pathParams: express.Request['params']
}

export type ResponseHandler<T> = (
  options: ResponseHandlerOptions,
) => T | Promise<T>

function buildHandler<T>(fn: ResponseHandler<T>) {
  return async (req: express.Request, resp: express.Response) => {
    let responseJson: APIResponse<T>

    const result = fn({ req, resp, params: req.query, pathParams: req.params })

    let promise = result instanceof Promise ? result : Promise.resolve(result)

    let data: T | undefined
    try {
      data = await promise
      responseJson = { ok: true, data }
    } catch (err) {
      responseJson = { ok: false, err }
      console.error(err)
    }

    const status = responseJson.ok ? 200 : 500
    resp.status(status).json(responseJson)
    return responseJson
  }
}

const eRoutes = routes as Record<string, Record<string, any>>
for (let method in eRoutes) {
  if (method in app) {
    for (let route in eRoutes[method]) {
      const handler = eRoutes[method][route]
      ;((app as any)[method] as IRouterMatcher<typeof app>)(
        route,
        buildHandler(handler),
      )
    }
  }
}

if (!IS_DEV) {
  // Serve the client SPA from any unmatched routes
  const PUBLIC = path.join(__dirname, '../../client/build')
  app.use(express.static(PUBLIC))
  app.get('*', (req, res) => {
    res.sendFile(path.join(PUBLIC, 'index.html'))
  })
}

app.listen(PORT, () => {
  const isDev = IS_DEV ? 'in dev mode' : ''
  console.log(`Starting server on http://localhost:${PORT} ${isDev}`)
})
