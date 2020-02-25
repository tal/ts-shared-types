import { Routes } from '@mono-repo/server'
import { useState, useEffect } from 'react'

/**
 * If options has a params object append those params to
 * the end of the given path
 * @param path
 * @param options
 */
function modifyPathWithParams(path: string, options?: any) {
  if (!options) return path
  const params = options.params
  if (!params) return path
  const paramBuilder = new URLSearchParams()

  for (let paramName in params) {
    const paramValue = params[paramName]

    paramBuilder.append(paramName, paramValue.toString())
  }

  return `${path}?${paramBuilder.toString()}`
}

/**
 * If options has a pathParams object replace such instances
 * in the path with the value provided. For safety should be run before
 * appending params
 *
 * @param path
 * @param options
 */
function replacePathParams(path: string, options?: any) {
  if (!options) return path
  const params = options.pathParams
  if (!params) return path

  // TODO: Handle optional path pieces
  let url = path
  for (let paramName in params) {
    const paramValue = params[paramName]

    url = url.replace(`:${paramName}`, paramValue.toString())
  }

  return url
}

/**
 * Isolate the the extraction so that the types work out correctly regardless.
 * Without converting options to `any` one of the routes would have to have
 * `body` on it for it to be checked.
 * @param options
 */
function bodyString(options?: any) {
  if (!options) return undefined
  if (!options.body) return undefined

  return JSON.stringify(options.body)
}

class FetchError extends Error {
  constructor(readonly path: string, readonly status: number) {
    super(`Fetch error status ${status} on path: ${path}`)
  }
}

export type FetchOutstanding = { loading: true }
export type FetchSuccessful<T> = { loading: false; ok: true; content: T }
export type FetchFailed = { loading: false; ok: false; error: string }

export type FetchResp<T> = FetchOutstanding | FetchSuccessful<T> | FetchFailed

type GetRouteSet = Routes['get']
type PostRouteSet = Routes['post']

/**
 * Network connections to the server, gives you strong types while making
 * requests to the server. Uses `fetch` under the hood.
 */
export const server = {
  /**
   * Perform a GET request to the specified path.
   * @param path
   * @param options
   */
  get: function<
    Path extends keyof GetRouteSet,
    Route extends GetRouteSet[Path],
    Options extends Route['options'] & {
      signal?: AbortSignal | undefined | null
    },
    Result extends Route['result']
  >(path: Path, options: Options): Promise<Result> {
    const url = modifyPathWithParams(replacePathParams(path, options), options)

    return fetch(url, {
      method: 'GET',
      signal: options?.signal,
    }).then(response => response.json() as Promise<Result>)
  },
  /**
   * A react hook for fetching from GET endpoints. This is a relatively naive
   * implementation look at npm module `use-http` for a more robust one.
   *
   * @param path
   * @param options
   */
  useGet: function<
    Path extends keyof GetRouteSet,
    Route extends GetRouteSet[Path],
    Options extends Route['options'],
    Result extends Route['result']
  >(path: Path, options: Options): FetchResp<Result> {
    const [data, setData] = useState<FetchResp<Result>>({
      loading: true,
    })
    // Cannot call `server.get` because you need the `url` value to make
    // useEffect work correctly
    const url = modifyPathWithParams(replacePathParams(path, options), options)

    useEffect(() => {
      const controller = new AbortController()

      fetch(url, {
        method: 'GET',
        signal: controller.signal,
      })
        .then(response => {
          if (response.ok) {
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
              throw new TypeError("Oops, we haven't got JSON!")
            }
            return response.json() as Promise<Result>
          } else {
            throw new FetchError(path, response.status)
          }
        })
        .then(content => setData({ content, loading: false, ok: true }))
        .catch(err => {
          console.error(err)
          setData({ loading: false, ok: false, error: err.toString() })
        })

      return () => controller.abort()
    }, [path, url])

    return data
  },
  post: function<
    Path extends keyof PostRouteSet,
    Route extends PostRouteSet[Path],
    Options extends Route['options'],
    Result extends Route['result']
  >(path: Path, options: Options): Promise<Result> {
    const url = modifyPathWithParams(replacePathParams(path, options), options)
    const body = bodyString(options)

    return fetch(url, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => response.json() as Promise<Result>)
  },
}
