"use client"

import { useState } from "react"
import { Copy, Edit, Trash2, ServerIcon, Database, Globe, HardDrive, Network } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import HostDetailsDialog from "./host-details-dialog"
import { deleteHost } from "@/lib/db"

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

interface HostCardProps {
  host: HostEntryProps
  groupId: string
  onDelete?: (id: string, category: string) => void
  onUpdate?: (updatedHost: HostEntryProps) => void
}

const HostCard = ({ host, groupId, onDelete, onUpdate }: HostCardProps) => {
  const [showDetails, setShowDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // 修改复制逻辑，使用 hostContent 字段
  const copyToClipboard = async () => {
    // 使用 hostContent 作为复制内容，如果是注释则使用 commentText
    const content = host.isComment ? host.commentText : host.hostContent

    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "已复制到剪贴板",
        description: content,
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法访问剪贴板",
        variant: "destructive",
      })
    }
  }

  // 处理删除主机
  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await deleteHost(host.category, String(host.id))

      toast({
        title: "删除成功",
        description: "主机条目已删除",
      })

      // 确保onDelete回调被调用，并传递正确的参数
      if (typeof onDelete === "function") {
        onDelete(String(host.id), host.category)
      }
    } catch (error) {
      console.error("Error deleting host:", error)
      toast({
        title: "删除失败",
        description: "无法删除主机条目",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "yyyy年MM月dd日")
  }

  const getTypeIcon = () => {
    switch (host.type) {
      case "frontend":
        return <Globe className="h-4 w-4" />
      case "backend":
        return <ServerIcon className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      case "cache":
        return <HardDrive className="h-4 w-4" />
      default:
        return <Network className="h-4 w-4" />
    }
  }

  const getTypeColor = () => {
    switch (host.type) {
      case "frontend":
        return "bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
      case "backend":
        return "bg-purple-500/10 text-purple-500 border-purple-200 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400"
      case "database":
        return "bg-green-500/10 text-green-500 border-green-200 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
      case "cache":
        return "bg-amber-500/10 text-amber-500 border-amber-200 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-200 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-400"
    }
  }

  // 生成随机颜色
  const getRandomColor = () => {
    if (host.color) return host.color

    // 生成随机HSL颜色，保持饱和度和亮度适中
    const h = Math.floor(Math.random() * 360)
    const s = 70
    const l = 90
    return `hsl(${h}, ${s}%, ${l}%)`
  }

  // 获取标题的首字母
  const getTitleInitial = () => {
    if (!host.title) return "?"
    return host.title.charAt(0).toUpperCase()
  }

  // 如果是注释行，显示不同的卡片样式
  if (host.isComment) {
    return (
      <Card className="border-dashed bg-muted/30">
        <CardContent className="p-4">
          <div className="font-mono text-sm text-muted-foreground">{host.commentText}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-md dark:hover:shadow-primary/5">
        <CardContent className="p-3">
          <div className="mb-2 flex items-center gap-2">
            {/* 标题图标/首字母 */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-base font-semibold text-gray-700 dark:text-gray-300"
              style={{ backgroundColor: getRandomColor() }}
            >
              {host.image ? (
                <img
                  src={host.image || "/placeholder.svg"}
                  alt={host.title}
                  className="h-full w-full rounded-md object-cover"
                />
              ) : (
                getTitleInitial()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium truncate" title={host.title}>
                  {host.title}
                </h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(host.lastUpdated)}</span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium">
                  {host.category}
                </Badge>

                {host.type && (
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                      getTypeColor(),
                    )}
                  >
                    {getTypeIcon()}
                    <span>
                      {host.type === "frontend"
                        ? "前端"
                        : host.type === "backend"
                          ? "后端"
                          : host.type === "database"
                            ? "数据库"
                            : host.type === "cache"
                              ? "缓存"
                              : "其他"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {host.description && (
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2" title={host.description}>
              {host.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex justify-between gap-1 border-t bg-muted/10 p-1.5">
          <Button variant="ghost" size="sm" onClick={() => setShowDetails(true)} className="flex-1 h-8 text-xs">
            <Edit className="mr-1 h-3.5 w-3.5" />
            编辑
          </Button>
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="flex-1 h-8 text-xs">
            <Copy className="mr-1 h-3.5 w-3.5" />
            复制
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {isDeleting ? "删除中..." : "删除"}
          </Button>
        </CardFooter>
      </Card>

      <HostDetailsDialog
        host={host}
        open={showDetails}
        onOpenChange={setShowDetails}
        onHostUpdated={(updatedHost) => {
          // 更新本地状态
          if (onUpdate) {
            onUpdate(updatedHost)
          }
        }}
      />
    </>
  )
}

export default HostCard
