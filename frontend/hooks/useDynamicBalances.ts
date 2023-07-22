import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { BalanceDetails } from './useBalanceDetails'

export interface StreamInformation {
  id: string
  from: string
  to: string
  dir: [string, string]
  start: number
  end: number
  amount: bigint
  ratio: bigint
  parent_id?: string
  ids: string[]
}

export interface TokenInformation {
  balance: bigint
  streams: StreamInformation[]
}

export const getStreams = (details: BalanceDetails, token: string, wallet: string, _timestamp?: number): TokenInformation => {
  const streams: StreamInformation[] = []

  let timestamp = Math.floor(Date.now() / 1000)
  if (_timestamp) {
    timestamp = _timestamp
  }

  // Retrieve the streams for the token
  const tokenDetails = details[token]
  if (!tokenDetails) return { balance: BigInt(0), streams: [] }

  // Get the stream keys, these are the streamIds
  const streamKeys = Object.keys(tokenDetails.streams)

  // Sort the stream keys by start time
  streamKeys.sort((a, b) => tokenDetails.streams[a].start - tokenDetails.streams[b].start)

  // Process the streams
  for (let i = 0; i < streamKeys.length; i++) {
    const currentStream = tokenDetails.streams[streamKeys[i]]

    // Check if the stream is related to the wallet
    if (currentStream.from === wallet || currentStream.to === wallet) {
      // If it's the first stream or if it's not consecutive to the last one or has a different from or to or dir,
      // start a new stream
      const previousStream = streams.find(
        (stream) => stream.parent_id && stream.parent_id === currentStream.parent_id && stream.end === currentStream.start
      )
      if (!previousStream) {
        streams.push({
          id: streamKeys[i],
          start: currentStream.start,
          end: currentStream.start + currentStream.duration,
          amount: BigInt(currentStream.amount),
          ratio: currentStream.duration == 0 ? BigInt(currentStream.amount) : BigInt(currentStream.amount) / BigInt(currentStream.duration),
          from: currentStream.from,
          to: currentStream.to,
          dir: currentStream.dir,
          parent_id: currentStream.parent_id,
          ids: [streamKeys[i]],
        })
      } else {
        const newEnd = currentStream.start + currentStream.duration
        const duration = newEnd - previousStream.start
        const newAmount = previousStream.amount + BigInt(currentStream.amount)
        previousStream.end = newEnd
        previousStream.amount = newAmount
        previousStream.ratio = duration == 0 ? newAmount : newAmount / BigInt(duration)
        previousStream.ids.push(streamKeys[i])
      }
    }
  }

  let balance = BigInt(tokenDetails.balance)
  // Calculate the balance at the provided timestamp as the sum of the balance and streams in minus streams out
  const streamsIn = streams.filter((stream) => stream.to === wallet)
  const streamsOut = streams.filter((stream) => stream.from === wallet)

  const reduceStreams = (streams: StreamInformation[]) => {
    return streams.reduce((total, stream) => {
      const duration = stream.end - stream.start
      const ellapsed = timestamp >= stream.end ? duration : timestamp - stream.start
      const amount = duration != 0 ? (BigInt(stream.amount) * BigInt(ellapsed)) / BigInt(duration) : BigInt(stream.amount)
      return total + amount
    }, BigInt(0))
  }
  const streamsInAmount = reduceStreams(streamsIn)
  const streamsOutAmount = reduceStreams(streamsOut)
  balance += streamsInAmount - streamsOutAmount

  return {
    balance,
    streams,
  }
}

export const useDynamicBalances = (details: BalanceDetails, token: string) => {
  const { address } = useAccount()
  const [data, setData] = useState<TokenInformation>({ balance: BigInt(0), streams: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData(getStreams(details, token, address as string))

        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Set up the interval to refresh the balance every sec
    const intervalId = setInterval(fetchData, 1000)

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId)
    }
  }, [address, details, token])

  return { data, loading, error }
}
