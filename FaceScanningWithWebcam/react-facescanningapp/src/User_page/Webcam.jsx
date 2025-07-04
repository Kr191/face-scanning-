import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "./Webcam.css";

const WebcamStream = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const webcamRef = useRef(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUserMedia = () => {
    setIsWebcamReady(true);
  };

  const handleCapture = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc || !imageSrc.startsWith("data:image")) {
      alert("Could not capture image from webcam.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/process_frame`,
        { image: imageSrc },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.processed_image) {
        setProcessedImage(response.data.processed_image);
        setTimeout(() => setProcessedImage(null), 5000);
      } else {
        alert("No processed image returned from backend.");
      }
    } catch (err) {
      alert("Error sending image to backend.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="webcam-main">
      <h2>Face scanning</h2>
      <div className="webcam-frame-container">
        {/* Webcam */}
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          onUserMedia={handleUserMedia}
          videoConstraints={{ width: 1280, height: 720 }}
          className="webcam-video"
        />

        {/* Processed Image */}
        {processedImage && (
          <img
            src={processedImage}
            alt="Processed Frame"
            className="webcam-processed-img"
          />
        )}
      </div>

      <button
        onClick={handleCapture}
        disabled={!isWebcamReady || loading}
        className="webcam-capture-btn"
      >
        {loading ? "Processing..." : "Capture"}
      </button>
    </div>
  );
};

export default WebcamStream;
