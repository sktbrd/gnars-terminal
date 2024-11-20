'use client'

import { useAuction } from '@/hooks/auction'
import { DAO_ADDRESSES } from '@/utils/constants'
import { toObject } from '@/utils/helpers'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { data } = useAuction();


  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <div>
        <h2>DAO Addresses</h2>
        <pre>{JSON.stringify(DAO_ADDRESSES, null, 2)}</pre>
      </div>

      <div>
        <h2>Auction Data</h2>
        {
          data === null ? (
            <div>Loading...</div>
          ) : (
            <div>
              <pre>{JSON.stringify(toObject(data), null, 2)}</pre>
            </div>
          )
        }
      </div>
    </>
  )
}

export default App
