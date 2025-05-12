"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HostCard from "./host-card";
import { cn } from "@/lib/utils";
import Pagination from "./pagination";

interface HostEntryProps {
  id: string | number;
  ip: string;
  domain: string;
  category: string;
  type?: "frontend" | "backend" | "database" | "cache" | "other";
  description?: string;
  lastUpdated: string;
  isComment?: boolean;
  commentText?: string;
  image?: string;
  hostContent?: string;
  title?: string;
}

// Update the HostsGroup component to handle host deletion properly
interface HostsGroupProps {
  category: string;
  hosts: HostEntryProps[];
  onAddHost: (category: string) => void;
  onHostDeleted?: (hostId: string) => void;
  onHostUpdated?: (updatedHost: HostEntryProps) => void;
}

// 修改分页逻辑，适应新的数据结构
export default function HostsGroup({
  category,
  hosts,
  onAddHost,
  onHostDeleted,
  onHostUpdated,
}: HostsGroupProps) {
  // 确保 hosts 是数组
  const safeHosts = Array.isArray(hosts) ? hosts : [];

  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const hostsPerPage = 9; // 每页显示的条目数

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery("");
      setCurrentPage(1);
    }
  };

  // 筛选主机
  const filteredHosts = searchQuery
    ? safeHosts.filter((host) => {
        if (!host) return false;
        if (host.isComment) {
          return host.commentText
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
        return (
          (host.title &&
            host.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          host.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          host.ip?.includes(searchQuery) ||
          (host.description &&
            host.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
    : safeHosts;

  // 计算总页数
  const totalPages = Math.ceil(
    filteredHosts.filter((h) => h && !h.isComment).length / hostsPerPage
  );

  // 获取当前页的主机
  const paginatedHosts = [...filteredHosts];

  // 保留所有注释，但只显示当前页的非注释条目
  const nonCommentHosts = filteredHosts.filter((h) => h && !h.isComment);
  const currentPageHosts = nonCommentHosts.slice(
    (currentPage - 1) * hostsPerPage,
    currentPage * hostsPerPage
  );

  // 按类型分组
  const groupedByType: Record<string, HostEntryProps[]> = {};

  // 使用循环代替 reduce
  for (const host of currentPageHosts) {
    if (!host) continue;
    const type = host.type || "other";
    if (!groupedByType[type]) {
      groupedByType[type] = [];
    }
    groupedByType[type].push(host);
  }

  // 类型顺序
  const typeOrder = ["frontend", "backend", "database", "cache", "other"];

  // 类型名称映射
  const typeNames: Record<string, string> = {
    frontend: "前端",
    backend: "后端",
    database: "数据库",
    cache: "缓存",
    other: "其他",
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle host deletion
  const handleHostDeleted = (hostId: string) => {
    if (onHostDeleted) {
      onHostDeleted(hostId);
    }
  };

  // Handle host update
  const handleHostUpdated = (updatedHost: HostEntryProps) => {
    if (onHostUpdated) {
      onHostUpdated(updatedHost);
    }
  };

  return (
    <div className="mb-4 rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col">
        <div
          className="flex cursor-pointer items-center justify-between rounded-t-lg border-b bg-muted/30 px-3 py-2"
          onClick={toggleExpanded}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <h3 className="text-base font-medium">{category}</h3>
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {safeHosts.filter((h) => h && !h.isComment).length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleSearch();
              }}
              title={showSearch ? "关闭搜索" : "搜索"}
            >
              {showSearch ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onAddHost(category);
              }}
              title="添加条目"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {showSearch && isExpanded && (
          <div className="border-b bg-muted/20 px-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`在 ${category} 中搜索...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // 重置到第一页
                }}
                className="pl-10"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="p-3">
          {Object.keys(groupedByType).length > 0 ? (
            <>
              {typeOrder.map(
                (type) =>
                  groupedByType[type] && (
                    <div key={type} className="mb-3 last:mb-0">
                      <div className="mb-2 flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            type === "frontend"
                              ? "bg-blue-500"
                              : type === "backend"
                              ? "bg-purple-500"
                              : type === "database"
                              ? "bg-green-500"
                              : type === "cache"
                              ? "bg-amber-500"
                              : "bg-gray-500"
                          )}
                        ></div>
                        <h4 className="text-sm font-medium">
                          {typeNames[type]}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          ({groupedByType[type].length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {groupedByType[type].map((host) => (
                          <HostCard
                            key={host.id}
                            host={host}
                            groupId={category}
                            onDelete={(id) => handleHostDeleted(id)}
                            onUpdate={handleHostUpdated}
                          />
                        ))}
                      </div>
                    </div>
                  )
              )}

              {/* 分页控件 */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex h-20 items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "没有找到匹配的条目" : "该部门下暂无 Hosts 条目"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
