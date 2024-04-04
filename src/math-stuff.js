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
  normalizedPath.push(normalizedPath[0]);
  
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