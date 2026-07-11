import type { PropsWithChildren } from 'react'
// eslint-disable-next-line ts/consistent-type-imports -- React is a namespace needed for React.ReactNode
import * as React from 'react'
import '@captcha-pro/taro-react/dist/style.css'
import './app.scss'

function App({ children }: PropsWithChildren): React.ReactNode {
  return children
}

export default App
