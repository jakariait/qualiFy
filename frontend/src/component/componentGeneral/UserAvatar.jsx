import React, { useState, useEffect } from "react";

const UserAvatar = ({ user, avatarClass }) => {
  const hasImage = user?.userImage && typeof user.userImage === "string";
  const [loading, setLoading] = useState(hasImage);
  const [imageSrc, setImageSrc] = useState("");

  // Construct full image URL from env and imageName
  useEffect(() => {
    if (hasImage) {
      const apiUrl = import.meta.env.VITE_API_URL;
      const baseUrl = apiUrl.replace("/api", "");
      setImageSrc(`${baseUrl}/uploads/${user.userImage}`);
      setLoading(true);
    } else {
      setImageSrc("");
      setLoading(false);
    }
  }, [hasImage, user.userImage]);

  // Called when image finishes loading or errors out
  const handleImageLoad = () => setLoading(false);
  const handleImageError = () => setLoading(false);

  // if (loading) {
  //   return <div className={`${avatarClass} bg-gray-300 animate-pulse`}></div>;
  // }

  if (hasImage && imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={user.fullName || "User Avatar"}
        className={avatarClass}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    );
  }

  // No image, show initials fallback
  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || "U";

  return <span className={avatarClass}>{initial}</span>;
};

export default UserAvatar;
