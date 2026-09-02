"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

const THEMES = [
  { value: "light", label: "浅色", icon: Sun },
  { value: "dark", label: "深色", icon: Moon },
  { value: "system", label: "跟随系统", icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const current =
    THEMES.find((t) => t.value === (mounted ? theme : "system")) ?? THEMES[2]

  const cycle = () => {
    const idx = THEMES.findIndex((t) => t.value === current.value)
    setTheme(THEMES[(idx + 1) % THEMES.length].value)
  }

  const Icon = current.icon

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label="切换主题"
      title={current.label}
    >
      <Icon className="size-4" />
    </Button>
  )
}
