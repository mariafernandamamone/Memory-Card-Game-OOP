// generateColors(pairsCount = 15) {
//   const startHue = Math.floor(Math.random() * 360);
//   const step = Math.floor(360 / pairsCount);

//   return Array.from({ length: pairsCount }, (_, i) => {
//     const hue = (startHue + i * step) % 360;
//     return `hsl(${hue}, 75%, 55%)`;
//   });
// }