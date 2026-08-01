import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode
  rightElement?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightElement, className = '', ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full bg-white/[0.04] text-white placeholder-gray-500 rounded-xl border border-white/10 outline-none transition-all duration-200 focus-ring ${
            leftIcon ? 'pl-10' : 'pl-4'
          } ${rightElement ? 'pr-11' : 'pr-4'} py-3 text-sm ${className}`}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full bg-white/[0.04] text-white placeholder-gray-500 rounded-xl border border-white/10 outline-none transition-all duration-200 focus-ring px-4 py-3 text-sm resize-none ${className}`}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export const Label = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <label className={`text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 ${className}`}>
    {children}
  </label>
)

export default Input
