import { useEffect, useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

declare global {
  interface Window {
    cloudinary?: any;
  }
}

type Props = {
  onUpload: (url: string) => void;
  onRemove?: (url: string) => void;
  value?: string[];
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "fiztopz_preset";

/**
 * Cloudinary Upload Widget — loads the widget script on demand,
 * uploads directly from the browser to Cloudinary (never touches our server),
 * and returns the CDN URL.
 */
export function CloudinaryUpload({
  onUpload,
  onRemove,
  value = [],
  multiple = true,
  maxFiles = 8,
  className = "",
}: Props) {
  const widgetRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  // Load the Cloudinary widget script once
  useEffect(() => {
    if (document.getElementById("cloudinary-widget-script")) return;
    const script = document.createElement("script");
    script.id = "cloudinary-widget-script";
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const openWidget = () => {
    if (!window.cloudinary) {
      // Script not loaded yet — try again in a moment
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        openWidget();
      }, 1000);
      return;
    }

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: UPLOAD_PRESET,
          multiple,
          maxFiles,
          sources: ["local", "url", "camera"],
          resourceType: "auto",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "webm"],
          maxImageFileSize: 5000000, // 5MB
          maxVideoFileSize: 50000000, // 50MB
          cropping: false,
          folder: "fiztopz/products",
          styles: {
            palette: {
              window: "#0f0f0f",
              sourceBg: "#1a1a1a",
              windowBorder: "#c9a14a",
              tabIcon: "#c9a14a",
              inactiveTabIcon: "#666",
              menuIcons: "#c9a14a",
              link: "#c9a14a",
              action: "#c9a14a",
              inProgress: "#c9a14a",
              complete: "#33b27b",
              error: "#8b1a1a",
              textDark: "#ffffff",
              textLight: "#aaaaaa",
            },
          },
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return;
          }
          if (result.event === "success") {
            onUpload(result.info.secure_url);
          }
        },
      );
    }
    widgetRef.current.open();
  };

  return (
    <div className={className}>
      {/* Image previews */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((url) => (
            <div key={url} className="relative group w-20 h-24 rounded overflow-hidden border border-border bg-black">
              {url.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
                <video src={url} className="w-full h-full object-cover" muted loop playsInline />
              ) : (
                <img src={url} alt="" className="w-full h-full object-cover" />
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-maroon text-white grid place-items-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={openWidget}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-muted border border-dashed border-border rounded text-sm hover:border-gold hover:text-gold transition disabled:opacity-50"
      >
        {loading ? (
          <>Loading widget…</>
        ) : value.length > 0 ? (
          <>
            <ImageIcon className="w-4 h-4" />
            Add More Images
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload Images
          </>
        )}
      </button>
    </div>
  );
}
