// Generated by @wagmi/cli@1.1.0 on 22/07/2023 at 16:13:56
import {
  useContractRead,
  UseContractReadConfig,
  useContractWrite,
  UseContractWriteConfig,
  usePrepareContractWrite,
  UsePrepareContractWriteConfig,
  useContractEvent,
  UseContractEventConfig,
} from 'wagmi'
import { ReadContractResult, WriteContractMode, PrepareWriteContractResult } from 'wagmi/actions'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// erc20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20ABI = [
  {
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
  },
  { stateMutability: 'view', type: 'function', inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }] },
  { stateMutability: 'view', type: 'function', inputs: [], name: 'name', outputs: [{ name: '', type: 'string' }] },
  { stateMutability: 'view', type: 'function', inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }] },
  { stateMutability: 'view', type: 'function', inputs: [], name: 'totalSupply', outputs: [{ name: '', type: 'uint256' }] },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// cartesiDapp
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cartesiDappABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'newConsensus', internalType: 'contract IConsensus', type: 'address', indexed: false }],
    name: 'NewConsensus',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'voucherId', internalType: 'uint256', type: 'uint256', indexed: false }],
    name: 'VoucherExecuted',
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_destination', internalType: 'address', type: 'address' },
      { name: '_payload', internalType: 'bytes', type: 'bytes' },
      {
        name: '_proof',
        internalType: 'struct Proof',
        type: 'tuple',
        components: [
          {
            name: 'validity',
            internalType: 'struct OutputValidityProof',
            type: 'tuple',
            components: [
              { name: 'inputIndex', internalType: 'uint64', type: 'uint64' },
              { name: 'outputIndex', internalType: 'uint64', type: 'uint64' },
              { name: 'outputHashesRootHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'vouchersEpochRootHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'noticesEpochRootHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'machineStateHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'keccakInHashesSiblings', internalType: 'bytes32[]', type: 'bytes32[]' },
              { name: 'outputHashesInEpochSiblings', internalType: 'bytes32[]', type: 'bytes32[]' },
            ],
          },
          { name: 'context', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'executeVoucher',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getConsensus',
    outputs: [{ name: '', internalType: 'contract IConsensus', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getTemplateHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_newConsensus', internalType: 'contract IConsensus', type: 'address' }],
    name: 'migrateToConsensus',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_notice', internalType: 'bytes', type: 'bytes' },
      {
        name: '_proof',
        internalType: 'struct Proof',
        type: 'tuple',
        components: [
          {
            name: 'validity',
            internalType: 'struct OutputValidityProof',
            type: 'tuple',
            components: [
              { name: 'inputIndex', internalType: 'uint64', type: 'uint64' },
              { name: 'outputIndex', internalType: 'uint64', type: 'uint64' },
              { name: 'outputHashesRootHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'vouchersEpochRootHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'noticesEpochRootHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'machineStateHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'keccakInHashesSiblings', internalType: 'bytes32[]', type: 'bytes32[]' },
              { name: 'outputHashesInEpochSiblings', internalType: 'bytes32[]', type: 'bytes32[]' },
            ],
          },
          { name: 'context', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'validateNotice',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_inboxInputIndex', internalType: 'uint256', type: 'uint256' },
      { name: '_outputIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'wasVoucherExecuted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// cartesiInputBox
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cartesiInputBoxABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'dapp', internalType: 'address', type: 'address', indexed: true },
      { name: 'inboxInputIndex', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'sender', internalType: 'address', type: 'address', indexed: false },
      { name: 'input', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'InputAdded',
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_dapp', internalType: 'address', type: 'address' },
      { name: '_input', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'addInput',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_dapp', internalType: 'address', type: 'address' },
      { name: '_index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getInputHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_dapp', internalType: 'address', type: 'address' }],
    name: 'getNumberOfInputs',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// cartesiErc20Portal
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cartesiErc20PortalABI = [
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'contract IERC20', type: 'address' },
      { name: '_dapp', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
      { name: '_execLayerData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'depositERC20Tokens',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'getInputBox',
    outputs: [{ name: '', internalType: 'contract IInputBox', type: 'address' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Read<TFunctionName extends string, TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>>(
  config: Omit<UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>, 'abi'> = {} as any
) {
  return useContractRead({ abi: erc20ABI, ...config } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"allowance"`.
 */
export function useErc20Allowance<TFunctionName extends 'allowance', TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>>(
  config: Omit<UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any
) {
  return useContractRead({ abi: erc20ABI, functionName: 'allowance', ...config } as UseContractReadConfig<
    typeof erc20ABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"balanceOf"`.
 */
export function useErc20BalanceOf<TFunctionName extends 'balanceOf', TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>>(
  config: Omit<UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any
) {
  return useContractRead({ abi: erc20ABI, functionName: 'balanceOf', ...config } as UseContractReadConfig<
    typeof erc20ABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"decimals"`.
 */
export function useErc20Decimals<TFunctionName extends 'decimals', TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>>(
  config: Omit<UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any
) {
  return useContractRead({ abi: erc20ABI, functionName: 'decimals', ...config } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"name"`.
 */
export function useErc20Name<TFunctionName extends 'name', TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>>(
  config: Omit<UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any
) {
  return useContractRead({ abi: erc20ABI, functionName: 'name', ...config } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"symbol"`.
 */
export function useErc20Symbol<TFunctionName extends 'symbol', TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>>(
  config: Omit<UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any
) {
  return useContractRead({ abi: erc20ABI, functionName: 'symbol', ...config } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"totalSupply"`.
 */
export function useErc20TotalSupply<TFunctionName extends 'totalSupply', TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>>(
  config: Omit<UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any
) {
  return useContractRead({ abi: erc20ABI, functionName: 'totalSupply', ...config } as UseContractReadConfig<
    typeof erc20ABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Write<TFunctionName extends string, TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<PrepareWriteContractResult<typeof erc20ABI, string>['request']['abi'], TFunctionName, TMode>
    : UseContractWriteConfig<typeof erc20ABI, TFunctionName, TMode> & {
        abi?: never
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, TFunctionName, TMode>({ abi: erc20ABI, ...config } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"approve"`.
 */
export function useErc20Approve<TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<PrepareWriteContractResult<typeof erc20ABI, 'approve'>['request']['abi'], 'approve', TMode> & {
        functionName?: 'approve'
      }
    : UseContractWriteConfig<typeof erc20ABI, 'approve', TMode> & {
        abi?: never
        functionName?: 'approve'
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, 'approve', TMode>({ abi: erc20ABI, functionName: 'approve', ...config } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transfer"`.
 */
export function useErc20Transfer<TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<PrepareWriteContractResult<typeof erc20ABI, 'transfer'>['request']['abi'], 'transfer', TMode> & {
        functionName?: 'transfer'
      }
    : UseContractWriteConfig<typeof erc20ABI, 'transfer', TMode> & {
        abi?: never
        functionName?: 'transfer'
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, 'transfer', TMode>({ abi: erc20ABI, functionName: 'transfer', ...config } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transferFrom"`.
 */
export function useErc20TransferFrom<TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<PrepareWriteContractResult<typeof erc20ABI, 'transferFrom'>['request']['abi'], 'transferFrom', TMode> & {
        functionName?: 'transferFrom'
      }
    : UseContractWriteConfig<typeof erc20ABI, 'transferFrom', TMode> & {
        abi?: never
        functionName?: 'transferFrom'
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, 'transferFrom', TMode>({ abi: erc20ABI, functionName: 'transferFrom', ...config } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__.
 */
export function usePrepareErc20Write<TFunctionName extends string>(
  config: Omit<UsePrepareContractWriteConfig<typeof erc20ABI, TFunctionName>, 'abi'> = {} as any
) {
  return usePrepareContractWrite({ abi: erc20ABI, ...config } as UsePrepareContractWriteConfig<typeof erc20ABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"approve"`.
 */
export function usePrepareErc20Approve(config: Omit<UsePrepareContractWriteConfig<typeof erc20ABI, 'approve'>, 'abi' | 'functionName'> = {} as any) {
  return usePrepareContractWrite({ abi: erc20ABI, functionName: 'approve', ...config } as UsePrepareContractWriteConfig<typeof erc20ABI, 'approve'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transfer"`.
 */
export function usePrepareErc20Transfer(
  config: Omit<UsePrepareContractWriteConfig<typeof erc20ABI, 'transfer'>, 'abi' | 'functionName'> = {} as any
) {
  return usePrepareContractWrite({ abi: erc20ABI, functionName: 'transfer', ...config } as UsePrepareContractWriteConfig<typeof erc20ABI, 'transfer'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transferFrom"`.
 */
export function usePrepareErc20TransferFrom(
  config: Omit<UsePrepareContractWriteConfig<typeof erc20ABI, 'transferFrom'>, 'abi' | 'functionName'> = {} as any
) {
  return usePrepareContractWrite({ abi: erc20ABI, functionName: 'transferFrom', ...config } as UsePrepareContractWriteConfig<
    typeof erc20ABI,
    'transferFrom'
  >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Event<TEventName extends string>(config: Omit<UseContractEventConfig<typeof erc20ABI, TEventName>, 'abi'> = {} as any) {
  return useContractEvent({ abi: erc20ABI, ...config } as UseContractEventConfig<typeof erc20ABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__ and `eventName` set to `"Approval"`.
 */
export function useErc20ApprovalEvent(config: Omit<UseContractEventConfig<typeof erc20ABI, 'Approval'>, 'abi' | 'eventName'> = {} as any) {
  return useContractEvent({ abi: erc20ABI, eventName: 'Approval', ...config } as UseContractEventConfig<typeof erc20ABI, 'Approval'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__ and `eventName` set to `"Transfer"`.
 */
export function useErc20TransferEvent(config: Omit<UseContractEventConfig<typeof erc20ABI, 'Transfer'>, 'abi' | 'eventName'> = {} as any) {
  return useContractEvent({ abi: erc20ABI, eventName: 'Transfer', ...config } as UseContractEventConfig<typeof erc20ABI, 'Transfer'>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link cartesiDappABI}__.
 */
export function useCartesiDappRead<TFunctionName extends string, TSelectData = ReadContractResult<typeof cartesiDappABI, TFunctionName>>(
  config: Omit<UseContractReadConfig<typeof cartesiDappABI, TFunctionName, TSelectData>, 'abi'> = {} as any
) {
  return useContractRead({ abi: cartesiDappABI, ...config } as UseContractReadConfig<typeof cartesiDappABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link cartesiDappABI}__ and `functionName` set to `"getConsensus"`.
 */
export function useCartesiDappGetConsensus<
  TFunctionName extends 'getConsensus',
  TSelectData = ReadContractResult<typeof cartesiDappABI, TFunctionName>
>(config: Omit<UseContractReadConfig<typeof cartesiDappABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any) {
  return useContractRead({ abi: cartesiDappABI, functionName: 'getConsensus', ...config } as UseContractReadConfig<
    typeof cartesiDappABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link cartesiDappABI}__ and `functionName` set to `"getTemplateHash"`.
 */
export function useCartesiDappGetTemplateHash<
  TFunctionName extends 'getTemplateHash',
  TSelectData = ReadContractResult<typeof cartesiDappABI, TFunctionName>
>(config: Omit<UseContractReadConfig<typeof cartesiDappABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any) {
  return useContractRead({ abi: cartesiDappABI, functionName: 'getTemplateHash', ...config } as UseContractReadConfig<
    typeof cartesiDappABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link cartesiDappABI}__ and `functionName` set to `"validateNotice"`.
 */
export function useCartesiDappValidateNotice<
  TFunctionName extends 'validateNotice',
  TSelectData = ReadContractResult<typeof cartesiDappABI, TFunctionName>
>(config: Omit<UseContractReadConfig<typeof cartesiDappABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any) {
  return useContractRead({ abi: cartesiDappABI, functionName: 'validateNotice', ...config } as UseContractReadConfig<
    typeof cartesiDappABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link cartesiDappABI}__ and `functionName` set to `"wasVoucherExecuted"`.
 */
export function useCartesiDappWasVoucherExecuted<
  TFunctionName extends 'wasVoucherExecuted',
  TSelectData = ReadContractResult<typeof cartesiDappABI, TFunctionName>
>(config: Omit<UseContractReadConfig<typeof cartesiDappABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any) {
  return useContractRead({ abi: cartesiDappABI, functionName: 'wasVoucherExecuted', ...config } as UseContractReadConfig<
    typeof cartesiDappABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link cartesiDappABI}__.
 */
export function useCartesiDappWrite<TFunctionName extends string, TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<PrepareWriteContractResult<typeof cartesiDappABI, string>['request']['abi'], TFunctionName, TMode>
    : UseContractWriteConfig<typeof cartesiDappABI, TFunctionName, TMode> & {
        abi?: never
      } = {} as any
) {
  return useContractWrite<typeof cartesiDappABI, TFunctionName, TMode>({ abi: cartesiDappABI, ...config } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link cartesiDappABI}__ and `functionName` set to `"executeVoucher"`.
 */
export function useCartesiDappExecuteVoucher<TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<PrepareWriteContractResult<typeof cartesiDappABI, 'executeVoucher'>['request']['abi'], 'executeVoucher', TMode> & {
        functionName?: 'executeVoucher'
      }
    : UseContractWriteConfig<typeof cartesiDappABI, 'executeVoucher', TMode> & {
        abi?: never
        functionName?: 'executeVoucher'
      } = {} as any
) {
  return useContractWrite<typeof cartesiDappABI, 'executeVoucher', TMode>({ abi: cartesiDappABI, functionName: 'executeVoucher', ...config } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link cartesiDappABI}__ and `functionName` set to `"migrateToConsensus"`.
 */
export function useCartesiDappMigrateToConsensus<TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof cartesiDappABI, 'migrateToConsensus'>['request']['abi'],
        'migrateToConsensus',
        TMode
      > & { functionName?: 'migrateToConsensus' }
    : UseContractWriteConfig<typeof cartesiDappABI, 'migrateToConsensus', TMode> & {
        abi?: never
        functionName?: 'migrateToConsensus'
      } = {} as any
) {
  return useContractWrite<typeof cartesiDappABI, 'migrateToConsensus', TMode>({
    abi: cartesiDappABI,
    functionName: 'migrateToConsensus',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link cartesiDappABI}__.
 */
export function usePrepareCartesiDappWrite<TFunctionName extends string>(
  config: Omit<UsePrepareContractWriteConfig<typeof cartesiDappABI, TFunctionName>, 'abi'> = {} as any
) {
  return usePrepareContractWrite({ abi: cartesiDappABI, ...config } as UsePrepareContractWriteConfig<typeof cartesiDappABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link cartesiDappABI}__ and `functionName` set to `"executeVoucher"`.
 */
export function usePrepareCartesiDappExecuteVoucher(
  config: Omit<UsePrepareContractWriteConfig<typeof cartesiDappABI, 'executeVoucher'>, 'abi' | 'functionName'> = {} as any
) {
  return usePrepareContractWrite({ abi: cartesiDappABI, functionName: 'executeVoucher', ...config } as UsePrepareContractWriteConfig<
    typeof cartesiDappABI,
    'executeVoucher'
  >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link cartesiDappABI}__ and `functionName` set to `"migrateToConsensus"`.
 */
export function usePrepareCartesiDappMigrateToConsensus(
  config: Omit<UsePrepareContractWriteConfig<typeof cartesiDappABI, 'migrateToConsensus'>, 'abi' | 'functionName'> = {} as any
) {
  return usePrepareContractWrite({ abi: cartesiDappABI, functionName: 'migrateToConsensus', ...config } as UsePrepareContractWriteConfig<
    typeof cartesiDappABI,
    'migrateToConsensus'
  >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link cartesiDappABI}__.
 */
export function useCartesiDappEvent<TEventName extends string>(
  config: Omit<UseContractEventConfig<typeof cartesiDappABI, TEventName>, 'abi'> = {} as any
) {
  return useContractEvent({ abi: cartesiDappABI, ...config } as UseContractEventConfig<typeof cartesiDappABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link cartesiDappABI}__ and `eventName` set to `"NewConsensus"`.
 */
export function useCartesiDappNewConsensusEvent(
  config: Omit<UseContractEventConfig<typeof cartesiDappABI, 'NewConsensus'>, 'abi' | 'eventName'> = {} as any
) {
  return useContractEvent({ abi: cartesiDappABI, eventName: 'NewConsensus', ...config } as UseContractEventConfig<
    typeof cartesiDappABI,
    'NewConsensus'
  >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link cartesiDappABI}__ and `eventName` set to `"VoucherExecuted"`.
 */
export function useCartesiDappVoucherExecutedEvent(
  config: Omit<UseContractEventConfig<typeof cartesiDappABI, 'VoucherExecuted'>, 'abi' | 'eventName'> = {} as any
) {
  return useContractEvent({ abi: cartesiDappABI, eventName: 'VoucherExecuted', ...config } as UseContractEventConfig<
    typeof cartesiDappABI,
    'VoucherExecuted'
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link cartesiInputBoxABI}__.
 */
export function useCartesiInputBoxRead<TFunctionName extends string, TSelectData = ReadContractResult<typeof cartesiInputBoxABI, TFunctionName>>(
  config: Omit<UseContractReadConfig<typeof cartesiInputBoxABI, TFunctionName, TSelectData>, 'abi'> = {} as any
) {
  return useContractRead({ abi: cartesiInputBoxABI, ...config } as UseContractReadConfig<typeof cartesiInputBoxABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link cartesiInputBoxABI}__ and `functionName` set to `"getInputHash"`.
 */
export function useCartesiInputBoxGetInputHash<
  TFunctionName extends 'getInputHash',
  TSelectData = ReadContractResult<typeof cartesiInputBoxABI, TFunctionName>
>(config: Omit<UseContractReadConfig<typeof cartesiInputBoxABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any) {
  return useContractRead({ abi: cartesiInputBoxABI, functionName: 'getInputHash', ...config } as UseContractReadConfig<
    typeof cartesiInputBoxABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link cartesiInputBoxABI}__ and `functionName` set to `"getNumberOfInputs"`.
 */
export function useCartesiInputBoxGetNumberOfInputs<
  TFunctionName extends 'getNumberOfInputs',
  TSelectData = ReadContractResult<typeof cartesiInputBoxABI, TFunctionName>
>(config: Omit<UseContractReadConfig<typeof cartesiInputBoxABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any) {
  return useContractRead({ abi: cartesiInputBoxABI, functionName: 'getNumberOfInputs', ...config } as UseContractReadConfig<
    typeof cartesiInputBoxABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link cartesiInputBoxABI}__.
 */
export function useCartesiInputBoxWrite<TFunctionName extends string, TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<PrepareWriteContractResult<typeof cartesiInputBoxABI, string>['request']['abi'], TFunctionName, TMode>
    : UseContractWriteConfig<typeof cartesiInputBoxABI, TFunctionName, TMode> & {
        abi?: never
      } = {} as any
) {
  return useContractWrite<typeof cartesiInputBoxABI, TFunctionName, TMode>({ abi: cartesiInputBoxABI, ...config } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link cartesiInputBoxABI}__ and `functionName` set to `"addInput"`.
 */
export function useCartesiInputBoxAddInput<TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<PrepareWriteContractResult<typeof cartesiInputBoxABI, 'addInput'>['request']['abi'], 'addInput', TMode> & {
        functionName?: 'addInput'
      }
    : UseContractWriteConfig<typeof cartesiInputBoxABI, 'addInput', TMode> & {
        abi?: never
        functionName?: 'addInput'
      } = {} as any
) {
  return useContractWrite<typeof cartesiInputBoxABI, 'addInput', TMode>({ abi: cartesiInputBoxABI, functionName: 'addInput', ...config } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link cartesiInputBoxABI}__.
 */
export function usePrepareCartesiInputBoxWrite<TFunctionName extends string>(
  config: Omit<UsePrepareContractWriteConfig<typeof cartesiInputBoxABI, TFunctionName>, 'abi'> = {} as any
) {
  return usePrepareContractWrite({ abi: cartesiInputBoxABI, ...config } as UsePrepareContractWriteConfig<typeof cartesiInputBoxABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link cartesiInputBoxABI}__ and `functionName` set to `"addInput"`.
 */
export function usePrepareCartesiInputBoxAddInput(
  config: Omit<UsePrepareContractWriteConfig<typeof cartesiInputBoxABI, 'addInput'>, 'abi' | 'functionName'> = {} as any
) {
  return usePrepareContractWrite({ abi: cartesiInputBoxABI, functionName: 'addInput', ...config } as UsePrepareContractWriteConfig<
    typeof cartesiInputBoxABI,
    'addInput'
  >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link cartesiInputBoxABI}__.
 */
export function useCartesiInputBoxEvent<TEventName extends string>(
  config: Omit<UseContractEventConfig<typeof cartesiInputBoxABI, TEventName>, 'abi'> = {} as any
) {
  return useContractEvent({ abi: cartesiInputBoxABI, ...config } as UseContractEventConfig<typeof cartesiInputBoxABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link cartesiInputBoxABI}__ and `eventName` set to `"InputAdded"`.
 */
export function useCartesiInputBoxInputAddedEvent(
  config: Omit<UseContractEventConfig<typeof cartesiInputBoxABI, 'InputAdded'>, 'abi' | 'eventName'> = {} as any
) {
  return useContractEvent({ abi: cartesiInputBoxABI, eventName: 'InputAdded', ...config } as UseContractEventConfig<
    typeof cartesiInputBoxABI,
    'InputAdded'
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link cartesiErc20PortalABI}__.
 */
export function useCartesiErc20PortalRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof cartesiErc20PortalABI, TFunctionName>
>(config: Omit<UseContractReadConfig<typeof cartesiErc20PortalABI, TFunctionName, TSelectData>, 'abi'> = {} as any) {
  return useContractRead({ abi: cartesiErc20PortalABI, ...config } as UseContractReadConfig<typeof cartesiErc20PortalABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link cartesiErc20PortalABI}__ and `functionName` set to `"getInputBox"`.
 */
export function useCartesiErc20PortalGetInputBox<
  TFunctionName extends 'getInputBox',
  TSelectData = ReadContractResult<typeof cartesiErc20PortalABI, TFunctionName>
>(config: Omit<UseContractReadConfig<typeof cartesiErc20PortalABI, TFunctionName, TSelectData>, 'abi' | 'functionName'> = {} as any) {
  return useContractRead({ abi: cartesiErc20PortalABI, functionName: 'getInputBox', ...config } as UseContractReadConfig<
    typeof cartesiErc20PortalABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link cartesiErc20PortalABI}__.
 */
export function useCartesiErc20PortalWrite<TFunctionName extends string, TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<PrepareWriteContractResult<typeof cartesiErc20PortalABI, string>['request']['abi'], TFunctionName, TMode>
    : UseContractWriteConfig<typeof cartesiErc20PortalABI, TFunctionName, TMode> & {
        abi?: never
      } = {} as any
) {
  return useContractWrite<typeof cartesiErc20PortalABI, TFunctionName, TMode>({ abi: cartesiErc20PortalABI, ...config } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link cartesiErc20PortalABI}__ and `functionName` set to `"depositERC20Tokens"`.
 */
export function useCartesiErc20PortalDepositErc20Tokens<TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof cartesiErc20PortalABI, 'depositERC20Tokens'>['request']['abi'],
        'depositERC20Tokens',
        TMode
      > & { functionName?: 'depositERC20Tokens' }
    : UseContractWriteConfig<typeof cartesiErc20PortalABI, 'depositERC20Tokens', TMode> & {
        abi?: never
        functionName?: 'depositERC20Tokens'
      } = {} as any
) {
  return useContractWrite<typeof cartesiErc20PortalABI, 'depositERC20Tokens', TMode>({
    abi: cartesiErc20PortalABI,
    functionName: 'depositERC20Tokens',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link cartesiErc20PortalABI}__.
 */
export function usePrepareCartesiErc20PortalWrite<TFunctionName extends string>(
  config: Omit<UsePrepareContractWriteConfig<typeof cartesiErc20PortalABI, TFunctionName>, 'abi'> = {} as any
) {
  return usePrepareContractWrite({ abi: cartesiErc20PortalABI, ...config } as UsePrepareContractWriteConfig<
    typeof cartesiErc20PortalABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link cartesiErc20PortalABI}__ and `functionName` set to `"depositERC20Tokens"`.
 */
export function usePrepareCartesiErc20PortalDepositErc20Tokens(
  config: Omit<UsePrepareContractWriteConfig<typeof cartesiErc20PortalABI, 'depositERC20Tokens'>, 'abi' | 'functionName'> = {} as any
) {
  return usePrepareContractWrite({ abi: cartesiErc20PortalABI, functionName: 'depositERC20Tokens', ...config } as UsePrepareContractWriteConfig<
    typeof cartesiErc20PortalABI,
    'depositERC20Tokens'
  >)
}
