import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import type { Experiences } from "../types/types";

const LazyImage = ({
  exper,
  className,
  onLoadError,
}: {
  exper: Experiences;
  className?: string;
  onLoadError?: () => void;
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-80 h-96 rounded-xl flex flex-col bg-[#F0F0F0]">
      <img
        ref={imgRef}
        src={visible ? exper.imageUrl! : ""}
        alt={exper.name}
        className={className}
        loading="lazy"
        onError={() => onLoadError && onLoadError()}
        data-src="/logo.png"
      />

      <div className="flex flex-col justify-between h-full px-4 py-3 bg-transparent">
        <div>
          <h1 className="flex justify-between w-full text-[#161616] font-medium">
            <span>{exper.name}</span>
            <span className="bg-[#D6D6D6] text-xs p-1 rounded-sm">
              {exper.city}
            </span>
          </h1>

          <p className="text-xs text-[#6C6C6C] line-clamp-3">
            {exper.description}
          </p>
        </div>

        <div className="w-full flex justify-between items-center pt-2">
          <h2 className="flex items-center gap-1">
            <span className="text-md font-normal">From</span>
            <span className="text-xl font-medium">₹{exper.price}</span>
          </h2>

          <Link
            to={`/experiences/${exper.id}`}
            className="btn-color rounded-md p-1 font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LazyImage;
