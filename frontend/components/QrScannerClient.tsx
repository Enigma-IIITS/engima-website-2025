"use client";
import React, { useEffect, useRef } from "react";
import jsQR from "jsqr";

interface QrScannerClientProps {
  onDecode: (result: string) => void;
  isSubmitting: boolean;
}

export default function QrScannerClient({
  onDecode,
  isSubmitting,
}: QrScannerClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null); // Keep a ref to the stream itself

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        canvasRef.current
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && !isSubmitting) {
            onDecode(code.data);
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream; // Store the stream in our ref
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true"); // Required for iOS
          videoRef.current.play();
          animationFrameId = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    };

    startCamera();

    // THIS IS THE GUARANTEED CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        console.log("Camera stream stopped definitively.");
      }
    };
  }, [isSubmitting, onDecode]);

  return (
    <div className="w-full h-full relative">
      <video ref={videoRef} style={{ width: "100%", height: "100%" }} />
      {/* Hidden canvas used for processing video frames */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
