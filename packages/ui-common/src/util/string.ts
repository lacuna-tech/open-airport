export const indexToLetter = (index: number) => String.fromCharCode(97 + index).toLocaleUpperCase()

// Ported from https://stackoverflow.com/a/34842797/467339
export const hashCode = (str: string) => {
  // eslint-disable-next-line no-bitwise
  return str.split('').reduce((prevHash, currVal) => ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0, 0)
}
