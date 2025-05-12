"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // 生成页码数组
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // 如果总页数小于等于最大显示页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // 总是显示第一页
      pageNumbers.push(1)

      // 计算中间页码的起始和结束
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      // 调整以确保我们显示正确数量的页码
      if (start > 2) pageNumbers.push("ellipsis-start")
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i)
      }
      if (end < totalPages - 1) pageNumbers.push("ellipsis-end")

      // 总是显示最后一页
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <div className="flex items-center justify-center space-x-1 py-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page, index) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <Button key={`ellipsis-${index}`} variant="outline" size="icon" disabled className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page as number)}
            className="h-8 w-8 transition-colors"
          >
            {page}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
