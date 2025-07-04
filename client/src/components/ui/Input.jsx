import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ 
  className, 
  type, 
  variant = "default",
  size = "default",
  leftIcon,
  rightIcon,
  error,
  ...props 
}, ref) => {
  const inputVariants = {
    default: "border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500",
    filled: "border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white",
    outline: "border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500",
    glass: "border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20",
  }
  
  const sizeVariants = {
    default: "h-10 px-3 py-2 text-sm",
    sm: "h-8 px-2 py-1 text-xs",
    lg: "h-12 px-4 py-3 text-base",
  }
  
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        className={cn(
          "flex w-full rounded-lg text-sm ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          inputVariants[variant],
          sizeVariants[size],
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
