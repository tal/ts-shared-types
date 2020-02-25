import { routes } from './routes'
import { RouteSet } from './route-types'

export type Routes = {
  get: RouteSet<typeof routes.get>
  post: RouteSet<typeof routes.post>
}
