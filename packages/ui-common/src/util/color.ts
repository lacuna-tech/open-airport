// A way to lighten (positive 0-1 lum) or darken (negative -1-0) colors.
// See: https://www.sitepoint.com/javascript-generate-lighter-darker-color/
export function ColorLuminance(input: string, lum: number) {
  // validate hex string
  let hex = String(input).replace(/[^0-9a-f]/gi, '')
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  // convert to decimal and change luminosity
  let rgb = '#'
  let c
  let i
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16)
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16)
    rgb += `00${c}`.substr(c.length)
  }

  return rgb
}
