import * as React from "react";
import { cn } from "@/lib/utils";

export type SafeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | null;
  fallbackSrc?: string;
};

export const SafeImage = React.forwardRef<HTMLImageElement, SafeImageProps>(
  ({ src, alt = "", className, fallbackSrc = "/placeholder.svg", ...rest }, ref) => {
    const [error, setError] = React.useState(false);
    const [resolvedSrc, setResolvedSrc] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
      if (!src) {
        setResolvedSrc(undefined);
        return;
      }
      // Resolve DB values like "/assets/file.jpg" to the built asset URL when possible
      if (typeof src === "string" && src.startsWith("/assets/")) {
        import("@/assets/image-map").then(({ imageMap }) => {
          const file = src.split("/").pop() || "";
          const mapped = imageMap[file];
          setResolvedSrc(mapped || undefined);
        }).catch(() => setResolvedSrc(undefined));
        return;
      }
      setResolvedSrc(src);
    }, [src]);

    const finalSrc = error ? undefined : resolvedSrc;

    return (
      <img
        ref={ref}
        src={finalSrc || fallbackSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setError(true)}
        className={cn("object-cover", className)}
        {...rest}
      />
    );
  }
);
SafeImage.displayName = "SafeImage";

export default SafeImage;
