const Tesseract = require('tesseract.js');
const fs = require('fs');

async function ocrImage(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);

    const result = await Tesseract.recognize(
      imageBuffer,
      'eng',
    );

    return result.data.text;
  } catch (error) {
    console.error('Error performing OCR:', error);
    return '';
  }
}


  module.exports ={
    ocrImage,
  }