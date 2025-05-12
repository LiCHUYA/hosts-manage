"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("123456")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      toast({
        title: "错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // 模拟登录过程
    setTimeout(() => {
      setIsLoading(false)

      // 简单验证 - 在实际应用中应该连接到后端验证
      if (username === "admin" && password === "123456") {
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "登录失败",
          description: "用户名或密码不正确",
          variant: "destructive",
        })
      }
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Server className="h-5 w-5" />
          </div>
          <span>Hosts 管理系统</span>
        </div>
      </div>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>输入您的用户名和密码登录系统</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                  忘记密码?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="text-sm font-normal">
                记住我
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">默认账号: admin / 123456</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <span className="text-sm text-muted-foreground">
            还没有账号?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              注册
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}
