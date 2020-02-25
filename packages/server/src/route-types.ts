import { PromiseValue } from '@mono-repo/common'

/**
 * When JSON encoded types are made into strings
 */
export type DateToString<T> = T extends Date
  ? string
  : T extends object
  ? ConvertDatesToStrings<T>
  : T

/**
 * When JSON encoded types are made into strings
 */
export type ConvertDatesToStrings<T> = { [P in keyof T]: DateToString<T[P]> }

/**
 * To handle types that are json encoded and then decoded again
 * where types are changed.
 *
 * Currently just handles dates, when other types are added it'll also
 * include other conversion types.
 */
export type JSONEncodedDecoded<T> = ConvertDatesToStrings<T>

export type APIResponse<T> =
  | {
      ok: true
      data: JSONEncodedDecoded<T>
    }
  | {
      ok: false
      err: object
      data?: JSONEncodedDecoded<T>
    }

/**
 * Helps provide type info to the downstream consumer. Without this it wouldn't be able to
 * directly link the type, it'd be a generic type set for all routes.
 * If there are any generic keys within the options that you wish to add, add them to this list.
 */
// prettier-ignore
type HandlerOptions<O> =
  O extends undefined ? undefined : ( // If the options set is optional skip all this, infer automatically creates two branches
    & (O extends { params: infer Params }         ? { params: Params } : {})
    & (O extends { pathParams: infer PathParams } ? { pathParams: PathParams } : {})
    & (O extends { body: infer Body }             ? { body: Body } : {})
  )

/**
 * This generates a type that is never actually used for an object but is used
 * to provide the typing information from the routes the fetching call site.
 */
type RouteHandler<T> = T extends (opt: infer Options) => infer Result
  ? {
      options: HandlerOptions<Options>
      result: APIResponse<PromiseValue<Result>>
    }
  : never

/**
 * A set of routes where path is the full path `/foo/bar` and the
 */
export type RouteSet<T> = {
  [Path in keyof T]: RouteHandler<T[Path]>
}
