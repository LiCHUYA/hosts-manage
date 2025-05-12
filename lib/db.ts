"use server";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { revalidatePath } from "next/cache";
import fs from "fs";

// 数据库路径
// 数据库路径
const DB_DIR =
  process.env.DB_DIR ||
  (process.env.NODE_ENV === "production"
    ? "/tmp/data" // 在生产环境使用 /tmp 目录
    : path.join(process.cwd(), "data")); // 在开发环境使用项目目录
const DB_FILE = path.join(DB_DIR, "db.json");

// 数据库实例
interface DatabaseSchema {
  hosts: HostGroup[];
  categories: string[];
  types: string[];
}

// 主机数据类型
export interface HostChild {
  id: string;
  hostContent: string; // 完整的hosts条目文本
  title?: string;
  category: string;
  type?: string;
  description?: string;
  lastUpdated: string;
  isComment?: boolean;
  commentText?: string;
  image?: string;
  color?: string;
}

export interface HostGroup {
  id: string;
  category: string;
  lastUpdated: string;
  isGroup: boolean;
  children: HostChild[];
}

// 初始化数据库
const defaultData: DatabaseSchema = {
  hosts: [],
  categories: ["孩子王", "创纪云"],
  types: ["frontend", "backend", "database", "cache", "other"],
};

// 检查文件是否存在，如果不存在则创建目录
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const adapter = new JSONFile<DatabaseSchema>(DB_FILE);
const db = new Low<DatabaseSchema>(adapter, defaultData);

// 读取数据库
async function readDb() {
  await db.read();
  // 确保数据结构完整
  if (!db.data) {
    db.data = { ...defaultData };
  } else {
    // 确保必要的字段存在
    if (!Array.isArray(db.data.categories))
      db.data.categories = [...defaultData.categories];
    if (!Array.isArray(db.data.types)) db.data.types = [...defaultData.types];
    if (!Array.isArray(db.data.hosts)) db.data.hosts = [];
  }
  return db.data;
}

// 写入数据库
async function writeDb() {
  await db.write();
  revalidatePath("/dashboard");
}

// 获取所有分类
export async function getCategories(): Promise<string[]> {
  const data = await readDb();
  return data.categories;
}

// 添加分类
export async function addCategory(category: string): Promise<string[]> {
  const data = await readDb();
  if (!data.categories.includes(category)) {
    data.categories.push(category);
    await writeDb();
  }
  return data.categories;
}

// 更新分类
export async function updateCategory(
  oldCategory: string,
  newCategory: string
): Promise<string[]> {
  const data = await readDb();
  const index = data.categories.indexOf(oldCategory);
  if (index !== -1) {
    data.categories[index] = newCategory;

    // 更新主机数据中的分类
    data.hosts = data.hosts.map((group) => {
      if (group.category === oldCategory) {
        group.category = newCategory;
      }
      group.children = group.children.map((host) => {
        if (host.category === oldCategory) {
          host.category = newCategory;
        }
        return host;
      });
      return group;
    });

    await writeDb();
  }
  return data.categories;
}

// 删除分类
export async function deleteCategory(category: string): Promise<string[]> {
  const data = await readDb();
  const index = data.categories.indexOf(category);
  if (index !== -1) {
    data.categories.splice(index, 1);
    await writeDb();
  }
  return data.categories;
}

// 获取所有类型
export async function getTypes(): Promise<string[]> {
  const data = await readDb();
  return data.types;
}

// 添加类型
export async function addType(type: string): Promise<string[]> {
  const data = await readDb();
  if (!data.types.includes(type)) {
    data.types.push(type);
    await writeDb();
  }
  return data.types;
}

// 更新类型
export async function updateType(
  oldType: string,
  newType: string
): Promise<string[]> {
  const data = await readDb();
  const index = data.types.indexOf(oldType);
  if (index !== -1) {
    data.types[index] = newType;

    // 更新主机数据中的类型
    data.hosts = data.hosts.map((group) => {
      group.children = group.children.map((host) => {
        if (host.type === oldType) {
          host.type = newType;
        }
        return host;
      });
      return group;
    });

    await writeDb();
  }
  return data.types;
}

// 删除类型
export async function deleteType(type: string): Promise<string[]> {
  const data = await readDb();
  const index = data.types.indexOf(type);
  if (index !== -1) {
    data.types.splice(index, 1);
    await writeDb();
  }
  return data.types;
}

// 获取所有主机
export async function getHosts(): Promise<HostGroup[]> {
  const data = await readDb();
  return data.hosts;
}

// 添加主机组
export async function addHostGroup(
  group: Omit<HostGroup, "id" | "lastUpdated">
): Promise<HostGroup[]> {
  const data = await readDb();
  const newGroup: HostGroup = {
    ...group,
    id: uuidv4(),
    lastUpdated: new Date().toISOString(),
  };
  data.hosts.push(newGroup);
  await writeDb();
  return data.hosts;
}

// 更新主机组
export async function updateHostGroup(
  category: string,
  group: Partial<HostGroup>
): Promise<HostGroup[]> {
  const data = await readDb();
  const index = data.hosts.findIndex((h) => h.category == category);
  if (index !== -1) {
    data.hosts[index] = {
      ...data.hosts[index],
      ...group,
      lastUpdated: new Date().toISOString(),
    };
    await writeDb();
  }
  return data.hosts;
}

// 删除主机组
export async function deleteHostGroup(category: string): Promise<HostGroup[]> {
  const data = await readDb();
  data.hosts = data.hosts.filter((h) => h.category !== category);
  await writeDb();
  return data.hosts;
}

// 添加主机
export async function addHost(
  category: string,
  host: Omit<HostChild, "id" | "lastUpdated">
): Promise<HostGroup[]> {
  const data = await readDb();
  let groupIndex = data.hosts.findIndex((h) => h.category === category);

  // 如果部门不存在，创建新部门
  if (groupIndex === -1) {
    const newGroup: HostGroup = {
      id: uuidv4(),
      category,
      lastUpdated: new Date().toISOString(),
      isGroup: true,
      children: [],
    };
    data.hosts.push(newGroup);
    groupIndex = data.hosts.length - 1;
  }

  const newHost: HostChild = {
    ...host,
    id: uuidv4(),
    lastUpdated: new Date().toISOString(),
  };
  data.hosts[groupIndex].children.push(newHost);
  await writeDb();

  return data.hosts;
}

// 更新主机 - 修改为支持跨部门移动
export async function updateHost(
  category: string,
  hostId: string,
  host: Partial<HostChild>
): Promise<HostGroup[]> {
  const data = await readDb();
  const groupIndex = data.hosts.findIndex((h) => h.category === category);

  if (groupIndex === -1) {
    throw new Error(`部门 ${category} 不存在`);
  }

  const hostIndex = data.hosts[groupIndex].children.findIndex(
    (h) => h.id === hostId
  );

  if (hostIndex === -1) {
    throw new Error(`在部门 ${category} 中找不到ID为 ${hostId} 的条目`);
  }

  // 获取原始主机数据
  const originalHost = data.hosts[groupIndex].children[hostIndex];

  // 检查是否更改了部门
  if (host.category && host.category !== category) {
    // 在新部门下创建主机
    const updatedHost = {
      ...originalHost,
      ...host,
      lastUpdated: new Date().toISOString(),
    };

    // 查找新部门索引
    let newGroupIndex = data.hosts.findIndex(
      (h) => h.category === host.category
    );

    // 如果新部门不存在，创建新部门
    if (newGroupIndex === -1) {
      const newGroup: HostGroup = {
        id: uuidv4(),
        category: host.category,
        lastUpdated: new Date().toISOString(),
        isGroup: true,
        children: [],
      };
      data.hosts.push(newGroup);
      newGroupIndex = data.hosts.length - 1;
    }

    // 添加到新部门
    data.hosts[newGroupIndex].children.push(updatedHost);

    // 从原部门删除
    data.hosts[groupIndex].children = data.hosts[groupIndex].children.filter(
      (h) => h.id !== hostId
    );

    // 如果原部门没有条目了，可以选择删除原部门
    // if (data.hosts[groupIndex].children.length === 0) {
    //   data.hosts = data.hosts.filter((_, index) => index !== groupIndex)
    // }
  } else {
    // 如果没有更改部门，只更新主机数据
    data.hosts[groupIndex].children[hostIndex] = {
      ...originalHost,
      ...host,
      lastUpdated: new Date().toISOString(),
    };
  }

  await writeDb();
  return data.hosts;
}

// 删除主机
export async function deleteHost(
  category: string,
  hostId: string
): Promise<HostGroup[]> {
  const data = await readDb();
  const groupIndex = data.hosts.findIndex((h) => h.category === category);

  if (groupIndex !== -1) {
    data.hosts[groupIndex].children = data.hosts[groupIndex].children.filter(
      (h) => h.id !== hostId
    );

    // 如果部门没有条目了，可以选择删除部门
    // if (data.hosts[groupIndex].children.length === 0) {
    //   data.hosts = data.hosts.filter((_, index) => index !== groupIndex)
    // }

    await writeDb();
  }

  return data.hosts;
}
