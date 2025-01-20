// /frontend/src/components/ui/file-upload.jsx
import * as React from "react"
import { Upload, File, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const FileUpload = React.forwardRef(({ 
  className, 
  value,
  onChange,
  onRemove,
  disabled,
  accept,
  multiple = false,
  ...props 
}, ref) => {
  const inputRef = React.useRef(null)
  
  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e) => {
    const files = Array.from(e.target.files || [])
    onChange?.(files)
  }

  const renderFilePreview = (file) => {
    return (
      <div 
        key={file.name}
        className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
      >
        <File className="h-4 w-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)}kb
          </p>
        </div>
        <Button
          type="button" 
          variant="ghost"
          size="sm"
          onClick={() => onRemove?.(file)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div 
        onClick={handleClick}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer",
          "hover:border-primary/50 transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">
          Click to upload or drag & drop
        </p>
        <p className="text-xs text-muted-foreground">
          {accept ? accept.split(",").join(", ") : "Any file"}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
      />

      {value?.length > 0 && (
        <div className="space-y-2">
          {value.map(file => renderFilePreview(file))}
        </div>
      )}
    </div>
  )
})
FileUpload.displayName = "FileUpload"

export { FileUpload }