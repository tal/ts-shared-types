export type PromiseValue<T> = T extends Promise<infer U> ? U : T

export function test(opts: number) {}

/**
 * Returns a promise that resolves after specified number of ms
 * @param ms
 */
export function delayFor(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}
