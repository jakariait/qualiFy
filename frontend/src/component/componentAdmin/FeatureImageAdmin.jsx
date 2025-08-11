import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import ImageComponent from "../componentGeneral/ImageComponent.jsx";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const apiUrl = import.meta.env.VITE_API_URL;

const FeatureImageAdmin = () => {
  const [featureImages, setFeatureImages] = useState([]);
  const [editingFeature, setEditingFeature] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit, reset, setValue, control } = useForm();
  const fileInputRef = useRef(null);
  const { token } = useAuthAdminStore();

  useEffect(() => {
    const fetchFeatureImages = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/feature-images`);
        setFeatureImages(data.data);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };
    fetchFeatureImages();
  }, []);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("link", data.link || ""); // Always send link

    if (data.imgSrc && data.imgSrc.length > 0) {
      formData.append("imgSrc", data.imgSrc[0]);
    }

    try {
      if (editingFeature) {
        await axios.put(`${apiUrl}/feature-images/${editingFeature._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccessMessage("Update successful!");
      } else {
        await axios.post(`${apiUrl}/feature-images/create`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccessMessage("Image added successfully!");
      }

      const { data } = await axios.get(`${apiUrl}/feature-images`);
      setFeatureImages(data.data);
      setEditingFeature(null);
      reset();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("An error occurred. Please try again.");
    }

    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };


  const handleEdit = (feature) => {
    setEditingFeature(feature);
    setValue("title", feature.title);
    setValue("link", feature.link || "");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feature image?")) return;

    try {
      await axios.delete(`${apiUrl}/feature-images/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFeatureImages(featureImages.filter((item) => item._id !== id));
      setSuccessMessage("Image deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting image:", error);
      setErrorMessage("Failed to delete image.");
    }
  };

  return (
    <div className="container mx-auto p-4 shadow rounded-lg mt-4">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
        Feature Images
      </h1>

      {successMessage && <p className="text-green-600 text-center font-semibold mb-4">{successMessage}</p>}
      {errorMessage && <p className="text-red-600 text-center font-semibold mb-4">{errorMessage}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded-lg shadow w-full max-w-md mx-auto">
        {/* Title */}
        <label className="block font-medium">Title:</label>
        <input {...register("title", { required: true })} className="w-full border p-2 rounded-lg mb-3" />

        {/* Link */}
        <label className="block font-medium">Link (optional):</label>
        <input
          {...register("link")}
          className="w-full border p-2 rounded-lg mb-3"
          placeholder="https://example.com"
        />

        {/* Image */}
        <label className="block font-medium">Image:</label>
        <Controller
          name="imgSrc"
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <input
              type="file"
              className="w-full border p-2 rounded-lg mb-3"
              accept="image/*"
              onChange={(e) => field.onChange(e.target.files)}
              ref={fileInputRef}
            />
          )}
        />

        <button type="submit" className="primaryBgColor accentTextColor cursor-pointer py-2 px-4 rounded-lg w-full">
          {editingFeature ? "Update Image" : "Add Image"}
        </button>
      </form>

      {/* Display Feature Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {featureImages.map((feature) => (
          <div key={feature._id} className="rounded-lg shadow p-4 relative">
            {feature.link ? (
              <a href={feature.link} target="_blank" rel="noopener noreferrer">
                <ImageComponent imageName={feature.imgSrc} className="w-full h-60" skeletonHeight={200} />
              </a>
            ) : (
              <ImageComponent imageName={feature.imgSrc} className="w-full h-60" skeletonHeight={200} />
            )}
            <h3 className="text-center font-semibold mt-2">{feature.title}</h3>
            {feature.link && (
              <p className="text-center text-blue-600 text-sm break-words">
                <a href={feature.link} target="_blank" rel="noopener noreferrer">
                  {feature.link}
                </a>
              </p>
            )}

            <div className="absolute top-2 right-2 flex gap-2">
              <button onClick={() => handleEdit(feature)} className="p-2 bg-yellow-500 text-white rounded-full">
                <Pencil size={20} />
              </button>
              <button onClick={() => handleDelete(feature._id)} className="p-2 bg-red-500 rounded-full text-white">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureImageAdmin;
