import FFT from 'fft.js';

export function normalizePath(path, numPoints) {
  let totalLength = 0;
  let distances = [0];
  
  // Calculate distances between Points and total lenght
  for (let i = 1; i < path.length; i++) {
    let distBetweenPoints = dist(path[i-1], path[i]);
    totalLength += distBetweenPoints;
    distances.push(totalLength);
  }
  
  let normalizedPath = [];
  let step = totalLength / (numPoints - 1);
  
  // add first point
  normalizedPath.push(path[0]);
  
  // add every other point
  for (let i = 1; i < numPoints - 1; i++) {
    let targetLength = i * step;
    for (let j = 1; j < distances.length; j++) {
      if (distances[j] >= targetLength) {
        let leftover = targetLength - distances[j-1];
        let segmentLength = distances[j] - distances[j-1];
        let ratio = leftover / segmentLength;
        let newX = lerp(path[j-1].x, path[j].x, ratio);
        let newY = lerp(path[j-1].y, path[j].y, ratio);
        normalizedPath.push({x: newX, y: newY});
        break;
      }
    } 
  }
  
  // add last point
  normalizedPath.push(path[path.length - 1]);
  return normalizedPath;
}

function dist(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

function lerp(start, end, ratio) {
    return start + (end - start) * ratio;
}

export function slurp(val1, val2, amt) {
  return (val2 - val1) * amt + val1;
}

export function resample2dData(points) {
  let numSamples = points.length;
  let newPoints = [];
  for (let i = 0; i < numSamples; i ++) {
      let position = points.length * (i / numSamples);
      let index = Math.floor(position);
      let nextIndex = (index + 1) % points.length;
      let amt = position - index;
      newPoints.push(
          /* x */ slurp(points[index].x, points[nextIndex].x, amt),
          /* y */ slurp(points[index].y, points[nextIndex].y, amt),
      )
  }
  return newPoints;
}

export function getFourierData(points) {

  const numPoints = points.length / 2;
  const fft = new FFT(numPoints);
  const out = fft.createComplexArray();
  fft.transform(out, points);

  // Transform into an API of points I find friendlier.
  const fftData = [];

  for (let i = 0; i < numPoints; i ++) {
      // to reorder the frequencies a little nicer, we pick from the front and back altermatively
      const j = i % 2 == 0 ? i / 2 : numPoints - ((i+1) / 2);
      const x = out[2 * j];
      const y = out[2 * j + 1];
      const freq = ((j + numPoints / 2) % numPoints) - numPoints / 2;
      fftData.push({
          freq: freq,
          // a little expensive
          amplitude: Math.sqrt(x * x + y * y) / numPoints,
          // a lottle expensive :(
          phase: Math.atan2(y, x),
      });
  }
  // fftData.sort((a, b) => b.amplitude - a.amplitude);
  return fftData;
}