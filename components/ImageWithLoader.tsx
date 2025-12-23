
import React, { useState } from 'react';
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
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${containerClassName}`}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10 bg-slate-100">
           <ImageIcon className="w-8 h-8 opacity-20 mb-1" />
           <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">No Image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          onError={() => setError(true)}
          {...props}
        />
      )}
    </div>
  );
};
