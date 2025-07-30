import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";

const ImageComponent = ({
                          imageName,
                          className = "",
                          altName = "",
                          skeletonHeight = 200,
                          showSkeleton = true, // new prop
                        }) => {
  const [imageSrc, setImageSrc] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageName) {
      const apiUrl = import.meta.env.VITE_API_URL;
      const baseUrl = apiUrl.replace("/api", "");
      setIsLoading(true);
      setImageSrc(`${baseUrl}/uploads/${imageName}`);
    } else {
      setImageSrc("");
    }
  }, [imageName]);

  return (
    <div>
      {showSkeleton && isLoading && (
        <Skeleton height={skeletonHeight} width="100%" />
      )}

      {imageSrc && (
        <img
          src={imageSrc}
          alt={altName || imageName}
          className={className}
          style={{ display: isLoading ? "none" : "block" }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setImageSrc("");
          }}
        />
      )}
    </div>
  );
};

export default ImageComponent;
