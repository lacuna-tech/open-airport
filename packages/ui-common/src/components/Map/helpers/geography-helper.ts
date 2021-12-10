export function randomPointsInBox(count: number, lat: number, lng: number, delta = 0.02) {
  const arr = []
  for (let i = 0; i < count; i++) {
    arr.push({
      lat: lat + (Math.random() - 0.5) * delta,
      lng: lng + (Math.random() - 0.5) * delta,
      id: i
    })
  }
  return arr
}
