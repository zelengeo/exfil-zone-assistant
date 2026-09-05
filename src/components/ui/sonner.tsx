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
              success: "group-[.toaster]:!bg-steel-800 group-[.toaster]:!text-ink-100 group-[.toaster]:!border-good/50",
              error: "group-[.toaster]:!bg-steel-800 group-[.toaster]:!text-ink-100 group-[.toaster]:!border-bad/50",
              warning: "group-[.toaster]:!bg-steel-800 group-[.toaster]:!text-ink-100 group-[.toaster]:!border-warn/50",
              info: "group-[.toaster]:!bg-steel-800 group-[.toaster]:!text-ink-100 group-[.toaster]:!border-line-600",
          },
      }}
      {...props}
    />
  )
}

export { Toaster }
