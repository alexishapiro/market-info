'use client'

import { Provider } from "../lib/hooks"


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      value={{
        endpoint: 'api/model',
      }}
    >
      {children}
    </Provider>
  )
}