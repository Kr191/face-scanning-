import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const WebcamStream = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);

  const handleUserMedia = () => {
    console.log("Webcam is ready");
    setIsWebcamReady(true);
  };

  useEffect(() => {
    // wait until webcam ready and start loop
    if (!isWebcamReady || !webcamRef.current) return;

    // send an image every 1 sec
    intervalRef.current = setInterval(async () => {
      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc || !imageSrc.startsWith("data:image")) {
        console.warn("⚠️ getScreenshot() not the right img");
        return;
      }

      console.log("send img in base64:", imageSrc.substring(0, 30));

      try {
        const response = await fetch(`${API_URL}/api/process_frame`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageSrc }),
        });

        const data = await response.json();
        if (data.processed_image) {
          setProcessedImage(data.processed_image);
        } else {
          console.warn("⚠️ no processed_image from backend");
        }
      } catch (err) {
        console.error("POST error:", err);
      }
    }, 700); // every 0.7 sec (700 ms)

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isWebcamReady]);

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h2>Face scanning</h2>

      <div
        style={{
          position: "relative",
          width: "1280px",
          height: "720px",
          margin: "0 auto",
          border: "4px solid black",
          borderRadius: "8px",
        }}
      >
        {/* Webcam */}
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          onUserMedia={handleUserMedia}
          videoConstraints={{ width: 1280, height: 720 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "8px",
            zIndex: 1,
          }}
        />

        {/* Processed Image */}
        {processedImage && (
          <img
            src={processedImage}
            alt="Processed Frame"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* ข้อความรอ */}
      {!processedImage && <p>⏳ Wait for result...</p>}
    </div>
  );
};

export default WebcamStream;
