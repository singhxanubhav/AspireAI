"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Checkbox>) {
  return (
    <CheckboxPrimitive.Checkbox
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-sm border border-input ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary data-[state=checked]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.CheckboxIndicator
        data-slot="checkbox-indicator"
        className={cn("flex items-center justify-center text-current")}
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.CheckboxIndicator>
    </CheckboxPrimitive.Checkbox>
  )
}

export { Checkbox }
