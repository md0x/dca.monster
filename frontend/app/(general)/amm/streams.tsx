import { WalletConnect } from '@/components/blockchain/wallet-connect'
import { IsWalletConnected } from '@/components/shared/is-wallet-connected'
import { IsWalletDisconnected } from '@/components/shared/is-wallet-disconnected'

import { BalanceDetails, useBalanceDetails } from '@/hooks/useBalanceDetails'
import { useDynamicBalances } from '@/hooks/useDynamicBalances'
import { useGetAmmTokens } from '@/hooks/useGetAmmTokens'
import { useTime } from '@/hooks/useTime'
import { useCartesiInputBoxAddInput, useErc20Symbol, usePrepareCartesiInputBoxAddInput } from '@/lib/generated/blockchain'
import { Address, formatUnits, parseUnits } from 'viem'
import { useAccount, useChainId, useWaitForTransaction } from 'wagmi'
import { getCancelBody, getCartesiAddresses, getSwapBody } from './utils'
import { duration } from 'moment'
import { useState } from 'react'
import { undefined } from 'zod'
import { token } from '@cartesi/rollups/dist/src/types/@openzeppelin/contracts'
import { ContractWriteButton } from '@/components/blockchain/contract-write-button'

export function Stream({ user, token, time, balanceDetails }: { user: string; token: string; time: number; balanceDetails: BalanceDetails }) {
  const chainId = useChainId()
  const [streamIdToCancel, setStreamIdToCancel] = useState<string | undefined>()
  const [parentIdToCancel, setParentIdToCancel] = useState<string | undefined>()
  const { address: accountAddress } = useAccount()
  const cartesiAddresses = getCartesiAddresses(chainId)

  const { data: dynamicBalance } = useDynamicBalances(balanceDetails, token)
  const { data: symbol } = useErc20Symbol({
    address: token as Address,
  })

  const { config: configSwap } = usePrepareCartesiInputBoxAddInput({
    chainId,
    address: cartesiAddresses.inputBox as Address,
    args: [cartesiAddresses.dapp as Address, getCancelBody(token, parentIdToCancel, streamIdToCancel)],
  })

  const { data: dataCancel, write: writeCancel, isLoading: isLoadingCancel } = useCartesiInputBoxAddInput(configSwap)

  const { isLoading: isLoadingTxCancel } = useWaitForTransaction({
    hash: dataCancel?.hash,
  })

  return (
    <div className="flex flex-col">
      {dynamicBalance.streams
        .filter((stream) => time < stream.end)
        .map((stream) => {
          const ellapsedTime = time >= stream.end ? stream.end - stream.start : time - stream.start
          const amount = (BigInt(ellapsedTime) * stream.amount) / BigInt(stream.end - stream.start)
          const isOut = stream.from === user
          const totalAmount = stream.amount // big int
          const remainingAmount = totalAmount - amount // big int
          const ratio = stream.ratio // big int
          const progress = (Number(amount) / Number(totalAmount)) * 100
          return (
            <div className="my-2">
              <p className="text-sm">
                {'monster' + symbol} - {isOut ? 'Sent' : 'Received'}: {Number(formatUnits(amount || BigInt(0), 18)).toLocaleString()} - Total:{' '}
                {Number(formatUnits(totalAmount || BigInt(0), 18)).toLocaleString()} - Ratio:{' '}
                {Number(formatUnits(ratio || BigInt(0), 18)).toLocaleString()} tokens/s
              </p>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${progress}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      isOut ? 'bg-pink-300' : 'bg-emerald-500'
                    }`}></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs">{isOut ? 'Outgoing' : 'Incoming'}</span>
                  {isOut && (
                    <button
                      className="text-xs text-red-500"
                      onMouseEnter={() => {
                        setParentIdToCancel(stream?.parent_id)
                        setStreamIdToCancel(stream?.id)
                      }}
                      onClick={() => {
                        setParentIdToCancel(stream?.parent_id)
                        setStreamIdToCancel(stream?.id)
                        writeCancel?.()
                      }}>
                      {isLoadingCancel || isLoadingTxCancel ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}

export function Streams() {
  const { address: accountAddress } = useAccount()
  const { data: time } = useTime()

  const { data: tokens } = useGetAmmTokens()

  const { data: balanceDetails } = useBalanceDetails(tokens)

  return (
    <div className="card w-full">
      <IsWalletConnected>
        <div className="w-full">
          {tokens?.map((token) => (
            <Stream user={accountAddress as string} token={token} time={time} balanceDetails={balanceDetails} />
          ))}
          <hr className="my-4" />
          <div className="flex items-center justify-between">
            <h3 className="text-center">Your streams</h3>
          </div>
        </div>
      </IsWalletConnected>
      <IsWalletDisconnected>
        <div className="flex items-center justify-center gap-10">
          <WalletConnect />
        </div>
      </IsWalletDisconnected>
    </div>
  )
}
