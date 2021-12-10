export const downloadFile = (blob: Blob, fileName: string) => {
  const anchorTag = document.createElement('a')
  anchorTag.href = URL.createObjectURL(blob)
  anchorTag.download = fileName
  document.body.appendChild(anchorTag)

  anchorTag.click()

  // Cleanup
  URL.revokeObjectURL(anchorTag.href)
  document.body.removeChild(anchorTag)
}
