import { test } from '@mono-repo/common'

export const testRoute = async (options: { params: { str: string } }) => {
  return { data: options.params.str }
}

test('asdf')
