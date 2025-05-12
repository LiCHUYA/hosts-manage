"use client"

import type React from "react"

import { useState } from "react"
import { Search, X, LayoutGrid, List, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useRouter } from "next/navigation"

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void
  onLayoutChange: (layout: "category" | "card") => void
  categories: string[]
  types: string[]
  currentLayout: "category" | "card"
}

export interface SearchFilters {
  query: string
  category: string
  type: string
}

export default function SearchFilters({
  onSearch,
  onLayoutChange,
  categories,
  types,
  currentLayout,
}: SearchFiltersProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "all",
    type: "all",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, query: e.target.value }
    setFilters(newFilters)
    onSearch(newFilters)
  }

  const handleSelectChange = (name: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    onSearch(newFilters)
  }

  const handleReset = () => {
    const resetFilters = {
      query: "",
      category: "all",
      type: "all",
    }
    setFilters(resetFilters)
    onSearch(resetFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category !== "all") count++
    if (filters.type !== "all") count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  // 类型名称映射
  const typeNames: Record<string, string> = {
    frontend: "前端",
    backend: "后端",
    database: "数据库",
    cache: "缓存",
    other: "其他",
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex w-full flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索标题、IP、域名或描述..."
            className="pl-10 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={filters.query}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={filters.category} onValueChange={(value) => handleSelectChange("category", value)}>
            <SelectTrigger className="w-[120px] border-primary/20 bg-primary/5 hover:bg-primary/10 focus:ring-primary/20">
              <SelectValue placeholder="所有部门" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有部门</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(value) => handleSelectChange("type", value)}>
            <SelectTrigger className="w-[120px] border-primary/20 bg-primary/5 hover:bg-primary/10 focus:ring-primary/20">
              <SelectValue placeholder="所有类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有类型</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {typeNames[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/settings")}
            className="h-9 w-9"
            title="管理分类和类型"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <ToggleGroup
            type="single"
            value={currentLayout}
            onValueChange={(value) => value && onLayoutChange(value as "category" | "card")}
            className="border rounded-md"
          >
            <ToggleGroupItem value="category" aria-label="分类视图" className="h-9 px-2.5">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="card" aria-label="卡片视图" className="h-9 px-2.5">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.category !== "all" && (
            <Badge
              variant="outline"
              className="gap-1 border-blue-200 bg-blue-50 px-2 py-1 text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
            >
              部门: {filters.category}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newFilters = { ...filters, category: "all" }
                  setFilters(newFilters)
                  onSearch(newFilters)
                }}
              />
            </Badge>
          )}
          {filters.type !== "all" && (
            <Badge
              variant="outline"
              className="gap-1 border-purple-200 bg-purple-50 px-2 py-1 text-purple-600 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400"
            >
              类型: {typeNames[filters.type] || filters.type}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newFilters = { ...filters, type: "all" }
                  setFilters(newFilters)
                  onSearch(newFilters)
                }}
              />
            </Badge>
          )}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={handleReset}>
              清除全部
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
