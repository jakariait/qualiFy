import React from "react";
import FeatureStore from "../../store/FeatureStore";
import ImageComponent from "./ImageComponent.jsx";
import Skeleton from "react-loading-skeleton";

const Feature = () => {
  const { FeatureStoreList, FeatureStoreListLoading, FeatureStoreListError } =
    FeatureStore();

  if (FeatureStoreListError) {
    return (
      <div className="primaryTextColor  container md:mx-auto text-center p-3">
        <h1 className={"p-10"}>{FeatureStoreListError}</h1>
      </div>
    ); // Display error message
  }
  return (
    <div className="xl:container xl:mx-auto pb-6 pt-4 px-3">
      {FeatureStoreListLoading ? (
        <>
          <div className={"grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"}>
            <Skeleton height={200} width={"100%"} />
            <Skeleton height={200} width={"100%"} />
            <Skeleton height={200} width={"100%"} />
            <Skeleton height={200} width={"100%"} />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {FeatureStoreList.map((feature) => (
              <div
                key={feature._id}
                className="bg-white border border-gray-50 rounded-xl shadow-md  flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300"
              >
                {/* Centering the Image */}
                <div className="flex justify-center items-center">
                  <ImageComponent
                    imageName={feature.imgSrc}
                    className=" object-contain"
                    altName={feature.title}
                  />
                </div>
                {/* Title */}
                <h3 className="mt-2  p-2">{feature.title}</h3>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Feature;
