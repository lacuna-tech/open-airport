if (typeof window.URL.createObjectURL === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Object.defineProperty(window.URL, 'createObjectURL', { value: () => {} })
}
