import { useEffect, useRef, useState } from "react";

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [strip, setStrip] = useState(null);
  const [flash, setFlash] = useState(false);
  const [styleMode, setStyleMode] = useState("classic");

  // 🎥 Start camera
  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
    }
    startCamera();
  }, []);

  // 📸 Capture photo with filter
  const capturePhoto = () => {
    const audio = new Audio("/click.mp3");
    audio.play();

    const video = videoRef.current;

    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.filter = "grayscale(100%)";
    ctx.drawImage(video, 0, 0);
    ctx.filter = "none";

    return canvas.toDataURL("image/png");
  };

  // 🔥 Generate final strip
  const generateStrip = (photosArray) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = 200;
    const height = 150;
    const gap = 10;

    canvas.width = width;
    canvas.height = (height + gap) * photosArray.length;

    photosArray.forEach((photo, index) => {
      const img = new Image();
      img.src = photo;

      img.onload = () => {
        ctx.drawImage(img, 0, index * (height + gap), width, height);

        if (index === photosArray.length - 1) {
          const finalStrip = canvas.toDataURL("image/png");
          setStrip(finalStrip);
        }
      };
    });
  };

  // 🎬 Full photobooth session
  const startSequence = async () => {
    setIsCapturing(true);
    let newPhotos = [];

    for (let i = 0; i < 4; i++) {
      setCurrentStep(i + 1);
      for (let j = 3; j > 0; j--) {
        setCountdown(j);
        await new Promise((res) => setTimeout(res, 1000));
      }

      setCountdown("📸");
      await new Promise((res) => setTimeout(res, 500));

      setFlash(true);
      setTimeout(() => setFlash(false), 150);

      await new Promise((res) => setTimeout(res, 500));

      const photo = capturePhoto();
      newPhotos.push(photo);
      setPhotos([...newPhotos]);

      await new Promise((res) => setTimeout(res, 800));

      setCurrentStep(0);
    }

    setCountdown(null);
    setIsCapturing(false);

    // 🔥 Generate strip after all photos
    generateStrip(newPhotos);
  };

  // 🔄 Reset
  const resetSession = () => {
    setPhotos([]);
    setStrip(null);
  };

  return (
    <div className="w-full flex flex-col items-center mt-6">
      {flash && <div className="fixed inset-0 bg-white opacity-80 z-50"></div>}
      {/* MAIN BOOTH */}
      <div className="w-[900px] border-2 border-black p-4 flex gap-6">
        {/* LEFT CAMERA */}
        <div className="w-2/3 flex flex-col items-center gap-4 relative">
          <video
            ref={videoRef}
            autoPlay
            className={`w-full ${
              styleMode === "classic"
                ? "border-2 border-black"
                : "rounded-xl shadow-lg"
            }`}
          />

          {/* ⏳ Countdown */}
          {countdown && (
            <div className="absolute text-6xl font-bold animate-pulse">
              {countdown}
            </div>
          )}

          {currentStep > 0 && (
            <p className="text-lg mt-2 animate-pulse">
              Photo {currentStep} / 4
            </p>
          )}

          <button
            onClick={startSequence}
            disabled={isCapturing}
            className={`border px-4 py-2 ${
              isCapturing
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-white hover:bg-black hover:text-white"
            }`}
          >
            {isCapturing ? "capturing..." : "start session 🎬"}
          </button>
          <button
            onClick={() =>
              setStyleMode((prev) =>
                prev === "classic" ? "modern" : "classic",
              )
            }
            className="border px-3 py-1 mt-2"
          >
            Toggle Style 🎨
          </button>
        </div>

        {/* RIGHT PREVIEW STRIP */}
        <div className="w-1/3 border-2 border-black p-2 flex flex-col gap-2 items-center">
          {photos.length === 0 && <p>no photos</p>}

          {photos.map((p, i) => (
            <img
              key={i}
              src={p}
              className={`w-full animate-[fadeIn_0.5s_ease-in] ${
                styleMode === "classic" ? "border" : "rounded-lg shadow-md"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 🔥 FINAL STRIP */}
      {strip && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <h2 className="text-lg">Final Photostrip</h2>

          <img
            src={strip}
            className="w-[200px] border-2 border-black animate-[fadeIn_1s_ease-in]"
          />

          <a
            href={strip}
            download="photostrip.png"
            className="border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
          >
            Download Strip
          </a>

          <button onClick={resetSession} className="border px-4 py-2">
            Retake
          </button>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
