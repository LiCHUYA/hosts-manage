"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { addHostGroup, getHosts, updateHostGroup } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

interface AddHostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onHostAdded: (hosts: any[]) => void
  categories: string[]
}

export default function AddHostDialog({ open, onOpenChange, onHostAdded, categories }: AddHostDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    batchEntries: "",
    category: "",
    type: "frontend",
    description: "",
    id: uuidv4(),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateBatchEntries = () => {
    if (!formData.batchEntries.trim()) return "条目不能为空"
    if (!formData.category) return "部门不能为空"
    if (!formData.title) return "标题不能为空"
    return null
  }

  // 修改添加主机的逻辑，适应新的数据结构
  // 使用防抖处理提交操作
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) {
      return // 如果正在提交，则直接返回
    }

    const error = validateBatchEntries()

    if (error) {
      toast({
        title: "验证错误",
        description: error,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 将整个批量输入作为一个完整的hosts文本存储
      const newHost = {
        id: uuidv4(),
        hostContent: formData.batchEntries,
        title: formData.title,
        category: formData.category,
        type: formData.type,
        description: formData.description,
        lastUpdated: new Date().toISOString(),
        isComment: false,
      }

      // 获取现有的主机组
      const groups = await getHosts()
      const targetGroup = groups.find((g) => g.category == formData.category)

      if (targetGroup) {
        // 如果已存在该分类的组，则添加到该组
        targetGroup.children.push(newHost)
        await updateHostGroup(targetGroup.category, targetGroup)
        onHostAdded([newHost])
      } else {
        // 如果不存在该分类的组，则创建新组
        const newGroups = await addHostGroup({
          category: newHost.category,
          isGroup: true,
          children: [newHost],
        })
        const lastGroup = newGroups[newGroups.length - 1]
        const addedHost = lastGroup?.children?.[0] || newHost
        onHostAdded([addedHost])
      }

      toast({
        title: "添加成功",
        description: "Hosts 条目已添加",
      })

      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding hosts:", error)
      toast({
        title: "添加失败",
        description: "无法添加 Hosts 条目",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      batchEntries: "",
      category: "",
      type: "frontend",
      description: "",
      id: uuidv4(),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>添加 Hosts 条目</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              name="title"
              placeholder="例如：孩子王测试环境"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchEntries">批量 Hosts 条目 *</Label>
            <Textarea
              id="batchEntries"
              name="batchEntries"
              placeholder="# 加盟 测试 host
172.172.178.9 test.hzwjx.cn
172.172.178.9 hzwjx.cn
# 172.172.178.9 test.hzwjxweb.cn
172.172.178.93 www.hzwjx.cn
172.172.178.10 st.haiziwang.com
172.172.178.9 test.verifycode.haiziwang.com"
              value={formData.batchEntries}
              onChange={handleChange}
              className="font-mono min-h-[200px]"
              required
            />
            <p className="text-xs text-muted-foreground">每行一个条目，格式：IP地址 域名，支持 # 开头的注释行</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">部门 *</Label>
              <Input
                id="category"
                name="category"
                placeholder="例如：孩子王、创纪云"
                value={formData.category}
                onChange={handleChange}
                list="category-options-multi"
                required
              />
              <datalist id="category-options-multi">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述（可选）</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="添加描述信息..."
              value={formData.description}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "添加中..." : "添加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
