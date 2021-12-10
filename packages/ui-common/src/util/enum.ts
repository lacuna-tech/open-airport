export const prettyEnum = (enumStr: string): string =>
  enumStr
    .toLowerCase()
    .split(/[\s-_]+/)
    .map(s => s[0].toUpperCase() + s.substring(1))
    .join(' ')
