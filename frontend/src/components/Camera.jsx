import { useEffect, useRef, useState } from "react";

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Start camera
  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
    }

    startCamera();
  }, []);

  // Capture logic
 const capturePhoto = () => {
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

  // Countdown + auto capture
  const startSequence = async () => {
    setIsCapturing(true);
    let newPhotos = [];

    for (let i = 0; i < 4; i++) {
      // countdown 3..2..1
      for (let j = 3; j > 0; j--) {
        setCountdown(j);
        await new Promise((res) => setTimeout(res, 1000));
      }

      setCountdown("📸");

      await new Promise((res) => setTimeout(res, 500));

      const photo = capturePhoto();
      newPhotos.push(photo);
      setPhotos([...newPhotos]);

      await new Promise((res) => setTimeout(res, 1000));
    }

    setCountdown(null);
    setIsCapturing(false);
  };

  return (
    <div className="w-full flex flex-col items-center">

      <div className="w-[900px] border-2 border-black p-4 flex gap-6">

        {/* LEFT CAMERA */}
        <div className="w-2/3 flex flex-col items-center gap-4 relative">

          <video
            ref={videoRef}
            autoPlay
            className="w-full border-2 border-black"
          />

          {/* Countdown Overlay */}
          {countdown && (
            <div className="absolute text-6xl font-bold">
              {countdown}
            </div>
          )}

          <button
            onClick={startSequence}
            disabled={isCapturing}
            className="border px-4 py-1 bg-white"
          >
            start session 🎬
          </button>

        </div>

        {/* RIGHT STRIP */}
        <div className="w-1/3 border-2 border-black p-2 flex flex-col gap-2 items-center">

          {photos.length === 0 && <p>no photos</p>}

          {photos.map((p, i) => (
            <img key={i} src={p} className="w-full border" />
          ))}

        </div>

      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}