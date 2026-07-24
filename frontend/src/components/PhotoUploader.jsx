import { useRef, useState } from "react";
import { UploadCloud, X, GripVertical, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, imageUrl } from "../lib/api";
import { PLACEHOLDER } from "../lib/data";

// Reusable multi-photo uploader with preview, reorder (drag), set-cover, delete.
export default function PhotoUploader({ images, onChange, endpoint = "/upload", authed = true, max = 20 }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const dragIndex = useRef(null);

  const onFiles = async (files) => {
    const list = Array.from(files);
    if (!list.length) return;
    if (images.length + list.length > max) { toast.error(`Maximum ${max} photos`); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append("files", f));
      const cfg = { headers: { "Content-Type": "multipart/form-data" } };
      const { data } = await api.post(endpoint, fd, cfg);
      onChange([...images, ...data.urls]);
      toast.success(`${data.urls.length} photo${data.urls.length === 1 ? "" : "s"} uploaded`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (i) => onChange(images.filter((_, idx) => idx !== i));
  const makeCover = (i) => {
    const imgs = [...images];
    const [m] = imgs.splice(i, 1);
    imgs.unshift(m);
    onChange(imgs);
  };
  const onDrop = (i) => {
    const from = dragIndex.current;
    if (from === null || from === i) return;
    const imgs = [...images];
    const [m] = imgs.splice(from, 1);
    imgs.splice(i, 0, m);
    onChange(imgs);
    dragIndex.current = null;
  };

  return (
    <div>
      <div onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
        data-testid="upload-dropzone"
        className="cursor-pointer border border-dashed border-[#3a3a3a] rounded-md py-10 grid place-items-center text-center hover:border-[#C5A880] hover:bg-[#C5A880]/5 transition-colors">
        {uploading ? <Loader2 className="animate-spin text-[#C5A880]" /> : <UploadCloud className="text-[#666] mb-2" size={28} />}
        <p className="text-sm font-medium text-[#ccc]">{uploading ? "Uploading…" : "Click or drag photos here"}</p>
        <p className="text-xs text-[#666] mt-1">JPG, PNG, WebP — multiple allowed</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden data-testid="file-input"
        onChange={(e) => onFiles(e.target.files)} />

      {images.length > 0 && (
        <div className="mt-5 grid grid-cols-3 sm:grid-cols-4 gap-3" data-testid="image-grid">
          {images.map((img, i) => (
            <div key={img + i} draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              data-testid={`image-thumb-${i}`}
              className="relative group aspect-square rounded-md overflow-hidden border border-[#2B2B2B] bg-[#1A1A1A]">
              <img src={imageUrl(img)} alt="" className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 text-[0.55rem] font-bold uppercase bg-[#C5A880] text-[#050505] px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                  <Star size={9} /> Cover
                </span>
              )}
              <span className="absolute bottom-1.5 left-1.5 text-white/70"><GripVertical size={14} /></span>
              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i !== 0 && (
                  <button type="button" onClick={() => makeCover(i)} data-testid={`set-cover-${i}`}
                    className="text-xs bg-[#F9F9F9] text-[#050505] px-2 py-1 rounded-sm font-medium">Cover</button>
                )}
                <button type="button" onClick={() => removeImage(i)} data-testid={`remove-image-${i}`}
                  className="p-1.5 bg-[#FF3B30] text-white rounded-sm" aria-label="Remove"><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
