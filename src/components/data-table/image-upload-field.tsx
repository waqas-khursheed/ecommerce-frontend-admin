"use client";

import { useRef, useState } from "react";
import { ImageOff, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  existingImageUrl?: string | null;
  required?: boolean;
  error?: string;
  onFileChange: (file: File | null) => void;
}

// Single-image upload with preview — used for category image/icon, brand
// logo/banner, attribute item image, and product featured/hovered image.
// The backend stores a bare filename and expects the field as multipart
// form data, so this just hands the raw File back to the caller to attach
// to a FormData object on submit.
export function ImageUploadField({
  id,
  label,
  existingImageUrl,
  required,
  error,
  onFileChange,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const displayUrl = previewUrl ?? existingImageUrl;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted",
            error && "border-destructive ring-3 ring-destructive/20"
          )}
        >
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImageOff className="size-5 text-muted-foreground" />
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload />
          {displayUrl ? "Replace" : "Upload"}
        </Button>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}
