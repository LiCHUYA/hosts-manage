"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface ImportHostsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: (hosts: any[]) => void
}

export default function ImportHostsDialog({ open, onOpenChange, onImportComplete }: ImportHostsDialogProps) {
  const [activeTab, setActiveTab] = useState("file")
  const [file, setFile] = useState<File | null>(null)
  const [jsonText, setJsonText] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const resetState = () => {
    setFile(null)
    setJsonText("")
    setIsUploading(false)
    setUploadProgress(0)
    setPreviewData(null)
    setError(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setPreviewData(null)

    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    // Check file type
    const fileType = selectedFile.name.split(".").pop()?.toLowerCase()
    if (fileType !== "json" && fileType !== "csv") {
      setError("只支持 JSON 或 CSV 文件格式")
      return
    }

    // Read file
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        if (fileType === "json") {
          const parsedData = JSON.parse(event.target?.result as string)
          if (Array.isArray(parsedData)) {
            setPreviewData(parsedData.slice(0, 5)) // Preview first 5 items
          } else {
            setError("JSON 文件必须包含主机数组")
          }
        } else if (fileType === "csv") {
          // Simple CSV parsing (in real app, use a CSV parser library)
          const text = event.target?.result as string
          const rows = text.split("\n")
          const headers = rows[0].split(",")

          const parsedData = rows.slice(1, 6).map((row) => {
            const values = row.split(",")
            const item: Record<string, string> = {}
            headers.forEach((header, index) => {
              item[header.trim()] = values[index]?.trim() || ""
            })
            return item
          })

          setPreviewData(parsedData)
        }
      } catch (err) {
        setError("文件解析失败，请检查文件格式")
      }
    }

    if (fileType === "json") {
      reader.readAsText(selectedFile)
    } else if (fileType === "csv") {
      reader.readAsText(selectedFile)
    }
  }

  const handleJsonTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value)
    setError(null)
    setPreviewData(null)

    try {
      if (e.target.value.trim()) {
        const parsedData = JSON.parse(e.target.value)
        if (Array.isArray(parsedData)) {
          setPreviewData(parsedData.slice(0, 5)) // Preview first 5 items
        } else {
          setError("JSON 必须包含主机数组")
        }
      }
    } catch (err) {
      setError("JSON 格式无效")
    }
  }

  const handleImport = () => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Simulate import process
    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)

      setTimeout(() => {
        setIsUploading(false)

        // Generate mock imported data
        const importedHosts = Array.from({ length: 10 }, (_, i) => ({
          id: 100 + i,
          name: `imported-host-${i + 1}.example.com`,
          ip: `10.0.0.${i + 1}`,
          status: i % 3 === 0 ? "offline" : "online",
          description: `这是导入的第 ${i + 1} 个主机`,
          lastUpdated: new Date().toISOString(),
          tags: ["导入", "新主机"].join(", "),
          url: `https://imported-host-${i + 1}.example.com`,
        }))

        toast({
          title: "导入成功",
          description: `已成功导入 ${importedHosts.length} 个主机`,
        })

        onImportComplete(importedHosts)
        onOpenChange(false)
        resetState()
      }, 500)
    }, 2000)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetState()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>导入主机</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="file" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">文件导入</TabsTrigger>
            <TabsTrigger value="json">JSON 导入</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4 py-4">
            <div
              className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed ${
                error ? "border-destructive" : "border-muted-foreground/25"
              } bg-muted/50 transition-colors hover:border-muted-foreground/50`}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,.csv"
                className="hidden"
              />
              <FileText className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">点击上传文件</p>
              <p className="text-xs text-muted-foreground">支持 JSON 和 CSV 格式</p>
            </div>

            {file && (
              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="json" className="space-y-4 py-4">
            <Textarea
              placeholder="粘贴 JSON 数据..."
              className="min-h-[150px] font-mono text-sm"
              value={jsonText}
              onChange={handleJsonTextChange}
            />
            <p className="text-xs text-muted-foreground">JSON 格式必须是主机对象的数组，包含 name, ip, status 等字段</p>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {previewData && previewData.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">数据预览</h3>
            <div className="max-h-[200px] overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {Object.keys(previewData[0]).map((key) => (
                      <th key={key} className="p-2 text-left font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((item, index) => (
                    <tr key={index} className="border-b last:border-0">
                      {Object.values(item).map((value, i) => (
                        <td key={i} className="p-2 text-left">
                          {String(value).substring(0, 30)}
                          {String(value).length > 30 && "..."}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">上传进度</span>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {uploadProgress === 100 && !isUploading && (
          <Alert className="border-green-500 bg-green-500/10 text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>成功</AlertTitle>
            <AlertDescription>数据导入成功</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleImport} disabled={isUploading || (!file && !jsonText) || !!error}>
            {isUploading ? "导入中..." : "导入主机"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
