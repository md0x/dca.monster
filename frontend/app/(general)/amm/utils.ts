import { ethers } from 'ethers'
import addresses from '@/addresses.json'

const hexlify = (text: string) => ethers.hexlify(ethers.toUtf8Bytes(text)) as `0x${string}`

export const getUnrawpBody = (token: string, amount: bigint): `0x${string}` =>
  hexlify(JSON.stringify({ method: 'unwrap', args: { token, amount: amount.toString() } }))

export const getSwapBody = (
  amountIn: bigint,
  amountOutMin: bigint,
  path: [string, string],
  duration: number,
  start: number,
  to: string
): `0x${string}` =>
  hexlify(
    JSON.stringify({
      method: 'swap',
      args: {
        amount_in: amountIn.toString(),
        amount_out_min: amountOutMin.toString(),
        path,
        duration,
        start,
        to,
      },
    })
  )

export const getCancelBody = (token: string, parent_id?: string, stream_id?: string): `0x${string}` =>
  hexlify(
    JSON.stringify({
      method: 'cancel_stream',
      args: {
        token,
        parent_id,
        stream_id,
      },
    })
  )

export const getCartesiAddresses = (
  chainId: number
): {
  erc20Portal: string
  inputBox: string
  dapp: string
} => {
  const def = {
    erc20Portal: ethers.ZeroAddress,
    inputBox: ethers.ZeroAddress,
    dapp: ethers.ZeroAddress,
  }
  return Object.keys(addresses).includes(chainId.toString()) ? addresses[chainId.toString() as keyof typeof addresses] : def
}
