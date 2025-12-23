
import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon } from 'lucide-react';

interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

export const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ 
  src, 
  alt, 
  className, 
  containerClassName = "",
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    // Fail-safe: Force loaded state after 2 seconds to prevent infinite skeleton
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 2000);

    if (imgRef.current && imgRef.current.complete) {
        setIsLoading(false);
    }

    return () => clearTimeout(timer);
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${containerClassName}`}>
      {/* Loading Skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse z-10 flex items-center justify-center">
           <div className="w-8 h-8 rounded-full bg-slate-300/50" />
        </div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-100 z-20 flex flex-col items-center justify-center text-slate-400">
           <ImageIcon className="w-8 h-8 opacity-20 mb-1" />
           <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">No Image</span>
        </div>
      )}

      {/* Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        crossOrigin="anonymous" // Helps with CDN caching and CORS
        className={`${className} transition-opacity duration-300`} // Removed opacity control logic for fail-safe visibility
        onLoad={() => setIsLoading(false)}
        onError={() => {
            setIsLoading(false);
            setHasError(true);
        }}
        {...props}
      />
    </div>
  );
};
