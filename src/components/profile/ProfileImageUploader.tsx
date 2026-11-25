"use client";

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import {
  Camera,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { notifications } from "@/lib/notifications";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiRequest, getErrorMessage, type User } from "@/lib/api";

type ProfileResponse = { user: User };

interface ProfileImageUploaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showDetails?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function ProfileImageUploader({
  size = "lg",
  className = "",
  showDetails = true,
}: ProfileImageUploaderProps) {
  const { user, token, reloadUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);

  const dimensions = {
    sm: "size-12 text-base",
    md: "size-16 text-xl",
    lg: "size-24 text-3xl",
    xl: "size-32 text-4xl",
  }[size];

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setError("Please choose a valid JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must be 5MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageSrc(dataUrl);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    reader.onerror = () => {
      setError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  }, []);

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Canvas Pan handlers for crop preview
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Crop & Export to 256x256 Base64 WebP/JPEG
  const getCroppedImageDataUrl = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!imageSrc) {
        reject(new Error("No image loaded"));
        return;
      }

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const cropSize = 300;
        canvas.width = cropSize;
        canvas.height = cropSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, cropSize, cropSize);

        // Circular clipping
        ctx.beginPath();
        ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calculate aspect fill
        const scale = Math.max(cropSize / img.width, cropSize / img.height) * zoom;
        const drawnWidth = img.width * scale;
        const drawnHeight = img.height * scale;

        // Apply pan offsets
        const centerX = cropSize / 2 + pan.x;
        const centerY = cropSize / 2 + pan.y;
        const drawX = centerX - drawnWidth / 2;
        const drawY = centerY - drawnHeight / 2;

        ctx.drawImage(img, drawX, drawY, drawnWidth, drawnHeight);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Image failed to load for cropping"));
      img.src = imageSrc;
    });
  };

  const handleSaveCroppedImage = async () => {
    setSaving(true);
    setError(null);
    try {
      const croppedDataUrl = await getCroppedImageDataUrl();
      await apiRequest<ProfileResponse>("/auth/me", {
        method: "PATCH",
        token,
        body: { image: croppedDataUrl },
      });
      await reloadUser();
      toast.success("Profile photo updated successfully!");
      setModalOpen(false);
      setImageSrc(null);
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!(await notifications.confirm("Are you sure you want to remove your profile photo?"))) return;
    setRemoving(true);
    setError(null);
    try {
      await apiRequest<ProfileResponse>("/auth/profile-image", {
        method: "DELETE",
        token,
      });
      await reloadUser();
      toast.success("Profile photo removed.");
      setModalOpen(false);
      setImageSrc(null);
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setImageSrc(null);
    setError(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const initials = user?.name ? user.name.slice(0, 1).toUpperCase() : "U";

  return (
    <div className={`flex items-center gap-5 ${className}`}>
      {/* Avatar with click trigger */}
      <div className="relative group cursor-pointer" onClick={() => setModalOpen(true)}>
        <div
          className={`${dimensions} relative overflow-hidden rounded-full border-2 border-emerald-800/20 bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-md transition-transform duration-200 group-hover:scale-105 group-hover:shadow-lg flex items-center justify-center font-bold text-emerald-950`}
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt={user?.name || "User Avatar"}
              fill
              sizes="128px"
              className="object-cover"
              unoptimized={user.image.startsWith("data:")}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Hover overlay badge */}
        <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
          <Camera size={size === "xl" ? 28 : size === "lg" ? 22 : 16} className="drop-shadow" />
          <span className="text-[10px] font-semibold mt-1 tracking-wide uppercase drop-shadow">
            Edit
          </span>
        </div>
      </div>

      {/* Optional Details block */}
      {showDetails && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-neutral-900 truncate">
              {user?.name || "Account Profile"}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200/60 capitalize">
              <Sparkles size={11} /> {user?.role || "Member"}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5 truncate">{user?.email}</p>
          <div className="mt-2.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 transition-colors"
            >
              <Upload size={13} /> Upload new photo
            </button>
            {user?.image && (
              <>
                <span className="text-neutral-300">•</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={removing}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} /> {removing ? "Removing…" : "Remove"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Profile Picture</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Upload and crop a professional photo for your Rentora profile.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {!imageSrc ? (
                /* Drag & Drop Upload State */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                    dragActive
                      ? "border-emerald-600 bg-emerald-50/50 scale-[0.99]"
                      : "border-neutral-300 hover:border-emerald-700 hover:bg-neutral-50/70"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={onFileInputChange}
                  />
                  <div className="grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-800 mb-3">
                    <Upload size={22} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    JPG, PNG, or WebP up to 5MB (Square works best)
                  </p>
                </div>
              ) : (
                /* Crop & Adjust State */
                <div className="space-y-4">
                  <div className="relative mx-auto size-64 overflow-hidden rounded-full border-4 border-emerald-700/20 bg-neutral-900 shadow-inner cursor-move select-none">
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        ref={previewImgRef}
                        src={imageSrc}
                        alt="Crop preview"
                        style={{
                          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                          maxWidth: "none",
                          userSelect: "none",
                          pointerEvents: "none",
                        }}
                        className="transition-transform duration-75"
                        draggable={false}
                      />
                    </div>
                  </div>

                  <p className="text-center text-xs text-neutral-500">
                    Drag the photo inside the circle to reposition
                  </p>

                  {/* Zoom Slider */}
                  <div className="flex items-center gap-3 px-4">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                      className="p-1 text-neutral-500 hover:text-neutral-800"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-emerald-800"
                    />
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                      className="p-1 text-neutral-500 hover:text-neutral-800"
                    >
                      <ZoomIn size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
              <div>
                {imageSrc && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageSrc(null);
                      setZoom(1);
                      setPan({ x: 0, y: 0 });
                    }}
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-800"
                  >
                    Choose another
                  </button>
                )}
                {!imageSrc && user?.image && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={removing}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={13} /> {removing ? "Removing…" : "Remove photo"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                {imageSrc && (
                  <button
                    type="button"
                    onClick={handleSaveCroppedImage}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Check size={13} /> Save photo
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
