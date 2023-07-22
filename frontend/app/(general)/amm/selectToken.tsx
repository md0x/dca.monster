import { useState } from 'react'

import { formatUnits, isAddress, parseUnits } from 'viem'
import { Address, useAccount, useChainId, useWaitForTransaction } from 'wagmi'

import { ContractWriteButton } from '@/components/blockchain/contract-write-button'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGetAmmTokens } from '@/hooks/useGetAmmTokens'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { useBalanceDetails } from '@/hooks/useBalanceDetails'
import { useDynamicBalances } from '@/hooks/useDynamicBalances'
import {
  useCartesiErc20PortalDepositErc20Tokens,
  useCartesiInputBoxAddInput,
  useErc20Allowance,
  useErc20Approve,
  useErc20BalanceOf,
  useErc20Decimals,
  useErc20Symbol,
  usePrepareCartesiErc20PortalDepositErc20Tokens,
  usePrepareCartesiInputBoxAddInput,
  usePrepareErc20Approve
} from '@/lib/generated/blockchain'
import { getCartesiAddresses, getUnrawpBody } from './utils'

export const TokenItem = ({ token }: { token: string }) => {
  const { data: symbol } = useErc20Symbol({
    address: token as Address,
  })

  return (
    <span>
      {token.slice(0, 3) + '...' + token.slice(-3)} - {symbol}{' '}
    </span>
  )
}
export const SelectToken = ({ onSelectToken }: { onSelectToken: (token: string) => void }) => {
  const chainId = useChainId()

  const { address: accountAddress } = useAccount()

  const cartesiAddresses = getCartesiAddresses(chainId)

  const [wrapAmount, setWrapAmount] = useState<string>('')
  const [unwrapAmount, setUnwrapAmount] = useState<string>('')
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string>('')
  const [inputAddress, setInputAddress] = useState('')
  const maxBigInt = BigInt(2) ** BigInt(256) - BigInt(1)

  const { data: tokens } = useGetAmmTokens()

  const { data: balanceDetails } = useBalanceDetails(tokens)
  const { data: dynamicBalance } = useDynamicBalances(balanceDetails, selectedToken)

  const { data: balance } = useErc20BalanceOf({
    chainId,
    address: selectedToken as Address,
    args: accountAddress ? [accountAddress] : undefined,
    watch: true,
  })

  const { data: allowance } = useErc20Allowance({
    chainId,
    address: selectedToken as Address,
    args: [accountAddress as Address, cartesiAddresses.erc20Portal as Address],
  })

  const { data: symbol } = useErc20Symbol({
    address: selectedToken as Address,
  })

  const { data: decimals } = useErc20Decimals({
    address: selectedToken as Address,
    chainId,
  })

  const shouldApprove = Boolean((balance || 0) > (allowance || 0))

  const { config, error, isError } = usePrepareErc20Approve({
    chainId,
    address: selectedToken as Address,
    args: [cartesiAddresses.erc20Portal as Address, maxBigInt],
    enabled: shouldApprove,
  })

  const { data: dataApprove, write: writeApprove, isLoading: isLoadingApprove } = useErc20Approve(config)

  const { isLoading: isLoadingTxApprove } = useWaitForTransaction({
    hash: dataApprove?.hash,
  })

  const { config: configDeposit } = usePrepareCartesiErc20PortalDepositErc20Tokens({
    chainId,
    address: cartesiAddresses.erc20Portal as Address,
    args: [selectedToken as Address, cartesiAddresses.dapp as Address, parseUnits(`${Number(wrapAmount)}`, decimals || 18), '0x00'],
  })

  const { data: dataDeposit, write: writeDeposit, isLoading: isLoadingDeposit } = useCartesiErc20PortalDepositErc20Tokens(configDeposit)

  const { isLoading: isLoadingTxDeposit } = useWaitForTransaction({
    hash: dataDeposit?.hash,
  })

  const { config: configUnwrap } = usePrepareCartesiInputBoxAddInput({
    chainId,
    address: cartesiAddresses.inputBox as Address,
    args: [cartesiAddresses.dapp as Address, getUnrawpBody(selectedToken as Address, parseUnits(`${Number(unwrapAmount)}`, decimals || 18))],
  })

  const { data: dataUnwrap, write: writeUnwrap, isLoading: isLoadingUnwrap } = useCartesiInputBoxAddInput(configUnwrap)

  const { isLoading: isLoadingTxUnwrap } = useWaitForTransaction({
    hash: dataUnwrap?.hash,
  })

  function openDialog() {
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
  }

  const handleSelectToken = (token: string) => {
    setSelectedToken(token as Address)
    setInputAddress(token) // if you want to reflect selection in input box
    if (isAddress(token)) {
      onSelectToken(token) // notify parent component
    }
  }

  const handleInputAddress = (event: any) => {
    const address = event.target.value
    setInputAddress(address)
    setSelectedToken(address)
    if (isAddress(address)) {
      onSelectToken(address) // notify parent component
    }
  }

  return (
    <div>
      <button className="btn btn-blue" type="button" onClick={openDialog}>
        {selectedToken ? (symbol ? symbol : '?') : 'Select Token'}
      </button>

      <Dialog open={isDialogOpen}>
        <DialogContent>
          <DialogHeader onClick={closeDialog}>
            <DialogTitle>Select a token</DialogTitle>
            <DialogDescription>Dialog description goes here.</DialogDescription>
          </DialogHeader>

          <DropdownMenu>
            <DropdownMenuTrigger>{selectedToken ? selectedToken : 'Select a token'}</DropdownMenuTrigger>
            <DropdownMenuContent>
              {tokens.map((token: string) => (
                <DropdownMenuItem onClick={() => handleSelectToken(token)} key={token}>
                  <TokenItem token={token} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <input type="text" placeholder="Enter token address" value={inputAddress} onChange={handleInputAddress} />

          <div className="flex w-full">
            <div className="flex-grow w-4/10">
              <span>{symbol || '?'} </span>
              <span>{Number(formatUnits(balance || BigInt(0), decimals || 18)).toLocaleString()}</span>
            </div>

            <div className="flex flex-grow w-6/10 pr-1">
              <div className="flex-grow w-2/10 pr-1">
                <input type="number" value={wrapAmount} onChange={(event) => setWrapAmount(event.target.value)} className="input" />
              </div>
              <div className="w-2/10 pl-1">
                {!!writeApprove && shouldApprove ? (
                  <ContractWriteButton
                    isLoadingTx={isLoadingTxApprove}
                    isLoadingWrite={isLoadingApprove}
                    loadingTxText="Approving..."
                    write={!!writeApprove}
                    onClick={() => writeApprove?.()}>
                    Approve
                  </ContractWriteButton>
                ) : (
                  <ContractWriteButton
                    isLoadingTx={isLoadingTxDeposit}
                    isLoadingWrite={isLoadingDeposit}
                    loadingTxText="Wrapping..."
                    write={!!writeDeposit}
                    onClick={() => writeDeposit?.()}>
                    Wrap
                  </ContractWriteButton>
                )}
              </div>
            </div>
          </div>
          <div className="flex w-full">
            <div className="flex-grow w-4/10">
              <span>{'monster' + symbol || '?'} </span>
              <span>{Number(formatUnits(dynamicBalance.balance, decimals || 18)).toLocaleString()}</span>
            </div>
            <div className="flex flex-grow w-6/10 pr-1">
              <div className="flex-grow w-2/10 pr-1">
                <input type="number" value={unwrapAmount} onChange={(event) => setUnwrapAmount(event.target.value)} className="input" />
              </div>
              <div className="w-2/10 pl-1">
                <ContractWriteButton
                  isLoadingTx={isLoadingTxUnwrap}
                  isLoadingWrite={isLoadingUnwrap}
                  loadingTxText="Unwrapping..."
                  write={!!writeUnwrap}
                  onClick={() => writeUnwrap?.()}>
                  Unwrap
                </ContractWriteButton>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button type="button" onClick={closeDialog}>
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
