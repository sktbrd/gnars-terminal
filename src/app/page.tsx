'use client'

import { useAuction } from '@/hooks/auction'
import { useReadAuctionAuction } from '@/hooks/wagmiGenerated'
import { DAO_ADDRESSES } from '@/utils/constants'
import { toObject } from '@/utils/helpers'
import { useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: manualAuction } = useAuction();
  const { data: wagmiAuction, isPending: wagmiAuctionIsPending } = useReadAuctionAuction();


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
        <div>{connectError?.message}</div>
      </div>

      <div>
        <h2>DAO Addresses</h2>
        <pre>{JSON.stringify(DAO_ADDRESSES, null, 2)}</pre>
      </div>

      <div>
        <h2>Manual Auction Data</h2>
        {
          manualAuction === null ? (
            <div>Loading...</div>
          ) : (
            <div>
              <pre>{JSON.stringify(toObject(manualAuction), null, 2)}</pre>
            </div>
          )
        }
      </div>

      <div>
        <h2>Wagmi Auction Data</h2>
        {
          wagmiAuctionIsPending ? (
            <div>Loading...</div>
          ) : (
            <div>
              <pre>{JSON.stringify(toObject(wagmiAuction), null, 2)}</pre>
            </div>
          )
        }
      </div>
    </>
  )
}

export default App
