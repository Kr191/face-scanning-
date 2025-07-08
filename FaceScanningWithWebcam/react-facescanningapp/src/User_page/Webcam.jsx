import React, { use, useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import * as faceApi from "face-api.js";
import { useNavigate } from "react-router-dom";
import "./Webcam.css";

const WebcamStream = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const webcamRef = useRef(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const hasNavigatedRef = useRef(false);
  const [canSend, setCanSend] = useState(true);
  const canvasRef = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModel = async () => {
      const ModelURL = "/models";

      await faceApi.nets.tinyFaceDetector.loadFromUri(ModelURL);
      // await faceApi.nets.faceLandmark68Net.loadFromUri(ModelURL);
    };
    loadModel();
  }, []);

  const handleUserMedia = () => {
    setIsWebcamReady(true);
  };

  const getCombinedScreenshot = () => {
    if (!webcamRef.current || !canvasRef.current) return null;

    const video = webcamRef.current.video;
    const overlay = canvasRef.current;

    // Create a temporary canvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext("2d");

    // Draw the video frame
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    // Draw the overlay (rectangles)
    ctx.drawImage(overlay, 0, 0, tempCanvas.width, tempCanvas.height);

    // Get the combined image as a data URL
    return tempCanvas.toDataURL("image/jpeg");
  };

  const handleDetectFaces = async () => {
    if (webcamRef.current && webcamRef.current.video && canvasRef.current) {
      const video = webcamRef.current.video;
      const detections = await faceApi.detectAllFaces(
        video,
        new faceApi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.5,
        })
      );
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };
      faceApi.matchDimensions(canvasRef.current, displaySize);
      const resized = faceApi.resizeResults(detections, displaySize);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faceApi.draw.drawDetections(ctx, resized);

      // If a face is detected and canSend is true, send frame to API
      if (resized.length > 0 && canSend && !hasNavigatedRef.current) {
        setCanSend(false); // prevent immediate re-send
        const imageSrc = getCombinedScreenshot();
        if (imageSrc && imageSrc.startsWith("data:image")) {
          setLoading(true);
          try {
            const response = await axios.post(
              `${API_URL}/api/process_frame`,
              { image: imageSrc },
              { headers: { "Content-Type": "application/json" } }
            );
            if (response.data.processed_image) {
              setProcessedImage(response.data.processed_image);
            }
            if (
              response.data.pass_or_notpass !== undefined &&
              response.data.pass_or_notpass &&
              !hasNavigatedRef.current
            ) {
              hasNavigatedRef.current = true;
              setTimeout(() => {
                setProcessedImage(null);
                console.log("Log in success!!");
                navigate("/somethinginfuture");
              }, 1000);
            }
          } catch (err) {
            console.error(err);
          }
          setLoading(false);
        }
        // Cooldown: allow sending again after 2.5s
        setTimeout(() => setCanSend(true), 2500);
      }
    }
  };

  useEffect(() => {
    let Detectinterval;
    if (isWebcamReady) {
      Detectinterval = setInterval(handleDetectFaces, 66);
    }
    return () => {
      clearInterval(Detectinterval);
      hasNavigatedRef.current = false;
    };
  }, [isWebcamReady]);

  return (
    <div className="webcam-main">
      <title>Face Scanning</title>
      <h2>Face scanning</h2>
      <div className="webcam-frame-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          onUserMedia={handleUserMedia}
          videoConstraints={{ width: 1280, height: 720 }}
          className="webcam-video"
        />
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
        {processedImage && (
          <img
            src={processedImage}
            alt="Processed Frame"
            className="webcam-processed-img"
          />
        )}
      </div>
    </div>
  );
};

export default WebcamStream;
