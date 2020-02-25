import React, { useState, CSSProperties } from 'react'
import logo from './logo.svg'
import './App.css'
import { server } from './server'

const style: CSSProperties = {
  textAlign: 'left',
  margin: '0 auto',
  width: '500px',
}

const TestPathParams: React.FunctionComponent = () => {
  const [text, setText] = useState('')
  const serverData = server.useGet('/api/route-test/:str', {
    params: { delayFor: 1000 },
    pathParams: { str: text },
  })

  const result = serverData.loading ? (
    <div>Loading...</div>
  ) : serverData.ok ? (
    <div>
      Response: <pre>{JSON.stringify(serverData.content, null, 2)}</pre>
    </div>
  ) : (
    <div>Error on request: {serverData.error}</div>
  )

  return (
    <div style={style}>
      <div>
        <h2>Send Network Fetch</h2>
        <form>
          <input
            type="text"
            value={text}
            onChange={ev => setText(ev.target.value)}
          ></input>
        </form>
      </div>
      {result}
    </div>
  )
}

const App = () => {
  // Using this component you can get any endpoint with full type safety
  const healthData = server.useGet('/api/health', {
    params: {
      testParam: navigator.userAgent.toString().slice(0, 50),
    },
  })

  const healthComponent = healthData.loading ? (
    <p style={style}>Loading health data...</p>
  ) : healthData.ok ? (
    <div style={style}>
      Health Data: <pre>{JSON.stringify(healthData.content, null, 2)}</pre>
    </div>
  ) : (
    <div style={style}>
      Error calling health: <pre>{healthData.error}</pre>
    </div>
  )

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
      {healthComponent}
      <TestPathParams />
    </div>
  )
}

export default App
