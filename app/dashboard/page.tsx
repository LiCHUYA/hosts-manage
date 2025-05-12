"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SearchFilters from "@/components/search-filters";
import type { SearchFilters as SearchFiltersType } from "@/components/search-filters";
import AddHostDialog from "@/components/add-host-dialog";
import HostsGroup from "@/components/hosts-group";
import CardView from "@/components/card-view";

import { getCategories, getTypes, getHosts } from "@/lib/db";

// 修改 Dashboard 组件中的状态管理和数据处理逻辑
export default function Dashboard() {
  const [hosts, setHosts] = useState<any[]>([]);
  const [filteredHosts, setFilteredHosts] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentLayout, setCurrentLayout] = useState<"category" | "card">(
    "category"
  );
  const { toast } = useToast();

  // 获取所有部门和类型
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // 初始化数据
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [hostsData, categoriesData, typesData] = await Promise.all([
        getHosts(),
        getCategories(),
        getTypes(),
      ]);

      setHosts(hostsData || []);
      setFilteredHosts(hostsData || []);
      setCategories(categoriesData || []);
      setTypes(typesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "加载失败",
        description: "无法加载数据，请刷新页面重试",
        variant: "destructive",
      });
      // 设置默认空数组，防止后续操作出错
      setHosts([]);
      setFilteredHosts([]);
      setCategories([]);
      setTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 使用 useCallback 包装 handleSearch 函数，避免不必要的重新创建
  const handleSearch = useCallback(
    (filters: SearchFiltersType) => {
      // 标记是否正在搜索
      setIsSearching(
        !!filters.query ||
          (filters.category && filters.category !== "all") ||
          (filters.type && filters.type !== "all")
      );

      // 确保 hosts 是数组
      if (!Array.isArray(hosts)) {
        setFilteredHosts([]);
        return;
      }

      let result = [...hosts];

      // 应用搜索查询
      if (filters.query) {
        result = result
          .map((group) => {
            // 确保 group.children 是数组
            if (!Array.isArray(group?.children)) {
              return { ...group, children: [] };
            }

            const filteredChildren = group.children.filter((host) => {
              if (!host) return false;
              if (host.isComment) {
                return host.commentText
                  ?.toLowerCase()
                  .includes(filters.query.toLowerCase());
              }
              return (
                (host.title &&
                  host.title
                    .toLowerCase()
                    .includes(filters.query.toLowerCase())) ||
                host.domain
                  ?.toLowerCase()
                  .includes(filters.query.toLowerCase()) ||
                host.ip?.includes(filters.query) ||
                (host.description &&
                  host.description
                    .toLowerCase()
                    .includes(filters.query.toLowerCase()))
              );
            });

            return {
              ...group,
              children: filteredChildren,
            };
          })
          .filter(
            (group) =>
              Array.isArray(group?.children) && group.children.length > 0
          );
      }

      // 应用分类筛选
      if (filters.category && filters.category !== "all") {
        result = result.filter((group) => group?.category === filters.category);
      }

      // 应用类型筛选
      if (filters.type && filters.type !== "all") {
        result = result
          .map((group) => {
            // 确保 group.children 是数组
            if (!Array.isArray(group?.children)) {
              return { ...group, children: [] };
            }

            const filteredChildren = group.children.filter(
              (host) => !host?.isComment && host?.type === filters.type
            );

            return {
              ...group,
              children: filteredChildren,
            };
          })
          .filter(
            (group) =>
              Array.isArray(group?.children) && group.children.length > 0
          );
      }

      setFilteredHosts(result);
    },
    [hosts]
  );

  const handleAddHost = (category = "") => {
    setSelectedCategory(category);
    setShowAddDialog(true);
  };

  // In the Dashboard component, modify the handleHostAdded function
  const handleHostAdded = async (newHosts: any[]) => {
    // 添加完成后重新获取数据，确保数据一致性
    await fetchData();

    toast({
      title: "成功",
      description: `已添加 ${newHosts.length} 个条目`,
    });
  };

  // Add a handleHostDeleted function to handle host deletion
  const handleHostDeleted = async (category: string, hostId: string) => {
    // 删除后重新获取数据，确保数据一致性
    await fetchData();
  };

  // 处理主机更新
  const handleHostUpdated = async (updatedHost: any) => {
    // 更新后重新获取数据，确保数据一致性
    await fetchData();
  };

  // 使用 useCallback 包装 handleLayoutChange 函数
  const handleLayoutChange = useCallback((layout: "category" | "card") => {
    setCurrentLayout(layout);
  }, []);

  // 计算所有非注释条目的总数
  const getTotalHostsCount = () => {
    // 确保 filteredHosts 是数组
    if (!Array.isArray(filteredHosts)) {
      return 0;
    }

    let total = 0;
    for (const group of filteredHosts) {
      if (!group || !Array.isArray(group.children)) continue;
      total += group?.children?.filter(
        (host) => host && !host.isComment
      )?.length;
    }
    return total || 0;
  };

  // 确保 filteredHosts 是数组
  const safeFilteredHosts = Array.isArray(filteredHosts) ? filteredHosts : [];

  // 根据是否在搜索，决定显示哪些部门
  const displayedCategories = isSearching
    ? safeFilteredHosts
    : Array.isArray(categories)
    ? categories.map((category) => {
        // 查找现有的部门数据
        const existingGroup = safeFilteredHosts.find(
          (group) => group.category === category
        );

        // 如果找到现有数据，使用它；否则创建一个空的部门组
        return (
          existingGroup || {
            id: `temp-${category}`,
            category,
            lastUpdated: new Date().toISOString(),
            isGroup: true,
            children: [],
          }
        );
      })
    : [];

  // 安全地获取所有主机条目
  const getAllHosts = () => {
    if (!Array.isArray(safeFilteredHosts)) return [];

    let allHosts = [];
    for (const group of safeFilteredHosts) {
      if (!group || !Array.isArray(group.children)) continue;
      allHosts = [...allHosts, ...group.children];
    }
    return allHosts;
  };

  return (
    <div className="flex-1 space-y-3 p-3 md:p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Hosts 管理</h2>
        <Button
          className="gap-1 sm:w-auto w-full"
          onClick={() => handleAddHost()}
        >
          <Plus className="h-4 w-4" />
          添加条目
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <SearchFilters
          onSearch={handleSearch}
          categories={categories}
          types={types}
          onLayoutChange={handleLayoutChange}
          currentLayout={currentLayout}
        />

        <div className="flex items-center">
          {/* <p className="text-sm text-muted-foreground">
            共 <span className="font-medium">{getTotalHostsCount()}</span> 个
            Hosts 条目，
            <span className="font-medium">
              {isSearching ? safeFilteredHosts?.length : categories.length}
            </span>{" "}
            个部门
          </p> */}
        </div>

        {isLoading ? (
          <div className="flex h-[300px] w-full flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">加载中...</p>
          </div>
        ) : currentLayout === "category" ? (
          // 分类视图
          displayedCategories.length > 0 ? (
            displayedCategories.map((group) => (
              <HostsGroup
                key={group.id}
                category={group.category}
                hosts={Array.isArray(group.children) ? group.children : []}
                onAddHost={handleAddHost}
                onHostDeleted={(hostId) =>
                  handleHostDeleted(group.category, hostId)
                }
                onHostUpdated={handleHostUpdated}
              />
            ))
          ) : (
            <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-md border border-dashed">
              <Server className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium">没有找到匹配的 Hosts 条目</p>
              <p className="text-sm text-muted-foreground">
                尝试使用不同的搜索条件
              </p>
            </div>
          )
        ) : (
          // 卡片视图 - 将所有分组的children合并为一个扁平数组
          <CardView
            hosts={getAllHosts()}
            onAddHost={() => handleAddHost()}
            onHostDeleted={(hostId, category) =>
              handleHostDeleted(category, hostId)
            }
            onHostUpdated={handleHostUpdated}
          />
        )}
      </div>

      <AddHostDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onHostAdded={handleHostAdded}
        categories={categories}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}
