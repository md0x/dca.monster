import { useState } from 'react'

import { useForm } from 'react-hook-form'
import { Address, useAccount, useChainId } from 'wagmi'

import { ContractWriteButton } from '@/components/blockchain/contract-write-button'
import { WalletConnect } from '@/components/blockchain/wallet-connect'
import { IsWalletConnected } from '@/components/shared/is-wallet-connected'
import { IsWalletDisconnected } from '@/components/shared/is-wallet-disconnected'

import { useErc20Decimals } from '@/lib/generated/blockchain'

import { useGetAmmTokens } from '@/hooks/useGetAmmTokens'

export function SwapTokens() {
  const chainId = useChainId()
  const { address: accountAddress } = useAccount()
  const [tokenOne, setTokenOne] = useState<string>('')
  const [tokenTwo, setTokenTwo] = useState<string>('')

  const { data: tokens } = useGetAmmTokens()

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: { instantSwap: false, startDate: '', endDate: '', amountOne: 0, amountTwo: 0, now: false, tokenOne: '', tokenTwo: '' },
  })
  const amountOne = watch('amountOne')
  const amountTwo = watch('amountTwo')
  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const nowOption = watch('now')
  const instantSwap = watch('instantSwap')

  const now = new Date()
  const currentDateTime = now.toISOString().substring(0, 16)

  const { data: decimalsOne } = useErc20Decimals({
    address: tokenOne as Address,
    chainId,
  })

  const { data: decimalsTwo } = useErc20Decimals({
    address: tokenTwo as Address,
    chainId,
  })

  const dateStringToTimestamp = (date: string) => {
    return Math.floor(Date.parse(date) / 1000)
  }

  const effectiveStartDate = nowOption ? Math.floor(Date.now() / 1000) : startDate ? dateStringToTimestamp(startDate) : 0
  const effectiveEndDate = endDate ? dateStringToTimestamp(endDate) : 0
  const duration = instantSwap ? 0 : effectiveEndDate - effectiveStartDate
  const startDateSend = nowOption || instantSwap ? 0 : effectiveStartDate

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={() => console.log('yes')}>
      <div className="flex w-full">
        <div className="flex-grow w-7/10 pr-1 relative">
          <input {...register('amountOne')} className="input" type="number" />
        </div>
        <div className="w-3/10 pl-1">"Select Token"</div>
      </div>
      <div className="flex w-full">
        <div className="flex-grow w-7/10 pr-1 relative">
          <input {...register('amountTwo')} className="input" type="number" />
        </div>
        <div className="w-3/10 pl-1">"Select Token"</div>
      </div>
      <div className="flex items-center">
        <input {...register('instantSwap')} type="checkbox" id="instantSwap" />
        <label htmlFor="instantSwap" className="ml-2">
          Instant Swap
        </label>
      </div>

      <div className="flex w-full justify-between">
        <div className="w-1/2 pr-1  justify-between items-center">
          <label>Start:</label>
          <div className="flex items-center">
            <input
              type="datetime-local"
              {...register('startDate')}
              className="input"
              min={currentDateTime}
              disabled={instantSwap || nowOption} // disable input when instantSwap or nowOption is checked
            />
            <div>
              <input {...register('now')} type="checkbox" id="nowOption" />
              <label htmlFor="nowOption" className="ml-2">
                Start now
              </label>
            </div>
          </div>
        </div>
        <div className="w-1/2 pl-1">
          <label>End:</label>
          <input
            type="datetime-local"
            {...register('endDate')}
            className="input"
            min={currentDateTime}
            disabled={instantSwap} // disable input when instantSwap is checked
          />
        </div>
      </div>
      <ContractWriteButton isLoadingTx={false} isLoadingWrite={false} loadingTxText="Swapping..." write={true}>
        Swap
      </ContractWriteButton>
    </form>
  )
}

export function Swap() {
  return (
    <div className="card w-full">
      <IsWalletConnected>
        <div className="w-full">
          <SwapTokens />
          <hr className="my-4" />
          <div className="flex items-center justify-between">
            <h3 className="text-center">Stream swap</h3>
            <p className="text-center text-sm text-gray-500">Deploy a new mintable ERC20 token to any blockchain</p>
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
