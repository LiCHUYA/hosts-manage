"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon, X, Crop } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageUpload: (imageUrl: string) => void
  currentImage?: string
}

export default function ImageUploadDialog({ open, onOpenChange, onImageUpload, currentImage }: ImageUploadDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请选择图片文件（JPG, PNG, GIF等）",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "图片大小不能超过5MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = () => {
    if (!selectedImage) return

    setIsUploading(true)

    // Simulate upload process
    setTimeout(() => {
      // In a real application, you would upload the image to a server or storage service
      // and get back a URL to the uploaded image
      onImageUpload(selectedImage)

      toast({
        title: "上传成功",
        description: "主机图片已更新",
      })

      setIsUploading(false)
      onOpenChange(false)
    }, 1500)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>上传主机图片</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center">
            {selectedImage ? (
              <div className="relative">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Preview"
                  className="h-[200px] w-full rounded-md object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={clearSelectedImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : currentImage ? (
              <div className="relative">
                <img
                  src={currentImage || "/placeholder.svg"}
                  alt="Current image"
                  className="h-[200px] w-full rounded-md object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  <Button variant="secondary" onClick={triggerFileInput}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    更换图片
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="flex h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50"
                onClick={triggerFileInput}
              >
                <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">点击上传图片</p>
                <p className="text-xs text-muted-foreground">支持 JPG, PNG, GIF 格式</p>
                <p className="mt-2 text-xs text-muted-foreground">最大文件大小: 5MB</p>
              </div>
            )}

            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          {selectedImage && (
            <div className="flex items-center justify-between rounded-md border p-2">
              <div className="flex items-center gap-2">
                <Crop className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="crop" className="text-sm">
                  裁剪图片
                </Label>
              </div>
              <Button variant="outline" size="sm" disabled>
                编辑
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleUpload} disabled={!selectedImage || isUploading}>
            {isUploading ? "上传中..." : "保存图片"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
