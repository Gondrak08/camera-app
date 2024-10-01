import { useState, useRef } from 'react'
import './App.css'

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const startCamera = async (): Promise<void> => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  const capturePhoto = (): void => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) uploadPhoto(blob);
      }, 'image/jpeg');
    }
  };

  const uploadPhoto = async (blob: Blob): Promise<void> => {
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

  const startRecording = (): void => {
    if (!stream) return;

    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    recorder.ondataavailable = (event: BlobEvent) => {
      setVideoBlob(event.data);
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = (): void => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadVideo = async (): Promise<void> => {
    if (!videoBlob) return;

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
  );
}

export default App
