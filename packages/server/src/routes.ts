import { delayFor } from '@mono-repo/common'
import { testRoute } from './routes/test-route'

export const routes = {
  get: {
    '/api/route-test': testRoute,
    '/api/route-test/:str': async (options: {
      params: { delayFor?: number }
      pathParams: { str: string }
    }) => {
      if (options.params.delayFor) await delayFor(options.params.delayFor)

      return { params: options.params, pathParams: options.pathParams }
    },
    '/api/health': async ({ params }: { params?: object }) => {
      return { healthy: true, params }
    },
  },
  post: {
    '/api/route-test-post': async (options: {
      params: { str: string }
      body: { rockMy: 'yeah' }
    }) => {
      return { data: options.params.str }
    },
  },
}
