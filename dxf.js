const Drawing = require("dxf-writer");
const fs = require("fs");

const meterToInches = (val) => {
  return val * 39.3701;
};

const apparentLength = (len, angle) => {
  return len * Math.abs(Math.cos((angle * Math.PI) / 180));
};

const testModuleLength = 1.686; // meters
const testModuleWidth = 1.016; // meters

let dxf = new Drawing();

dxf.setUnits("Inches");

//
const drawPanelsAtAngle = (currentOrigin, angle, length, width, isMeters) => {
  if (length < width) {
    console.log("Length should be greater than Width");
    return;
  }
  const iWidth = isMeters ? meterToInches(width) : width;
  const iLength = isMeters ? meterToInches(length) : length;
  const textHeight = 0.4 * iLength;
  const xOffsetText = iLength * 1.4;
  dxf.drawText(
    currentOrigin.x,
    currentOrigin.y - textHeight,
    textHeight,
    0,
    `${angle}:`
  );
  dxf.drawText(
    currentOrigin.x,
    currentOrigin.y - textHeight - 0.5 * textHeight,
    textHeight / 5,
    0,
    `y portrait: ${apparentLength(iLength, angle).toFixed(4)}:`
  );
  dxf.drawText(
    currentOrigin.x,
    currentOrigin.y - textHeight * 2,
    textHeight / 5,
    0,
    `y landscape: ${apparentLength(iWidth, angle).toFixed(4)}:`
  );
  // portrait
  dxf.drawRect(
    currentOrigin.x + xOffsetText,
    currentOrigin.y,
    currentOrigin.x + xOffsetText + iWidth,
    currentOrigin.y + apparentLength(iLength * -1, angle)
  );
  //landscape
  dxf.drawRect(
    currentOrigin.x + xOffsetText + iWidth + 0.2 * iWidth,
    currentOrigin.y,
    currentOrigin.x + xOffsetText + iLength + iWidth + 0.2 * iWidth,
    currentOrigin.y + apparentLength(iWidth * -1, angle)
  );
};

// shift origin down by  height offset
const offsetOrigin = (oldOrigin, isMeters, baseLength) => {
  let heightOffset = isMeters ? meterToInches(baseLength) : baseLength;
  heightOffset *= 1.2;
  return {
    x: oldOrigin.x,
    y: -1 * (Math.abs(oldOrigin.y) + heightOffset),
  };
};

/**
 * @param {number} baseLength module actual length
 * @param {number} baseWidth module actual width
 * @param {Array<number>} anglesArr
 * @param {boolean} isMeters base inputs are in meters
 * output sizes are always in inches no matter the input
 * @returns void (writes to file if success)
 */
const generatePanels = (baseLength, baseWidth, anglesArr, isMeters) => {
  if (anglesArr.length < 1) return;

  let origin = { x: 0, y: 0 };
  for (const angle of anglesArr) {
    drawPanelsAtAngle(origin, angle, baseLength, baseWidth, isMeters);
    origin = offsetOrigin(origin, isMeters, baseLength);
  }

  console.log("Writing to file...");
  fs.writeFileSync(__dirname + "DXF.dxf", dxf.toDxfString());
};

// generatePanels(
//   testModuleLength,
//   testModuleWidth,
//   [0, 10, 15, 20, 35, 40, 45],
//   true
// );

generatePanels(40, 30, [0, 15, 16, 27, 38], false);
