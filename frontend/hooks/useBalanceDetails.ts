import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'

export interface BalanceDetails {
  [token: string]: {
    balance: string
    streams: {
      [streamId: string]: {
        amount: string
        start: number
        duration: number
        from: string
        to: string
        dir: [string, string]
        parent_id?: string
      }
    }
  }
}

export interface StreamInformation {
  from: string
  to: string
  dir: [string, string]
  start: number
  end: number
  amount: bigint
  ratio: bigint
}

export interface TokenInformation {
  balance: bigint
  streams: StreamInformation[]
}

export const useBalanceDetails = (tokens: string[]) => {
  const { address } = useAccount()
  const [data, setData] = useState<BalanceDetails>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const details: { [token: string]: any } = {}
        for (const token of tokens) {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_CARTESI_INSPECT_SERVER || ''}inspect/balance_details`, {
            params: {
              token: token,
              wallet: address,
            },
          })

          details[token] = JSON.parse(ethers.toUtf8String(response.data.reports[0].payload))
        }

        setData(details)

        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Set up the interval to refresh the balance every 5 seconds
    const intervalId = setInterval(fetchData, 30000)

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId)
    }
  }, [address, tokens])

  return { data, loading, error }
}
