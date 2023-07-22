'use client'

import { motion } from 'framer-motion'

import { FADE_DOWN_ANIMATION_VARIANTS } from '@/config/design'
import { Swap } from './amm/swap'

export default function Home() {
  return (
    <>
      <div className="relative flex flex-1">
        <div className="flex-center flex h-full flex-1 flex-col items-center justify-center text-center">
          <motion.div
            animate="show"
            className="max-w-3xl px-5 xl:px-0 relative"
            initial="hidden"
            viewport={{ once: true }}
            whileInView="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}>
            <img alt="Turbo ETH" className="mx-auto mb-2 h-20 w-20" src="/logo-fill.png" />
            <motion.h1
              className="bg-gradient-to-br from-black to-stone-500 bg-clip-text text-center text-4xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm dark:from-stone-100 dark:to-yellow-200 md:text-3xl md:leading-[2rem]"
              variants={FADE_DOWN_ANIMATION_VARIANTS}>
              <span>DCA.MONSTER</span>
            </motion.h1>
          </motion.div>

          <div className="mt-10 w-[600px]">
            <motion.div
              animate="show"
              className="my-10"
              initial="hidden"
              viewport={{ once: true }}
              whileInView="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    delayChildren: 0.5,
                    staggerChildren: 0.15,
                  },
                },
              }}>

              <Swap />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
