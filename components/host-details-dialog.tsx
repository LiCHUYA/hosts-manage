"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Copy, ExternalLink, Calendar, Server, Globe, Database, HardDrive, Network } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateHost, updateHostGroup, getCategories } from "@/lib/db"

interface HostEntryProps {
  id: string | number
  ip: string
  domain: string
  title: string
  category: string
  type?: "frontend" | "backend" | "database" | "cache" | "other"
  description?: string
  lastUpdated: string
  isComment?: boolean
  commentText?: string
  image?: string
  color?: string
  hostContent?: string
}

interface HostDetailsDialogProps {
  host: HostEntryProps
  open: boolean
  onOpenChange: (open: boolean) => void
  onHostUpdated?: (updatedHost: HostEntryProps) => void
}

export default function HostDetailsDialog({ host, open, onOpenChange, onHostUpdated }: HostDetailsDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    hostContent: "",
    category: "",
    type: "other",
    description: "",
  })
  const [categories, setCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [originalCategory, setOriginalCategory] = useState("")

  // 获取所有分类
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    if (open) {
      fetchCategories()
    }
  }, [open])

  // 确保初始化时正确设置表单数据
  useEffect(() => {
    if (host && open) {
      setFormData({
        title: host.title || "",
        hostContent: host.hostContent || `${host.ip} ${host.domain}`,
        category: host.category || "",
        type: host.type || "other",
        description: host.description || "",
      })
      setOriginalCategory(host.category || "")
      setIsSubmitting(false)
    }
  }, [host, open])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "yyyy年MM月dd日 HH:mm")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) {
      return // 防止重复提交
    }

    setIsSubmitting(true)
    try {
      let updatedHosts
      const newCategory = formData.category

      if (host.isComment) {
        // 更新注释
        updatedHosts = await updateHostGroup(originalCategory, {
          commentText: formData.hostContent,
          category: newCategory,
        })
      } else {
        // 更新主机信息
        updatedHosts = await updateHost(originalCategory, String(host.id), {
          hostContent: formData.hostContent,
          title: formData.title,
          category: newCategory,
          type: formData.type as any,
          description: formData.description,
        })
      }

      // 从返回的主机组数组中找到更新后的主机信息
      const updatedGroup = updatedHosts.find((g) => g.category === newCategory)

      if (!updatedGroup) {
        throw new Error("无法找到更新后的主机组")
      }

      let updatedHostData

      if (host.isComment) {
        updatedHostData = updatedGroup
      } else {
        // 如果更改了部门，需要在新部门中查找主机
        if (originalCategory !== newCategory) {
          updatedHostData = updatedGroup.children?.find(
            (h) => h.title === formData.title && h.hostContent === formData.hostContent,
          )
        } else {
          updatedHostData = updatedGroup.children?.find((h) => String(h.id) === String(host.id))
        }

        if (!updatedHostData) {
          // 如果在新分类中找不到，可能是因为分类已更改，尝试构建更新后的数据
          updatedHostData = {
            ...host,
            title: formData.title,
            category: newCategory,
            type: formData.type,
            description: formData.description,
            hostContent: formData.hostContent,
            lastUpdated: new Date().toISOString(),
          }
        }
      }

      // 调用回调函数更新父组件状态
      if (onHostUpdated && updatedHostData) {
        onHostUpdated({
          ...updatedHostData,
          category: newCategory, // 确保分类信息正确传递
        })
      }

      toast({
        title: "保存成功",
        description: "Hosts 条目已更新",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating host:", error)
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "无法更新 Hosts 条目",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTestDomain = () => {
    if (host.isComment) return
    window.open(`https://${host.domain}`, "_blank")
  }

  // 修改复制功能，使用hostContent
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formData.hostContent)
    toast({
      title: "已复制到剪贴板",
      description: formData.hostContent,
    })
  }

  const getTypeIcon = () => {
    switch (formData.type) {
      case "frontend":
        return <Globe className="h-5 w-5" />
      case "backend":
        return <Server className="h-5 w-5" />
      case "database":
        return <Database className="h-5 w-5" />
      case "cache":
        return <HardDrive className="h-5 w-5" />
      default:
        return <Network className="h-5 w-5" />
    }
  }

  const getTypeColor = () => {
    switch (formData.type) {
      case "frontend":
        return "bg-blue-500 text-white"
      case "backend":
        return "bg-purple-500 text-white"
      case "database":
        return "bg-green-500 text-white"
      case "cache":
        return "bg-amber-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>编辑 Hosts 条目</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">{host.isComment ? "注释" : formData.title}</h2>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>更新于 {formatDate(host.lastUpdated)}</span>
              </div>
            </div>

            {!host.isComment && (
              <div className="ml-auto">
                <div className={cn("flex h-8 items-center gap-1 rounded-full px-3", getTypeColor())}>
                  {getTypeIcon()}
                  <span className="font-medium">
                    {formData.type === "frontend"
                      ? "前端"
                      : formData.type === "backend"
                        ? "后端"
                        : formData.type === "database"
                          ? "数据库"
                          : formData.type === "cache"
                            ? "缓存"
                            : "其他"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!host.isComment && (
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="输入标题"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="hostContent">{host.isComment ? "注释内容" : "Hosts 条目"}</Label>
              <Textarea
                id="hostContent"
                name="hostContent"
                value={formData.hostContent}
                onChange={handleChange}
                className="font-mono min-h-[150px]"
                required
              />
              {!host.isComment && (
                <p className="text-xs text-muted-foreground">格式：IP地址 域名，每行一个条目，支持 # 开头的注释行</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">部门</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择部门" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 使用动态获取的分类列表，确保每个选项有唯一的key */}
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!host.isComment && (
                <div className="space-y-2">
                  <Label htmlFor="type">类型</Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">前端</SelectItem>
                      <SelectItem value="backend">后端</SelectItem>
                      <SelectItem value="database">数据库</SelectItem>
                      <SelectItem value="cache">缓存</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {!host.isComment && (
              <div className="space-y-2">
                <Label htmlFor="description">描述（可选）</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="添加描述信息..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                复制条目
              </Button>
              {!host.isComment && (
                <Button type="button" variant="outline" className="flex-1" onClick={handleTestDomain}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  测试域名
                </Button>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存更改"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
