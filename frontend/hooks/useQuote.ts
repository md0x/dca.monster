import axios from 'axios'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

export const useQuote = (token_in: string, token_out: string, amount_in: string) => {
  const { address } = useAccount()
  const [data, setData] = useState<string>("0")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getTimestamp = async () => {
    const providerUrl = (window as any).ethereum?.currentProvider?.host

    if (providerUrl) {
      const ethersProvider = new ethers.JsonRpcProvider(providerUrl)
      const blockNumber = await ethersProvider.getBlockNumber()
      const block = await ethersProvider.getBlock(blockNumber)
      return block?.timestamp || Math.floor(Date.now() / 1000)
    }
    return Math.floor(Date.now() / 1000)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_CARTESI_INSPECT_SERVER || ''}inspect/quote`, {
          params: {
            amount_in,
            token_in,
            token_out,
            timestamp: await getTimestamp(),
          },
        })
        try {
          setData(ethers.toUtf8String(response.data.reports[0].payload))
          console.log(ethers.toUtf8String(response.data.reports[0].payload))
        } catch (err: any) {
          setData('0')
        }

        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()
  }, [address, token_in, token_out, amount_in])

  return { data, loading, error }
}
