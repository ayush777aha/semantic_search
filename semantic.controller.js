const path = require('path');
const {ocrImage} = require('./semntic.service')
const fs = require('fs')


exports.uploadImage = async (req, res) => {
    const fileExtension = path.extname(req.file.originalname);
    if(fileExtension != ".txt"){
        ocrImage(req.file.path)
  .then(extractedText => {
    const outputFilePath = `outputs/${req.file.originalname}.txt`;
    fs.writeFileSync(outputFilePath, extractedText);
    console.log('OCR output saved to:', outputFilePath);
  })
  .catch(error => console.error('Error:', error));
    }
    res.status(200).json({ message: 'File uploaded successfully!' })
}


exports.searchKeyword = async (req, res) => {
    const searchText = req.params.text.toLowerCase();
    const files = fs.readdirSync('./uploads');

    let matchingFiles = [];

    files.forEach((file) => {
        const content = fs.readFileSync(`outputs/${file}.txt`, 'utf-8').toLowerCase();
        if (content.includes(searchText)) {
            matchingFiles.push(file);
        }
    });

    res.status(200).json({ files: matchingFiles });
}

