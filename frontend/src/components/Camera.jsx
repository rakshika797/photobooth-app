import { useEffect, useRef } from "react";

export default function Camera() {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Camera error:", err);
      });
  }, []);

  return (
    <div className="flex flex-col items-center mt-6">
      <video ref={videoRef} autoPlay className="border w-[300px]" />
      <button className="mt-4 border px-4 py-2">
        Capture
      </button>
    </div>
  );
}