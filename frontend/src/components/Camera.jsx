import { useEffect, useRef, useState } from "react";

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Camera error:", err);
      });
  }, []);

  // 📸 Capture function
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const data = canvas.toDataURL("image/png");
    setImage(data);
  };

  return (
    <div className="flex flex-col items-center mt-6">
      
      <video ref={videoRef} autoPlay className="border w-[300px]" />

      <button
        onClick={capturePhoto}
        className="mt-4 border px-4 py-2"
      >
        Capture
      </button>

      <canvas ref={canvasRef} className="hidden" />

      {/* Preview */}
      {image && (
        <div className="mt-4">
          <img src={image} alt="captured" className="w-[200px]" />
        </div>
      )}
    </div>
  );
}