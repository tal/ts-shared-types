# Typescript Monorepo Template

This is a template for building a typescript monorepo. It includes a built-in
Create React App client, an express server, a shared package, and some code to
glue them together.

This README will serve as a description for why everything is setup the way it
is so that you can extend and modify it to fit your eventual needs.

- [Cool Stuff](#cool-stuff)
  - [Intra-module Shared Types Without Build](#intra-module-shared-types-without-build)
  - [Strongly Typed Client Fetch](#strongly-typed-client-fetch)
- [How Do Monorepo?](#how-do-monorepo)
  - [Yarn](#yarn)
  - [Lerna](#lerna)
  - [`tsc` Typescript](#tsc-typescript)
- [How to Develop](#how-to-develop)
  - [Starting your own repo](#starting-your-own-repo)
  - [Building your own packages](#building-your-own-packages)
  - [Build & Run](#build--run)
  - [Adding a server endpoint](#adding-a-server-endpoint)
- [Typescript](#typescript)
  - [Server Shared Types](#server-shared-types)

## Cool Stuff

### Intra-module Shared Types Without Build

<img src="https://github.tumblr.net/gist/tal/71a2bcf02129d419280df1e5c869d392/raw/8bfc2cb2d04df0188b47a28caf149e3bbc592992/instant-type-update.gif">

### Strongly Typed Client Fetch

Get all the available routes:

<img src="https://github.tumblr.net/gist/tal/71a2bcf02129d419280df1e5c869d392/raw/8bfc2cb2d04df0188b47a28caf149e3bbc592992/useGet-1-path.png" width="640">

Know when you need params:

<img src="https://github.tumblr.net/gist/tal/71a2bcf02129d419280df1e5c869d392/raw/8bfc2cb2d04df0188b47a28caf149e3bbc592992/useGet-2-params.png" width="640">

Know what params exist and their types:

<img src="https://github.tumblr.net/gist/tal/71a2bcf02129d419280df1e5c869d392/raw/8bfc2cb2d04df0188b47a28caf149e3bbc592992/useGet-3-paramsKeys.png" width="640">

Know the route's return type:

<img src="https://github.tumblr.net/gist/tal/71a2bcf02129d419280df1e5c869d392/raw/8bfc2cb2d04df0188b47a28caf149e3bbc592992/useGet-4-returnType.png" width="640">

## How Do Monorepo?

In order to create a monorepo this template leverages several technologies in conjunction: `tsc`, `yarn 1.x`, and `lerna`.

### Yarn

Yarn provides the underlying code linking allowing the packages to reference
each other and share common dependencies. This is all done in the root
[`package.json`](./package.json). The Root package can also contain common
dependencies, in this case things like typescript, lerna, and prettier. The
dependencies listed in here are available to all of the subpackages. In addition
all of the subpackages are automatically available to any other subpackage.

#### Subpackages

By convention each package is named with `@[project-name]/[package-name]` and is
pinned to the version `1.0.0`. Since they are all marked as private all packages
are internally referenced and don't need to maintain versioning, thus `1.0.0` is
arbitrary.

Each subpackage that references each other does need to be included in the
`dependencies` key in their respective `package.json`. After this is added
`yarn` will provide symlinks to the respective package, it's important to
include the typings file in the `package.json` so that you have access to the
other package's types.

### Lerna

Lerna's usage in this is very small: it's to run commands on each subpackage in
the order that their dependency graph requires. In this simple case it will run
commands in the order of `common`->`server`->`client`. These commands can be
things like build or test.

### `tsc` Typescript

Typescript itself can handle multiple packages via the `references` key in the
`tsconfig.json` file. This has the huge benefit of having type changes in one
module instantly being available to the package that.

Typescript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) allow you to tell the typescript compiler what other code you're referencing. This accomplishes several things:

- When building a given project will also build its dependencies to make sure
  everything is up to date.
- Allows the typescript language server to see reference changes immediately,
  this allows vscode to have the latest typings.
- Allows you to build all packages at once.

#### `tsconfig.json`

This repo uses, mostly, shared typescript configs. The base config
[`./tsconfig.base.json`](./tsconfig.base.json) provides the compiler options to
all of the packages _**other than**_ the client which has its own due to the
requirements of create react app.

The primary difference between each config is the references for which project
it references. `tsconfig.json` files don't have to be directly associated with a
package and can be used to leverage compilation. If you look at
[packages/tsconfig.json](./packages/tsconfig.json) you can build all of the
libraries at once by running `tsc -b packages`. This will not generate the
client as that uses thee create react app scripts for generation.

## How to Develop

### Starting your own repo

To use this repo to create your own project start by tapping the "use this
template" button ![use this template button](docs/use-this-template.png).

If you want to do it manually I'd recommend you clone this repo and then delete
the git repo to start from scratch (`rm -rf .git`).

### Building your own packages

If you want to add more packages than the three listed go for it! It's quite
easy you'll just want to follow these steps.

1. Create folder in the `packages/` folder.
2. Create your `package.json` file in the new folder.

   - Use a common naming scheme, something like `@[project-name]/[package-name]`
   - Add any dependencies to other internal packages manually.
   - Add the build script: `"build": "tsc -b .",`
   - Make sure you've included a types key, like: `"types": "dist/index.d.ts",`

3. Create your `tsconfig.json`

   - Take a look at the
     [`packages/server/tsconfig.json`](./packages/server/tsconfig.json) for an example.
     - Make sure that you include any references in this file.
     - If you're using jest you may want to exclude your test files so jest
       doesn't run both the compiled and uncompiled files.

4. If you want to test using jest check out the `common` repo, it contains a
   working example of jest working.

### Build & Run

To quickly get started on server you can run `yarn run watch` in the root
folder, this will run a watcher that will build both the client and the common
packages. You will then need to re-run `yarn start` after each code change. If
this is annoying I recommend looking into tools like
[nodemon](https://nodemon.io) to have an auto-restarting server.

To develop the client, you can run `yarn run client`. This is the same as
running `yarn start` in the client package directly. This assumes that the
server is already running. This runner will auto-rebuild the client code.

### Adding a server endpoint

There is no express framework in this template but there is a helper to add
endpoints that also allows for types to be shared with the client. To learn
about how this works with typescript check out
[this section](#server-shared-types). This section here will describe _how_ to
add a new endpoint.

The routes object is a simple type of
`routes[get|post]['/api/my-path'] = async function`. When you add a new function
to this object it'll automatically handle it.

It's very important that all your routes start with `/api` so that the react
proxy knows to forward them along to the server and not render the SPA.

#### Responder function

The function that you assign to the route is essentially of the form:

```ts
type Responder = (options: {
  req: express.Request
  resp: express.Response
  params?: object
  pathParams?: object
  body?: object
}) => Promise<object>
```

It's important that you don't set the type of the responder manually, the
automatic detection of the type is what allows the
[type sharing](#server-shared-types).

The `params`, `pathParams`, and `body` keys in options provide strong typing for
what type of object is incoming to the function. Instead of sending the response
via the response object, you can just return an object. If you throw an error
inside of the responder it'll automatically return a 500 with the contents of
the thrown error.

## Typescript

There's some interesting uses of typescript within this, this section is for
explaining how these uses work and why.

### Server Shared Types

Most of the logic for this is contained within
[`route-types.ts`](./packages/server/src/route-types.ts).

The purpose of this is to allow the client to not only know the response types
of endpoints but also what endpoints exist and what parameters they take. This
is done entirely with the type system and no codegen. This goal is to simplify
the build process but does have limitations. In order to accomplish this a type
is created that is used purely to enable this, no types are actually created
with this type. The type that's generated is of the form:

```ts
type Routes = {
  get: {
    '/api/my-route/:id': {
      options: {
        pathParams: { id: string }
        params: { offset: number }
      }
      result: Promise<
        APIResponse<{
          items: string[]
        }>
      >
    }
  }
}
```

Let's start with discussing how this type is generated, we'll get into
`APIResponse` and how it's used later.

Looking at the end goal of providing a typed fetch api, we needed to determine 3
things:

1. Path
2. Input type: `params`, `pathParams`, and `body`.
3. Response type

To get the exact values for these we must use a generic type. This means that we
cannot have the handler match a pre-existing type. As an example you can compare
the types for both of these.

```ts
type Handler = (options?: { params?: object }) => Promise<object>
const handler: Handler = async (options: { params: { id: number } }) => ({
  items: ['abc', `${options.params.id}`],
})
```

This method is good because it ensures that the assignment contains the
appropriate values, and it will error if not done. Unfortunately it erases the
specific types for params and the return.

```ts
type Handler<P, R> = (options?: { params?: P }) => Promise<R>
const handler: Handler<{ id: number }, { items: string[] }> = async (options: {
  params: { id: number }
}) => ({
  items: ['abc', `${options.params.id}`],
})
```

This method is better, it allows for specific types, but unfortunately you have
to specify the type in two places, a pain in the neck 🙂.

```ts
const handler = async (options: { params: { id: number } }) => ({
  items: ['abc', `${options.params.id}`],
})
/*
typeof handler = (options: {
    params: {
        id: number;
    };
}) => Promise<{
    items: string[];
}>
*/
```

If we let typescript infer the type, we get the exact values inferred for us.

Approach one doesn't work for us, but either of the latter two would work, it's
a matter of preference and either would work. The important thing is getting the
exact types into the type system.

In order to convert these handlers into the new format we want we start to use
the `infer` feature of the typescript type system. The
[`RouteHandler`](./packages/server/src/route-types.ts#L50-L59) type is a meta
type that converts a function definition into the structure that we're looking
for. Let's examine this type:

```ts
type RouteHandler<T> = T extends (opt: infer Options) => infer Result
  ? {
      options: HandlerOptions<Options>
      result: APIResponse<PromiseValue<Result>>
    }
  : never
```

`T extends (opt: infer Options) => infer Result` this ensures that a function
with one attribute is passed in. If not then it'll be omitted from the output
type by the `never` attribute. If the type is matched, the `infer` keyword generates the new types `Options` and `Result`.

[`HandlerOptions`](./packages/server/src/route-types.ts#L37-L48) is used to take
the inferred `Options` type from above and pull out the relevant types if they
exist. This is type is required to be able to extract the specific types from
options. Without this there'd be no way to both know the presence of these keys
and their values. This allows you to detect known keys and extract their types
if they exist.

```ts
// prettier-ignore
type HandlerOptions<O> =
  O extends undefined ? undefined : ( // If the options set is optional skip all this, infer automatically creates two branches
    & (O extends { params: infer Params }         ? { params: Params } : {})
    & (O extends { pathParams: infer PathParams } ? { pathParams: PathParams } : {})
    & (O extends { body: infer Body }             ? { body: Body } : {})
  )
```

First it checks if the options are undefined, this allows for handlers to have
optional parameters. If the options object exists it generates a type with each
of the given keys. If more keys are needed they'd need to be added to this type.

At this point we're able to generate a type that contains addressable keys for
all relevant input keys and the result type. Next we need to be able to map that
to a specific path.

To get the path we can then build up an object that looks something like this:

```ts
const routes = {
  '/api/one': handlerOne,
  '/api/two': handlerTwo,
}
```

If not overwritten, an object like this provides a type with exact key names. This means that the type already has the path built in. In order to use the types we previously generated with this object we need to make a type that maps each individual key to a specific type. To do that we use the [`RouteSet`](./packages/server/src/route-types.ts#L61-L66) type:

```ts
type RouteSet<T> = {
  [Path in keyof T]: RouteHandler<T[Path]>
}
```

This type iterates though each key in the source object and generates a
corresponding value type individually. Contrast that with a more generic record
type like this:

```ts
type RouteSet<T> = {
  [k: string]: RouteHandler<T[ ¯\_(ツ)_/¯ ]>
}
```

`RouteSet` is the type that we can export that the client fetcher can then use
to provide type safe access. With that we'll move on to describing how to use
this type to consume the data.

#### Fetching with static types

All of thee logic associated with consuming a `RouteSet` is located in the
[`server.ts`](./packages/client/src/server.ts) file. The primary typescript
feature used here is the ability to access the type of a key on an object.

```ts
function get<
  Path extends keyof MyRouteSet,
  Route extends MyRouteSet[Path],
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
}

const result = await get('/api/one', { params: { id: 123 } })
```

This function creates a bunch of generic types that provide typeahead and
compile time safety.

- `Path` is the string literal value that is by definition the path to request.
- `Route` is the `RouteHandler` object associated with that particular path.
- `Options` takes the options generated by `HandlerOptions` and adds in the
  ability to pass in `AbortSignal` that the underling `fetch` implementation can
  use to abort the request.
- `Result` is the wrapped type provided by the server.
- Within the method there's custom logic to apply the `params` and `pathParams`
  to the full URL used by `fetch`. Unfortunately within the function
  implementation the `options` variable doesn't actually know if it has any of
  these keys, so we must cast it to `any` to be able to access the values.
