import { PDFParse } from 'pdf-parse'

export const extractTextFromPDF = async (filePath) => {
  const data = new PDFParse({ filePath })
  return await data.getText()
}