"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Server, Settings, Menu, LogOut, Moon, Sun, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { useMobile } from "../hooks/use-mobile"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 防止水合不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  const routes = [
    {
      title: "首页",
      href: "/dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      title: "系统设置",
      href: "/dashboard/settings",
      icon: Settings,
      active: pathname === "/dashboard/settings",
    },
  ]

  const handleLogout = () => {
    router.push("/login")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const SidebarContent = (
    <>
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Server className="h-5 w-5" />
          </div>
          <span className="text-xl">Hosts 管理</span>
        </Link>
      </div>

      <div className="flex h-full flex-col">
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {routes.map((route) => (
              <Link key={route.href} href={route.href} onClick={() => setOpen(false)}>
                <Button
                  variant={route.active ? "default" : "ghost"}
                  className={cn("w-full justify-start transition-colors", route.active ? "" : "hover:bg-muted")}
                >
                  <route.icon className="mr-2 h-5 w-5" />
                  {route.title}
                </Button>
              </Link>
            ))}
          </nav>
        </ScrollArea>

        <div className="mt-auto border-t p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">主题</span>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32&text=A" alt="Admin" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">管理员</span>
                    <span className="text-xs text-muted-foreground">admin@example.com</span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>我的账号</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>账号设置</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )

  // 移动端使用抽屉组件
  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex h-full w-full flex-col">{SidebarContent}</div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return <div className={cn("flex h-full w-64 flex-col border-r", className)}>{SidebarContent}</div>
}
