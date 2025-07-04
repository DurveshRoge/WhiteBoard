import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const cardVariants = {
    default: "rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200",
    elevated: "rounded-xl border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1",
    glass: "rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg",
    gradient: "rounded-xl border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg",
    premium: "rounded-xl border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-lg hover:shadow-xl transition-all duration-200",
  }
  
  return (
    <div
      ref={ref}
      className={cn(cardVariants[variant], className)}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
