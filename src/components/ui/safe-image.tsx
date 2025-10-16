import * as React from "react";
import { cn } from "@/lib/utils";

export type SafeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | null;
  fallbackSrc?: string;
};

export const SafeImage = React.forwardRef<HTMLImageElement, SafeImageProps>(
  ({ src, alt = "", className, fallbackSrc = "/placeholder.svg", ...rest }, ref) => {
    const [error, setError] = React.useState(false);

    // Images saved as "/assets/..." won't resolve at runtime (bundled by Vite)
    const isInvalidAssetPath = typeof src === "string" && src.startsWith("/assets/");
    const finalSrc = !src || error || isInvalidAssetPath ? fallbackSrc : src;

    return (
      <img
        ref={ref}
        src={finalSrc}
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
