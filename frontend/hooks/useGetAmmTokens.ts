import { useEffect, useState } from 'react'

import axios from 'axios'
import { ethers } from 'ethers'

export const useGetAmmTokens = () => {
  const [data, setData] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_CARTESI_INSPECT_SERVER || ''}inspect/tokens`)
        setData(JSON.parse(ethers.toUtf8String(response.data.reports[0].payload)))
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
