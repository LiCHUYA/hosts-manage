"use client";

import { useState } from "react";
import { Plus, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import HostCard from "./host-card";
import Pagination from "./pagination";

interface HostEntryProps {
  id: string | number;
  ip: string;
  domain: string;
  title: string;
  category: string;
  type?: "frontend" | "backend" | "database" | "cache" | "other";
  description?: string;
  lastUpdated: string;
  isComment?: boolean;
  commentText?: string;
  image?: string;
  hostContent?: string;
}

interface CardViewProps {
  hosts: HostEntryProps[];
  onAddHost: () => void;
  onHostDeleted?: (hostId: string, category: string) => void;
  onHostUpdated?: (updatedHost: HostEntryProps) => void;
}

export default function CardView({
  hosts,
  onAddHost,
  onHostDeleted,
  onHostUpdated,
}: CardViewProps) {
  // 确保 hosts 是数组
  const safeHosts = Array.isArray(hosts) ? hosts : [];

  const [currentPage, setCurrentPage] = useState(1);
  const hostsPerPage = 20; // 每页显示的条目数

  // 过滤掉注释
  const nonCommentHosts = safeHosts.filter((host) => host && !host.isComment);

  // 计算总页数
  const totalPages = Math.ceil(nonCommentHosts.length / hostsPerPage);

  // 获取当前页的主机
  const currentHosts = nonCommentHosts.slice(
    (currentPage - 1) * hostsPerPage,
    currentPage * hostsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle host deletion
  const handleHostDeleted = (hostId: string, category: string) => {
    if (onHostDeleted) {
      onHostDeleted(hostId, category);
    }
  };

  // Handle host update
  const handleHostUpdated = (updatedHost: HostEntryProps) => {
    if (onHostUpdated) {
      onHostUpdated(updatedHost);
    }
  };

  return (
    <div className="space-y-3">
      {currentHosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {currentHosts.map((host) => (
              <HostCard
                key={host.id}
                host={host}
                groupId={host.category}
                onDelete={(id, category) => handleHostDeleted(id, category)}
                onUpdate={handleHostUpdated}
              />
            ))}

            <div
              className="flex h-full min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed transition-colors hover:border-primary hover:bg-primary/5"
              onClick={onAddHost}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-2 text-sm font-medium">添加新条目</p>
            </div>
          </div>

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
        <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-md border border-dashed">
          <Server className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium">没有找到匹配的 Hosts 条目</p>
          <p className="text-sm text-muted-foreground">
            尝试使用不同的搜索条件或添加新条目
          </p>
          <Button className="mt-4" onClick={onAddHost}>
            <Plus className="mr-2 h-4 w-4" />
            添加条目
          </Button>
        </div>
      )}
    </div>
  );
}
