export const timeToLongPress = 400
export const distanceToFar = 5
export const isTooFar = (n1, n2) => Math.abs(n2 - n1) >= distanceToFar
export const movedTooFar = (x1, y1, x2, y2) => isTooFar(x1, x2) || isTooFar(y1, y2)
