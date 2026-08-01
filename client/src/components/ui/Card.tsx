import type { HTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  as?: 'div'
  animated?: boolean
  delay?: number
}

export const Card = ({
  children,
  className = '',
  hover = true,
  animated = false,
  delay = 0,
  ...props
}: CardProps) => {
  const classes = `glass-card rounded-2xl transition-all duration-300 ${
    hover ? 'hover:border-white/[0.16] hover:-translate-y-0.5' : ''
  } ${className}`

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
        className={classes}
        {...(props as any)}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default Card
