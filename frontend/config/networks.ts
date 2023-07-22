// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Networks
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
import { Chain, configureChains } from 'wagmi'
import {
  gnosisChiado as gnosisChiadoNoIcon,
  goerli as goerliNoIcon,
  hardhat,
  mainnet,
  polygonMumbai,
} from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'

import { env } from '@/env.mjs'

const goerli = {
  ...goerliNoIcon,
  iconUrl: '/icons/NetworkEthereumTest.svg',
}
const gnosisChiado = {
  ...gnosisChiadoNoIcon,
  iconUrl: '/icons/NetworkGnosis.svg',
}

export const ETH_CHAINS_TEST = [gnosisChiado, hardhat]
export const ETH_CHAINS_PROD = [mainnet]
export const ETH_CHAINS_DEV = env.NEXT_PUBLIC_PROD_NETWORKS_DEV === 'true' ? [...ETH_CHAINS_PROD, ...ETH_CHAINS_TEST] : ETH_CHAINS_TEST

export const CHAINS: Chain[] = process.env.NODE_ENV === 'production' ? ETH_CHAINS_PROD : ETH_CHAINS_DEV

const PROVIDERS = []

if (env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
  if (!env.NEXT_PUBLIC_ALCHEMY_API_KEY) throw new Error('NEXT_PUBLIC_ALCHEMY_API_KEY is not defined')
  PROVIDERS.push(
    alchemyProvider({
      apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    })
  )
}

if (env.NEXT_PUBLIC_INFURA_API_KEY) {
  if (!env.NEXT_PUBLIC_INFURA_API_KEY) throw new Error('NEXT_PUBLIC_INFURA_API_KEY is not defined')
  PROVIDERS.push(
    infuraProvider({
      apiKey: env.NEXT_PUBLIC_INFURA_API_KEY,
    })
  )
}

// Fallback to public provider
// Only include public provider if no other providers are available.
if (PROVIDERS.length === 0 || env.NEXT_PUBLIC_USE_PUBLIC_PROVIDER === 'true') {
  PROVIDERS.push(publicProvider())
}

export const { chains, publicClient, webSocketPublicClient } = configureChains(CHAINS, PROVIDERS)
