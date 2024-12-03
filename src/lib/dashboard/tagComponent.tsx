import React from "react";

const Colors = {
  grey: "bg-gray-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "blue",
};

const TagComponent = ({ title, style, customColors }: any) => {
  const green = [
    "Excellent",
    "Normal",
    "Adequate",
    "Good",
    "Low Risk",
    "No Risk",
  ];
  const orange = [
    "Average",
    "Low",
    "Sleep-Deprived",
    "Medium Risk",
    "Regular",
    // "High Risk",
    // "Irregular",
  ];
  const red = ["Poor", "Excessive", "High Risk", "Irregular", "High"];

  // Allow overriding colors through props
  const { greenColor, orangeColor, redColor, defaultColor } = {
    greenColor: customColors?.green || Colors.green,
    orangeColor: customColors?.orange || Colors.orange,
    redColor: customColors?.red || Colors.red,
    defaultColor: customColors?.default || Colors.grey,
  };

  // Determine the background color based on the title
  let bgColor = defaultColor; // Default color if no match

  if (title) {
    if (green.includes(title)) {
      bgColor = greenColor;
    } else if (orange.includes(title)) {
      bgColor = orangeColor;
    } else if (red.includes(title)) {
      bgColor = redColor;
    }
  }

  return (
    <div
      className={` inline-block rounded-md px-2 py-1 font-bold text-white ${bgColor}`}
      style={style}
    >
      {title || "Default Title"}
    </div>
  );
};

export default TagComponent;
