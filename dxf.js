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

const heightOffsetInches = meterToInches(testModuleLength) + 50;
const origin = { x: 0, y: 0 };
const textHeight = meterToInches(0.75);
const xOffsetText = meterToInches(testModuleLength + 1);

const offsetOrigin = (oldOrigin) => {
  return {
    x: oldOrigin.x,
    y: -1 * (Math.abs(oldOrigin.y) + heightOffsetInches),
  };
};

let dxf = new Drawing();

dxf.setUnits("Inches");

const drawPanelsAtAngle = (currentOrigin, angle) => {
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
    `y of portrait: ${apparentLength(
      meterToInches(testModuleLength),
      angle
    ).toFixed(4)}:`
  );
  dxf.drawText(
    currentOrigin.x,
    currentOrigin.y - textHeight - textHeight,
    textHeight / 5,
    0,
    `y or landscape: ${apparentLength(
      meterToInches(testModuleWidth),
      angle
    ).toFixed(4)}:`
  );
  // portrait
  dxf.drawRect(
    currentOrigin.x + xOffsetText,
    currentOrigin.y,
    currentOrigin.x + xOffsetText + meterToInches(testModuleWidth),
    currentOrigin.y +
      apparentLength(meterToInches(testModuleLength) * -1, angle)
  );
  dxf.drawRect(
    currentOrigin.x + xOffsetText + meterToInches(testModuleWidth) + 10,
    currentOrigin.y,
    currentOrigin.x +
      xOffsetText +
      meterToInches(testModuleLength) +
      meterToInches(testModuleWidth) +
      10,
    currentOrigin.y + apparentLength(meterToInches(testModuleWidth) * -1, angle)
  );
};

// drawPanelsAtAngle(origin, 0);
// let newOrigin = offsetOrigin(origin);
// drawPanelsAtAngle(newOrigin, 25);
// newOrigin = offsetOrigin(newOrigin);
// drawPanelsAtAngle(newOrigin, 35);

/**
 *
 * @param {Array<number>} anglesArr
 * @returns void (writes to file if success)
 */
const generatePanels = (anglesArr) => {
  if (anglesArr.length < 1) return;
  else {
    let origin = { x: 0, y: 0 };
    for (const num of anglesArr) {
      drawPanelsAtAngle(origin, num);
      origin = offsetOrigin(origin);
    }
  }

  console.log("Writing to file...");
  fs.writeFileSync(__dirname + "DXF.dxf", dxf.toDxfString());
};

generatePanels([0, 10, 15, 20, 35, 40, 45]);
