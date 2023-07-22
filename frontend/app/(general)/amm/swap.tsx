import { useState } from 'react'

import { useForm } from 'react-hook-form'
import { Address, useAccount, useChainId, useWaitForTransaction } from 'wagmi'

import { ContractWriteButton } from '@/components/blockchain/contract-write-button'
import { WalletConnect } from '@/components/blockchain/wallet-connect'
import { IsWalletConnected } from '@/components/shared/is-wallet-connected'
import { IsWalletDisconnected } from '@/components/shared/is-wallet-disconnected'

import { useCartesiInputBoxAddInput, useErc20Decimals, usePrepareCartesiInputBoxAddInput } from '@/lib/generated/blockchain'
import { formatUnits, parseUnits } from 'viem'
import { SelectToken } from './selectToken'
import { getCartesiAddresses, getSwapBody } from './utils'
import { useDynamicBalances } from '@/hooks/useDynamicBalances'
import { useBalanceDetails } from '@/hooks/useBalanceDetails'
import { useGetAmmTokens } from '@/hooks/useGetAmmTokens'
import { useQuote } from '@/hooks/useQuote'

export function SwapTokens() {
  const chainId = useChainId()
  const { address: accountAddress } = useAccount()
  const [tokenOne, setTokenOne] = useState<string>('')
  const [tokenTwo, setTokenTwo] = useState<string>('')

  const { data: tokens } = useGetAmmTokens()
  const { data: balanceDetails } = useBalanceDetails(tokens)
  const { data: dynamicBalancesTokenOne } = useDynamicBalances(balanceDetails, tokenOne)
  const { data: dynamicBalancesTokenTwo } = useDynamicBalances(balanceDetails, tokenTwo)

  const cartesiAddresses = getCartesiAddresses(chainId)

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

  const { data: quote } = useQuote(tokenOne, tokenTwo, parseUnits(`${Number(amountOne)}`, decimalsOne || 18).toString())

  const dateStringToTimestamp = (date: string) => {
    return Math.floor(Date.parse(date) / 1000)
  }

  const effectiveStartDate = nowOption ? Math.floor(Date.now() / 1000) : startDate ? dateStringToTimestamp(startDate) : 0
  const effectiveEndDate = endDate ? dateStringToTimestamp(endDate) : 0
  const duration = instantSwap ? 0 : effectiveEndDate - effectiveStartDate
  const startDateSend = nowOption || instantSwap ? 0 : effectiveStartDate

  const { config: configSwap } = usePrepareCartesiInputBoxAddInput({
    chainId,
    address: cartesiAddresses.inputBox as Address,
    args: [
      cartesiAddresses.dapp as Address,
      getSwapBody(
        parseUnits(`${Number(amountOne)}`, decimalsOne || 18),
        BigInt(0),
        [tokenOne as string, tokenTwo as string],
        duration,
        startDateSend,
        accountAddress as string
      ),
    ],
    enabled:
      !!tokenOne &&
      !!tokenTwo &&
      tokenOne !== tokenTwo &&
      !!amountOne &&
      (!!instantSwap || !!nowOption || !!startDate) &&
      (!!instantSwap || !!endDate) &&
      (!!instantSwap || effectiveStartDate <= effectiveEndDate),
  })

  const { data: dataSwap, write: writeSwap, isLoading: isLoadingSwap } = useCartesiInputBoxAddInput(configSwap)

  const { isLoading: isLoadingTxSwap } = useWaitForTransaction({
    hash: dataSwap?.hash,
  })

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(() => writeSwap?.())}>
      <div className="flex w-full">
        <div className="flex-grow w-7/10 pr-1 relative">
          <input {...register('amountOne')} className="input" type="number" />
          <span className="absolute top-[15px] right-[40px] text-gray-500">
            Balance: {Number(formatUnits(dynamicBalancesTokenOne.balance || BigInt(0), decimalsOne || 18)).toLocaleString()}
          </span>
        </div>
        <div className="w-3/10 pl-1">
          <SelectToken onSelectToken={setTokenOne} />
        </div>
      </div>
      <div className="flex w-full">
        <div className="flex-grow w-7/10 pr-1 relative">
          <input value={Number(formatUnits(BigInt(quote), decimalsTwo || 18)).toLocaleString()} className="input" type="string" disabled={true} />
          <span className="absolute top-[15px] right-[40px] text-gray-500">
            Balance: {Number(formatUnits(dynamicBalancesTokenTwo.balance || BigInt(0), decimalsTwo || 18)).toLocaleString()}
          </span>
        </div>
        <div className="w-3/10 pl-1">
          <SelectToken onSelectToken={setTokenTwo} />
        </div>
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
      <ContractWriteButton isLoadingTx={isLoadingTxSwap} isLoadingWrite={isLoadingSwap} loadingTxText="Swapping..." write={!!writeSwap}>
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
