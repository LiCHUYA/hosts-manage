"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Trash2, Edit, Tag, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useToast } from "@/hooks/use-toast"
import {
  getCategories,
  getTypes,
  addCategory,
  addType,
  updateCategory,
  updateType,
  deleteCategory,
  deleteType,
} from "@/lib/db"

export default function SettingsPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [categorySearch, setCategorySearch] = useState("")
  const [typeSearch, setTypeSearch] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newType, setNewType] = useState("")
  const [editCategory, setEditCategory] = useState({ show: false, original: "", updated: "" })
  const [editType, setEditType] = useState({ show: false, original: "", updated: "" })
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: "", value: "" })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // 获取数据
  const fetchData = async () => {
    setIsLoading(true)
    try {
      console.log("Fetching categories and types...")
      const categoriesData = await getCategories()
      const typesData = await getTypes()
      console.log("Fetched data:", { categories: categoriesData, types: typesData })
      setCategories(categoriesData || [])
      setTypes(typesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "加载失败",
        description: "无法加载数据，请刷新页面重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 添加分类
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "错误",
        description: "部门名称不能为空",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Adding category:", newCategory)
      const updatedCategories = await addCategory(newCategory)
      console.log("Updated categories:", updatedCategories)
      setCategories(updatedCategories || [])
      setNewCategory("")
      toast({
        title: "成功",
        description: `已添加部门: ${newCategory}`,
      })
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "添加失败",
        description: "无法添加部门",
        variant: "destructive",
      })
    }
  }

  // 添加类型
  const handleAddType = async () => {
    if (!newType.trim()) {
      toast({
        title: "错误",
        description: "类型名称不能为空",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedTypes = await addType(newType)
      setTypes(updatedTypes)
      setNewType("")
      toast({
        title: "成功",
        description: `已添加类型: ${newType}`,
      })
    } catch (error) {
      console.error("Error adding type:", error)
      toast({
        title: "添加失败",
        description: "无法添加类型",
        variant: "destructive",
      })
    }
  }

  // 更新分类
  const handleUpdateCategory = async () => {
    if (!editCategory.updated.trim()) {
      toast({
        title: "错误",
        description: "部门名称不能为空",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedCategories = await updateCategory(editCategory.original, editCategory.updated)
      setCategories(updatedCategories)
      setEditCategory({ show: false, original: "", updated: "" })
      toast({
        title: "成功",
        description: `已更新部门: ${editCategory.original} → ${editCategory.updated}`,
      })
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "更新失败",
        description: "无法更新部门",
        variant: "destructive",
      })
    }
  }

  // 更新类型
  const handleUpdateType = async () => {
    if (!editType.updated.trim()) {
      toast({
        title: "错误",
        description: "类型名称不能为空",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedTypes = await updateType(editType.original, editType.updated)
      setTypes(updatedTypes)
      setEditType({ show: false, original: "", updated: "" })
      toast({
        title: "成功",
        description: `已更新类型: ${editType.original} → ${editType.updated}`,
      })
    } catch (error) {
      console.error("Error updating type:", error)
      toast({
        title: "更新失败",
        description: "无法更新类型",
        variant: "destructive",
      })
    }
  }

  // 删除确认
  const handleDeleteConfirm = async () => {
    try {
      if (deleteConfirm.type === "category") {
        const updatedCategories = await deleteCategory(deleteConfirm.value)
        setCategories(updatedCategories)
        toast({
          title: "成功",
          description: `已删除部门: ${deleteConfirm.value}`,
        })
      } else if (deleteConfirm.type === "type") {
        const updatedTypes = await deleteType(deleteConfirm.value)
        setTypes(updatedTypes)
        toast({
          title: "成功",
          description: `已删除类型: ${deleteConfirm.value}`,
        })
      }
    } catch (error) {
      console.error("Error deleting:", error)
      toast({
        title: "删除失败",
        description: "无法删除项目",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirm({ show: false, type: "", value: "" })
    }
  }

  // 筛选分类
  const filteredCategories = categorySearch
    ? categories.filter((category) => category.toLowerCase().includes(categorySearch.toLowerCase()))
    : categories

  // 筛选类型
  const filteredTypes = typeSearch
    ? types.filter((type) => type.toLowerCase().includes(typeSearch.toLowerCase()))
    : types

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">系统设置</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 部门管理 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Layers className="h-5 w-5 text-muted-foreground" />
                  部门管理
                </CardTitle>
                <CardDescription>管理 Hosts 条目的部门分类</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="搜索部门..."
                    className="pl-9"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="新部门名称"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="min-w-[150px]"
                  />
                  <Button onClick={handleAddCategory} className="shrink-0">
                    <Plus className="mr-2 h-4 w-4" />
                    添加
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>部门名称</TableHead>
                        <TableHead className="w-[100px] text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <TableRow key={category}>
                            <TableCell>{category}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditCategory({ show: true, original: category, updated: category })}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">编辑</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteConfirm({ show: true, type: "category", value: category })}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">删除</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="h-24 text-center">
                            {categorySearch ? "没有找到匹配的部门" : "暂无部门数据"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 类型管理 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  类型管理
                </CardTitle>
                <CardDescription>管理 Hosts 条目的类型标签</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="搜索类型..."
                    className="pl-9"
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="新类型名称"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="min-w-[150px]"
                  />
                  <Button onClick={handleAddType} className="shrink-0">
                    <Plus className="mr-2 h-4 w-4" />
                    添加
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>类型名称</TableHead>
                        <TableHead className="w-[100px] text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTypes.length > 0 ? (
                        filteredTypes.map((type) => (
                          <TableRow key={type}>
                            <TableCell>{type}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditType({ show: true, original: type, updated: type })}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">编辑</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteConfirm({ show: true, type: "type", value: type })}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">删除</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="h-24 text-center">
                            {typeSearch ? "没有找到匹配的类型" : "暂无类型数据"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 编辑部门对话框 */}
      <Dialog
        open={editCategory.show}
        onOpenChange={(open) => !open && setEditCategory({ ...editCategory, show: false })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑部门</DialogTitle>
            <DialogDescription>修改部门名称，相关的 Hosts 条目也会同步更新</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="editCategoryName" className="text-sm font-medium">
                  部门名称
                </label>
                <Input
                  id="editCategoryName"
                  value={editCategory.updated}
                  onChange={(e) => setEditCategory({ ...editCategory, updated: e.target.value })}
                  placeholder="输入部门名称"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCategory({ ...editCategory, show: false })}>
              取消
            </Button>
            <Button onClick={handleUpdateCategory}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑类型对话框 */}
      <Dialog open={editType.show} onOpenChange={(open) => !open && setEditType({ ...editType, show: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑类型</DialogTitle>
            <DialogDescription>修改类型名称，相关的 Hosts 条目也会同步更新</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="editTypeName" className="text-sm font-medium">
                  类型名称
                </label>
                <Input
                  id="editTypeName"
                  value={editType.updated}
                  onChange={(e) => setEditType({ ...editType, updated: e.target.value })}
                  placeholder="输入类型名称"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditType({ ...editType, show: false })}>
              取消
            </Button>
            <Button onClick={handleUpdateType}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={deleteConfirm.show}
        onOpenChange={(open) => !open && setDeleteConfirm({ ...deleteConfirm, show: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm.type === "category"
                ? `确定要删除部门 "${deleteConfirm.value}" 吗？相关的 Hosts 条目也会被删除。`
                : `确定要删除类型 "${deleteConfirm.value}" 吗？相关的 Hosts 条目将被设置为"其他"类型。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
