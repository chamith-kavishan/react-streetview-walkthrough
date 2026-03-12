const baseUrl = "https://photo-sphere-viewer-data.netlify.app/assets/";

// Use the official Photo Sphere Viewer Key Biscayne demo images instead of your OB images.
export const images = [
  baseUrl + "tour/key-biscayne-1.jpg",
  baseUrl + "tour/key-biscayne-2.jpg",
  baseUrl + "tour/key-biscayne-3.jpg",
  baseUrl + "tour/key-biscayne-4.jpg",
  baseUrl + "tour/key-biscayne-5.jpg",
  baseUrl + "tour/key-biscayne-6.jpg",
  baseUrl + "tour/key-biscayne-7.jpg",
];

// Minimal node graph matching the sample's links (indexes not string ids).
export const nodeConfigs = [
  // id '1'
  {
    targetNodeIds: [1], // -> '2'
    arrowPositions: [{ textureX: -800, textureY: 1500 }],
    cameraPosition: {},
  },
  // id '2'
  {
    targetNodeIds: [2, 0], // -> '3', '1'
    arrowPositions: [
      { textureX: -300, textureY: 1500 },
      { textureX: 3000, textureY: 1500 },
    ],
    cameraPosition: {},
  },
  // id '3'
  {
    targetNodeIds: [3, 1, 4], // -> '4','2','5'
    arrowPositions: [
      { textureX: 2800, textureY: 1500 },
      { textureX: 4000, textureY: 1500 },
      { textureX: 1600, textureY: 1500 },
    ],
    cameraPosition: {},
  },
  // id '4'
  {
    targetNodeIds: [2, 4], // -> '3','5'
    arrowPositions: [
      { textureX: 2800, textureY: 1500 },
      { textureX: 4000, textureY: 1500 },
    ],
    cameraPosition: {},
  },
  // id '5'
  {
    targetNodeIds: [5, 2, 3], // -> '6','3','4'
    arrowPositions: [
      { textureX: 2800, textureY: 1500 },
      { textureX: 4000, textureY: 1500 },
      { textureX: 1600, textureY: 1500 },
    ],
    cameraPosition: {},
  },
  // id '6'
  {
    targetNodeIds: [4, 6], // -> '5','7'
    arrowPositions: [
      { textureX: 2800, textureY: 1500 },
      { textureX: 4000, textureY: 1500 },
    ],
    cameraPosition: {},
  },
  // id '7'
  {
    targetNodeIds: [5], // -> '6'
    arrowPositions: [{ textureX: 2800, textureY: 1500 }],
    cameraPosition: {},
  },
];
