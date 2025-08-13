import React from "react";
import FeatureStore from "../../store/FeatureStore";
import ImageComponent from "./ImageComponent.jsx";
import Skeleton from "react-loading-skeleton";

const Feature = () => {
  const { FeatureStoreList, FeatureStoreListLoading, FeatureStoreListError } =
    FeatureStore();

  if (FeatureStoreListError) {
    return (
      <div className="primaryTextColor container md:mx-auto text-center p-3">
        <h1 className="p-10">{FeatureStoreListError}</h1>
      </div>
    );
  }

  return (
    <div className="xl:container xl:mx-auto pb-6 pt-4 px-3">
      {/* ✅ Headline */}
      <div className="text-center mb-6">
        <h2 className="text-xl heading md:text-2xl font-bold primaryTextColor">
          Join Our Facebook Group
        </h2>
        <p className="mt-1">
          Stay connected, share ideas, and never miss an update!
        </p>
      </div>

      {FeatureStoreListLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Skeleton height={200} width="100%" />
          <Skeleton height={200} width="100%" />
          <Skeleton height={200} width="100%" />
          <Skeleton height={200} width="100%" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {FeatureStoreList.map((feature) => (
            <div
              key={feature._id}
              className="bg-white border border-gray-50 rounded-xl shadow-md flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-center items-center">
                <ImageComponent
                  imageName={feature.imgSrc}
                  className="object-contain"
                  altName={feature.title}
                />
              </div>
              <h3 className="mt-2 primaryTextColor p-2">{feature.title}</h3>
              <a
                href={feature.link}
                target="_blank"
                rel="noopener noreferrer"
                className="primaryBgColor accentTextColor px-4 py-2 mb-2 rounded inline-block"
              >
                Join Now
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feature;
