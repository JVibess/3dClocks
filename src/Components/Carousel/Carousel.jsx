import React, { useState } from "react";
import ClockOne from "../ClockOne/ClockOne";
import ClockTwo from "../ClockTwo/ClockTwo";
import ClockThree from "../ClockThree/ClockThree";
const Carousel = () => {
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);

  const components = [
    <ClockOne />,
    <ClockTwo />,
    <ClockThree />,
    // Add more components here if needed
  ];

  const handleNext = () => {
    setCurrentComponentIndex(
      (prevIndex) => (prevIndex + 1) % components.length
    );
  };

  const handlePrevious = () => {
    setCurrentComponentIndex((prevIndex) =>
      prevIndex === 0 ? components.length - 1 : prevIndex - 1
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {components[currentComponentIndex]}
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}
      >
        <button onClick={handlePrevious}>Previous</button>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};

export default Carousel;
