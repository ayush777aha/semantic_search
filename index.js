const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require("cors")
const controller = require("./semantic.controller")

const app = express();

app.use(cors());
app.use(express.json());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null,  file.originalname);
  },
});

const upload = multer({ storage });

// Upload endpoint
app.post('/upload',upload.single('file'), controller.uploadImage);

// Search endpoint
app.get('/search/:text',controller.searchKeyword);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
