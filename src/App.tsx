import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
   const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStream(stream);
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(uploadPhoto, 'image/jpeg');
  };

  const uploadPhoto = async (blob) => {
    const formData = new FormData();
    formData.append('photo', blob, 'photo.jpg');
    
    try {
      await fetch('YOUR_API_ENDPOINT_FOR_PHOTO', {
        method: 'POST',
        body: formData,
      });
      alert('Photo uploaded successfully');
    } catch (err) {
      console.error('Error uploading photo: ', err);
    }
  };

  const startRecording = () => {
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    recorder.ondataavailable = (event) => {
      setVideoBlob(event.data);
    };
    
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setIsRecording(false);
  };

  const uploadVideo = async () => {
    const formData = new FormData();
    formData.append('video', videoBlob, 'video.mp4');
    
    try {
      await fetch('YOUR_API_ENDPOINT_FOR_VIDEO', {
        method: 'POST',
        body: formData,
      });
      alert('Video uploaded successfully');
    } catch (err) {
      console.error('Error uploading video: ', err);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      <button onClick={startCamera}>Start Camera</button>
      <button onClick={capturePhoto}>Capture Photo</button>
      {isRecording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Record Video</button>
      )}
      <button onClick={uploadVideo} disabled={!videoBlob}>Upload Video</button>
    </div>
  );}

export default App
