import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const WebcamStream = () => {
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);

  const handleUserMedia = () => {
    console.log("✅ Webcam is ready");
    setIsWebcamReady(true);
  };

  useEffect(() => {
    // เมื่อกล้องพร้อมแล้วค่อยเริ่ม loop
    if (!isWebcamReady || !webcamRef.current) return;

    // เริ่มส่งภาพทุก 1 วิ
    intervalRef.current = setInterval(async () => {
      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc || !imageSrc.startsWith("data:image")) {
        console.warn("⚠️ getScreenshot() ยังไม่ได้ภาพที่ถูกต้อง");
        return;
      }

      console.log("📷 ส่งภาพ:", imageSrc.substring(0, 30));

      try {
        const response = await fetch("http://localhost:3001/api/process_frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageSrc }),
        });

        const data = await response.json();
        if (data.processed_image) {
          setProcessedImage(data.processed_image);
        } else {
          console.warn("⚠️ ไม่ได้รับ processed_image จาก backend");
        }
      } catch (err) {
        console.error("❌ POST error:", err);
      }
    }, 1000); // ทุก 1 วินาที

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isWebcamReady]);

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h2>📸 Face Recognition Preview</h2>

      <Webcam
      ref={webcamRef}
      audio={false}
      screenshotFormat="image/jpeg"
      onUserMedia={handleUserMedia}
      videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
      style={{
        width: "1280px",
        height: "720px",
        border: "2px solid green",   // ใช้ดูว่ามีภาพแสดงไหม
        borderRadius: "8px",
        marginTop: "1rem",
        }}
      />


      {processedImage ? (
        <img
          src={processedImage}
          alt="Processed Frame"
          style={{
            width: "1280px",
            height: "720px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            marginTop: "1rem",
          }}
        />
      ) : (
        <p>⏳ กำลังรอภาพจากกล้อง...</p>
      )}
    </div>
  );
};

export default WebcamStream;
