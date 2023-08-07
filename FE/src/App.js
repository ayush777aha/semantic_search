import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchFiles('');
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:3000/upload', formData);
      setMessage(response.data.message);
      setFile(null);
      setFileName('');
      fetchFiles(searchKeyword);
    } catch (error) {
      setMessage('File upload failed.');
    }
  };

  const handleSearch = () => {
    fetchFiles(searchKeyword);
  };

  const fetchFiles = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:3000/search/${keyword}`);
      setFiles(response.data.files);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  return (
    <div className="App">
      <h1>File Upload</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>
      {message && <p>{message}</p>}
      {fileName && <p>Uploaded file: {fileName}</p>}

      <h1>Search Files</h1>
      <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
      <button onClick={handleSearch}>Search</button>

      <h1>Uploaded Files</h1>
      {files.length > 0 ? (
        <ul>
          {files.map((file, index) => (
            <li key={index}>{file.fileName}</li>
          ))}
        </ul>
      ) : (
        <p>No files uploaded yet.</p>
      )}
    </div>
  );
}

export default App;
