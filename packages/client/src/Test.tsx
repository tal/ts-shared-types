import React from 'react'
import { server } from './server'

export const test = async () => {
  const data = await server.get('/api/route-test', { params: {str: ''} })

  return null
}
