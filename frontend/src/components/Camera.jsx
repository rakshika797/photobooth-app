import { useEffect, useRef, useState } from "react";

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [image, setImage] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [count, setCount] = useState(null);
  const [strip, setStrip] = useState(null);

  // 🎥 Start Camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Camera error:", err);
      });
  }, []);

  // 📸 Capture Photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");

    setImage(data);
    setPhotos((prev) => [...prev, data]);

    setTimeout(() => {
      generateStrip();
    }, 500);
  };

  //  geenrate strip
  const generateStrip = () => {
    if (photos.length < 4) return;

    const gap = 10;
    canvas.height = (imgHeight + gap) * 4;
    ctx.drawImage(img, 0, index * (imgHeight + gap), imgWidth, imgHeight);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const imgWidth = 200;
    const imgHeight = 150;

    canvas.width = imgWidth;
    canvas.height = imgHeight * 4;

    photos.slice(0, 4).forEach((photo, index) => {
      const img = new Image();
      img.src = photo;

      img.onload = () => {
        ctx.drawImage(img, 0, index * imgHeight, imgWidth, imgHeight);

        if (index === 3) {
          const finalStrip = canvas.toDataURL("image/png");
          setStrip(finalStrip);
        }
      };
    });
  };

  // ⏳ Countdown Logic
  const startCountdown = () => {
    let time = 3;
    setCount(time);

    const interval = setInterval(() => {
      time--;
      setCount(time);

      if (time === 0) {
        clearInterval(interval);
        setCount(null);
        capturePhoto();
      }
    }, 1000);
  };

  return (
    <div className="flex justify-center items-start gap-10 mt-10">
      {/* 📸 LEFT — PHOTO STRIP */}
      <div className="border-2 border-black p-4 flex flex-col gap-2">
        <h2 className="text-sm text-center mb-2">strips</h2>

        {photos.map((p, i) => (
          <img key={i} src={p} className="w-[80px] border border-black p-1" />
        ))}
      </div>

      {/* 🎥 CENTER — CAMERA */}
      <div className="flex flex-col items-center">
        <video
          ref={videoRef}
          autoPlay
          className="border-2 border-black w-[300px]"
        />

        {/* ⏳ Countdown */}
        {count !== null && <h1 className="text-5xl mt-3">{count}</h1>}

        {/* 📸 Capture Button */}
        <button
          onClick={startCountdown}
          className="mt-4 border-2 border-black px-6 py-2 hover:bg-black hover:text-white"
        >
          capture
        </button>

        {/* 🖼️ Preview + Download */}
        {image && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <img
              src={image}
              alt="preview"
              className="w-[120px] border border-black p-1"
            />

            <a
              href={image}
              download="photo.png"
              className="border-2 border-black px-4 py-1 hover:bg-black hover:text-white"
            >
              download
            </a>
          </div>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
      {strip && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <h2 className="text-lg">Your Photostrip</h2>

          <img src={strip} className="border-2 border-black p-2 w-50" />

          <a
            href={strip}
            download="photostrip.png"
            className="border-2 border-black px-4 py-2 hover:bg-black hover:text-white"
          >
            Download Strip
          </a>
        </div>
      )}
    </div>
  );
}
