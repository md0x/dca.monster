# DCA.Monster: Decentralized Dollar Cost Averaging

## Overview

DCA.Monster is an innovative Automated Market Maker (AMM) that uses ERC20 streams to do on-chain, efficient, and granular dollar-cost averaging (DCA). Our goal is to make sophisticated on-chain DCA more accessible to users by developing a novel AMM type "on steroids" based on Uniswap V2 and smoothly integrating it with "Token streaming." By combining these powerful concepts, users can perform "Infinite Granularity DCA" in our platform by being exposed to all potential price ranges of a token pair, resulting in a more dynamic and powerful DCA experience.

## Quick Start

### Demo

https://dca-monster.vercel.app/

### Deployment and Integration

Existing deployments:

- [Gnosis-Chiado](https://gnosis-chiado.blockscout.com/address/0x642f78B3E07DcE580f188c057C390D9BB7744E18)

Deployment in Gnosis Chiado:

```
cd cartesi-dapp
make deploy-gnosis-chiado
```

Run gnosis Chidao Cartesi node:

```
make run-chidao
```

Run the frontend:

```
cd frontend
pnpm install
pnpm run dev
```
Run Cartesi locally in prod mode:
```
make dev
```
Run Cartesi in host mode:
In one terminal:

```
cd cartesi-dapp
make host
```

In another terminal:

```
cd cartesi-dapp
make host-python
```

More details of how to run Cartesi rollup can be found [here](cartesi-dapp/README.md).

## Project Description

### Introduction

While on-chain DCA solutions do exist, they are uncommon and frequently accompanied by an array of difficulties. DCA.Monster was created to address these issues by developing a new AMM based on Uniswap V2 that seamlessly combines with Streamable tokens and runs a Cartesi rollup.

### Problem Statement

Current on-chain DCA solutions suffer from:

- Dependence on third-party bots or keepers to execute transactions
- Capital inefficiency as it remains locked in smart contracts between transactions
- Inability to integrate with DEXs
- Gas inefficiency
- Lack of granularity in price range
- Lack of flexibility in time range

### Our Solution: DCA.Monster

DCA.Monster AMM merges with ERC20 streams to efficiently and with infinite granularity implement DCA on-chain. It optimizes capital and gas usage, integrates with DEXs, and provides both granular pricing and flexible timing.

Without Cartesi's rollups technology, such an implementation would be computationally expensive due to the complex calculations required for AMM streams recalculations. However, Cartesi's rollups enable us to perform these computations off-chain on any device, with the results verified on-chain.

## Implementation Details

Our implementation consists of both a frontend and a dApp/backend:

- Dapp/backend:
  - AMM based on Uniswap V2 written in python combined with Streamable tokens also written in python that combine seamlessly with the AMM to create a DCA experience see [here](./cartesi-dapp) for more details.
  - Built upon the [Cartesi dapp rollups-examples custom dapp starter](https://github.com/cartesi/rollups-examples/tree/main/custom-dapps)
  - Uses RISC-V base Docker images to install Python dependencies
  - Ready for "prod" mode operation
- Frontend:

  - Utilizes the [template-web3-app](https://github.com/turbo-eth/template-web3-app) from TurboETH that incorporates:
    - Rainbow kit for wallet connection: Metamask, WalletConnect, Portis, Torus, Authereum, Fortmatic, and Squarelink
    - Next JS for frontend framework
    - Tailwind CSS for styling
    - Web3 React for Ethereum JavaScript API
    - Wagmi and RainbowKit for additional functionality
