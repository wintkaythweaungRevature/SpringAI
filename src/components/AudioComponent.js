import React, { useState } from 'react';
import axios from 'axios';

const AudioComponent = () => {
const [file,setFile] = useState(null);
const [transcription, setTranscription] = useState('');

const handleFileChange = (e) => {
  setFile(e.target.files[0]);
};

const handleUpload = async () => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await axios.post('https://api.wintaibot.com/api/ai/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
   setTranscription(response.data);
   }catch (error) {
    console.error('Error uploading file:', error);
  }
}




  return (

 <div className="container">
  <h1> Audio to Text Transcriber </h1>
  <div className="file-input" >
    <input type ="file" accept="audio/*" onChange={handleFileChange}/>
  </div>
  <button className="upload-btn"> Upload and Transcribe </button>
  <div className="transcription-result">
    <h2>  Transcription Result </h2>
    <p>{transcription}</p>
  </div>
 </div>
  );
}
export default AudioComponent;