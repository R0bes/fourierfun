import { Point } from './Point'

function dist(p1: Point, p2: Point) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}


function lerp(v1: number, v2: number, f: number) {
    return (v2 - v1) * f + v1;
}

function lerpPoints(p1: Point, p2: Point, ratio: number): Point {
    return new Point(
        lerp(p2.x, p1.x, ratio),
        lerp(p2.y, p1.y, ratio));
}

export function calcEquidistantPoints(path: Point[], numPoints: number) : Point[] {
    let totalLength = 0;
    let distances = [];
    
    // Calculate distances between Points and total lenght
    for (let i = 1; i < path.length; i++) {
      let distBetweenPoints = dist(path[i-1], path[i]);
      totalLength += distBetweenPoints;
      distances.push(totalLength);
    }
    
    let normalizedPath: Point[] = [];
    let step = totalLength / (numPoints - 1);
    
    // add first point
    normalizedPath.push(path[0]);
    
    // add every other point
    for (let i = 1; i < numPoints - 1; i++) {
      let targetLength = i * step;
      for (let j = 1; j < distances.length; j++) {
        if (distances[j] >= targetLength) {
          normalizedPath.push(lerpPoints(path[j], path[j-1], (targetLength - distances[j-1]) / (distances[j] - distances[j-1])));
          break;
        }
      } 
    }
    
    // add last point
    normalizedPath.push(path[path.length - 1]);
    return normalizedPath;
}


//function resample2dData(points: Point[]): Point[] {
//  let numSamples = points.length;
//  let newPoints: Point[] = [];
//  for (let i = 0; i < numSamples; i ++) {
//      let position = points.length * (i / numSamples);
//      let index = Math.floor(position);
//      let nextIndex = (index + 1) % points.length;
//      let amt = position - index;
//      newPoints.push(new Point(
//          /* x */ slurp(points[index].x, points[nextIndex].x, amt),
//          /* y */ slurp(points[index].y, points[nextIndex].y, amt),
//      ))
//  }
//  return newPoints;
//}
//
//export function getFourierData(points: Point[]) {
//
//  points = resample2dData(points);
//
//  const numPoints = points.length / 2;
//  const fft = new FFT(numPoints);
//  const out = fft.createComplexArray();
//  fft.transform(out, points);
//
//  // Transform into an API of points I find friendlier.
//  const fftData = [];
//
//  for (let i = 0; i < numPoints; i ++) {
//      // to reorder the frequencies a little nicer, we pick from the front and back altermatively
//      const j = i % 2 == 0 ? i / 2 : numPoints - ((i+1) / 2);
//      const x = out[2 * j];
//      const y = out[2 * j + 1];
//      const freq = ((j + numPoints / 2) % numPoints) - numPoints / 2;
//      fftData.push({
//          freq: freq,
//          // a little expensive
//          amplitude: Math.sqrt(x * x + y * y) / numPoints,
//          // a lottle expensive :(
//          phase: Math.atan2(y, x),
//      });
//  }
//  // fftData.sort((a, b) => b.amplitude - a.amplitude);
//  return fftData;
//}