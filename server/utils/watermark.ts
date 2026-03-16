import { PDFDocument, rgb, degrees } from 'pdf-lib'

export async function watermarkPdf(pdfBuffer: ArrayBuffer, telephone: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  const pages = pdfDoc.getPages()

  for (const page of pages) {
    const { width, height } = page.getSize()

    // Texte du watermark
    const text = `ExamensBénin • ${telephone} • Usage personnel uniquement`

    // Watermark diagonal centré — répété 4 fois sur la page
    const positions = [
      { x: width * 0.15, y: height * 0.25 },
      { x: width * 0.15, y: height * 0.50 },
      { x: width * 0.15, y: height * 0.75 },
      { x: width * 0.15, y: height * 0.10 },
    ]

    for (const pos of positions) {
      page.drawText(text, {
        x: pos.x,
        y: pos.y,
        size: 11,
        color: rgb(0.75, 0.75, 0.75),
        opacity: 0.4,
        rotate: degrees(35),
      })
    }
  }

  return pdfDoc.save()
}