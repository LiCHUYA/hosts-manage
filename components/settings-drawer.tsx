"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: string[]
  types: string[]
  onCategoriesChange: (categories: string[]) => void
  onTypesChange: (types: string[]) => void
}

export default function SettingsDrawer({
  open,
  onOpenChange,
  categories,
  types,
  onCategoriesChange,
  onTypesChange,
}: SettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState("categories")
  const [newCategory, setNewCategory] = useState("")
  const [newType, setNewType] = useState("")
  const [editItem, setEditItem] = useState<{ id: string; value: string } | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: "category" | "type"; value: string } | null>(null)

  const { toast } = useToast()

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "错误",
        description: "部门名称不能为空",
        variant: "destructive",
      })
      return
    }

    if (categories.includes(newCategory)) {
      toast({
        title: "错误",
        description: "部门名称已存在",
        variant: "destructive",
      })
      return
    }

    const updatedCategories = [...categories, newCategory]
    onCategoriesChange(updatedCategories)
    setNewCategory("")

    toast({
      title: "成功",
      description: `已添加部门: ${newCategory}`,
    })
  }

  const handleAddType = () => {
    if (!newType.trim()) {
      toast({
        title: "错误",
        description: "类型名称不能为空",
        variant: "destructive",
      })
      return
    }

    if (types.includes(newType)) {
      toast({
        title: "错误",
        description: "类型名称已存在",
        variant: "destructive",
      })
      return
    }

    const updatedTypes = [...types, newType]
    onTypesChange(updatedTypes)
    setNewType("")

    toast({
      title: "成功",
      description: `已添加类型: ${newType}`,
    })
  }

  const handleEditItem = () => {
    if (!editItem) return

    if (!editItem.value.trim()) {
      toast({
        title: "错误",
        description: "名称不能为空",
        variant: "destructive",
      })
      return
    }

    if (editItem.id.startsWith("category-")) {
      const categoryIndex = Number.parseInt(editItem.id.replace("category-", ""))
      const updatedCategories = [...categories]
      updatedCategories[categoryIndex] = editItem.value
      onCategoriesChange(updatedCategories)

      toast({
        title: "成功",
        description: `已更新部门名称`,
      })
    } else if (editItem.id.startsWith("type-")) {
      const typeIndex = Number.parseInt(editItem.id.replace("type-", ""))
      const updatedTypes = [...types]
      updatedTypes[typeIndex] = editItem.value
      onTypesChange(updatedTypes)

      toast({
        title: "成功",
        description: `已更新类型名称`,
      })
    }

    setEditItem(null)
  }

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return

    if (itemToDelete.type === "category") {
      const updatedCategories = categories.filter((c) => c !== itemToDelete.value)
      onCategoriesChange(updatedCategories)

      toast({
        title: "成功",
        description: `已删除部门: ${itemToDelete.value}`,
      })
    } else {
      const updatedTypes = types.filter((t) => t !== itemToDelete.value)
      onTypesChange(updatedTypes)

      toast({
        title: "成功",
        description: `已删除类型: ${itemToDelete.value}`,
      })
    }

    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  const openDeleteConfirm = (type: "category" | "type", value: string) => {
    setItemToDelete({ type, value })
    setDeleteConfirmOpen(true)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>管理分类和类型</SheetTitle>
            <SheetDescription>添加、编辑或删除部门和类型分类</SheetDescription>
          </SheetHeader>

          <div className="py-6">
            <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="categories">部门管理</TabsTrigger>
                <TabsTrigger value="types">类型管理</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="输入新部门名称"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button onClick={handleAddCategory}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加
                  </Button>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>部门名称</TableHead>
                        <TableHead className="w-[100px] text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                            暂无部门数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        categories.map((category, index) => (
                          <TableRow key={`category-${index}`}>
                            <TableCell>{category}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>编辑部门</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <Label htmlFor="edit-category">部门名称</Label>
                                      <Input
                                        id="edit-category"
                                        className="mt-2"
                                        value={editItem?.id === `category-${index}` ? editItem.value : category}
                                        onChange={(e) =>
                                          setEditItem({ id: `category-${index}`, value: e.target.value })
                                        }
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button onClick={handleEditItem}>保存</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive/90"
                                  onClick={() => openDeleteConfirm("category", category)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="types" className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Input placeholder="输入新类型名称" value={newType} onChange={(e) => setNewType(e.target.value)} />
                  <Button onClick={handleAddType}>
                    <Plus className="h-4 w-4 mr-1" />
                    添加
                  </Button>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>类型名称</TableHead>
                        <TableHead className="w-[100px] text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {types.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                            暂无类型数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        types.map((type, index) => (
                          <TableRow key={`type-${index}`}>
                            <TableCell>{type}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>编辑类型</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <Label htmlFor="edit-type">类型名称</Label>
                                      <Input
                                        id="edit-type"
                                        className="mt-2"
                                        value={editItem?.id === `type-${index}` ? editItem.value : type}
                                        onChange={(e) => setEditItem({ id: `type-${index}`, value: e.target.value })}
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button onClick={handleEditItem}>保存</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive/90"
                                  onClick={() => openDeleteConfirm("type", type)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === "category"
                ? `确定要删除部门 "${itemToDelete?.value}" 吗？此操作不可撤销。`
                : `确定要删除类型 "${itemToDelete?.value}" 吗？此操作不可撤销。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
