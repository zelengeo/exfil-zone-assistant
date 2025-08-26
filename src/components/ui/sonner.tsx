"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
          classNames: {
              toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
              description: "group-[.toast]:text-muted-foreground",
              actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
              cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
              // Custom styles for different toast types
              //FIXME - remove !important - look for the correct way to do this
              success: "group-[.toaster]:!bg-olive-600/60 group-[.toaster]:!text-tan-100 group-[.toaster]:!border-olive-500",
              error: "group-[.toaster]:!bg-destructive/60 group-[.toaster]:!text-destructive-foreground group-[.toaster]:!border-destructive",
              warning: "group-[.toaster]:!bg-orange-600/60 group-[.toaster]:!text-tan-100 group-[.toaster]:!border-orange-500",
              info: "group-[.toaster]:!bg-military-700/60 group-[.toaster]:!text-tan-100 group-[.toaster]:!border-military-600",
          },
      }}
      {...props}
    />
  )
}

export { Toaster }
