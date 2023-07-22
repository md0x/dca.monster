import { useEffect, useState } from 'react'

import { useAccount } from 'wagmi'

export const useTime = () => {
  const { address } = useAccount()
  const [data, setData] = useState<number>(Math.floor(Date.now() / 1000))

  useEffect(() => {
    const fetchData = async () => {
      setData(Math.floor(Date.now() / 1000))
    }

    fetchData()

    const interval = setInterval(() => {
      fetchData()
    }, 500)

    return () => {
      clearInterval(interval)
    }
  }, [address])

  return { data }
}
