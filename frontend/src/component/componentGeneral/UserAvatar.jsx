import React, { useState, useEffect } from "react";

const UserAvatar = ({ user, avatarClass }) => {
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    if (user?.userImage && typeof user.userImage === "string") {
      const apiUrl = import.meta.env.VITE_API_URL;
      const baseUrl = apiUrl.replace("/api", "");
      setImageSrc(`${baseUrl}/uploads/${user.userImage}?t=${Date.now()}`);
    } else {
      setImageSrc("");
    }
  }, [user?.userImage]);

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={user.fullName || "User Avatar"}
        className={avatarClass}
        onError={() => setImageSrc("")} // fallback to initials if broken image
      />
    );
  }

  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || "U";

  return <span className={avatarClass}>{initial}</span>;
};

export default UserAvatar;
