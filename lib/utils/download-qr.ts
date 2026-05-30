export async function downloadSVGAsFile(
  svgId: string,
  filename: string,
  format: 'png' | 'svg' = 'png'
) {
  const svgElement = document.getElementById(svgId)
  if (!svgElement) {
    throw new Error('QR Code SVG element not found')
  }

  const svgData = new XMLSerializer().serializeToString(svgElement)
  
  if (format === 'svg') {
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return
  }

  // Convert to PNG
  return new Promise<void>((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    // Create a blob from SVG
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      // High resolution canvas
      const scale = 5
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob)
            const link = document.createElement('a')
            link.href = pngUrl
            link.download = `${filename}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(pngUrl)
            URL.revokeObjectURL(url)
            resolve()
          } else {
            reject(new Error('Canvas to Blob failed'))
          }
        }, 'image/png')
      } else {
        reject(new Error('Canvas context not found'))
      }
    }

    img.onerror = () => {
      reject(new Error('Image load error'))
    }

    img.src = url
  })
}
