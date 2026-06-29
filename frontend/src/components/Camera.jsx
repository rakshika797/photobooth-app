import { useEffect, useRef, useState, useCallback } from "react";
import frameImg from "../assets/frame.jpg";

// ── Exact slot positions measured from frame.jpg (578 × 1387 px) ──────────
const FRAME_SLOTS = [
  { x: 91, y: 38,   w: 479, h: 299 },
  { x: 91, y: 375,  w: 479, h: 299 },
  { x: 91, y: 713,  w: 479, h: 299 },
  { x: 91, y: 1050, w: 479, h: 298 },
];

// ── Photo filters ──────────────────────────────────────────────────────────
const FILTERS = [
  { label: "B&W",   id: "bw",   css: "grayscale(100%)" },
  { label: "Warm",  id: "warm", css: "sepia(60%) saturate(120%) brightness(1.05)" },
  { label: "Cool",  id: "cool", css: "hue-rotate(200deg) saturate(70%) brightness(1.05)" },
  { label: "Vivid", id: "vivid",css: "saturate(200%) contrast(110%)" },
  { label: "Fade",  id: "fade", css: "grayscale(35%) brightness(1.15) contrast(85%)" },
];

// ── Strip styles ────────────────────────────────────────────────────────────
const STRIP_STYLES = [
  { label: "Film",    id: "film",    useFrame: true,  bg: null,      border: null,   gap: 0,  padding: 0 },
  { label: "Classic", id: "classic", useFrame: false, bg: "#ffffff", border: "#000", gap: 14, padding: 16 },
  { label: "Dark",    id: "dark",    useFrame: false, bg: "#1a1a1a", border: "#333", gap: 14, padding: 16 },
  { label: "Pastel",  id: "pastel",  useFrame: false, bg: "#fce4ec", border: "#f48fb1", gap: 14, padding: 16 },
];

// ── Cover-fit: fills the slot, crops overflow (like background-size: cover) ─
function drawCoverFit(ctx, img, slotX, slotY, slotW, slotH) {
  const imgRatio  = img.width / img.height;
  const slotRatio = slotW / slotH;

  let dw, dh, ox, oy;
  if (imgRatio > slotRatio) {
    // image is wider → fit by height, crop sides
    dh = slotH;
    dw = img.width * (slotH / img.height);
    ox = slotX - (dw - slotW) / 2;
    oy = slotY;
  } else {
    // image is taller → fit by width, crop top/bottom
    dw = slotW;
    dh = img.height * (slotW / img.width);
    ox = slotX;
    oy = slotY - (dh - slotH) / 2;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(slotX, slotY, slotW, slotH);
  ctx.clip();
  ctx.drawImage(img, ox, oy, dw, dh);
  ctx.restore();
}

// ── Composite photos onto the film-frame ────────────────────────────────────
function generateFilmStrip(photosArray) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d");
    const frame  = new Image();
    frame.src    = frameImg;

    frame.onload = () => {
      canvas.width  = frame.width;   // 578
      canvas.height = frame.height;  // 1387

      // 1. Draw frame first
      ctx.drawImage(frame, 0, 0);

      // 2. Load all photos then draw them
      let loaded = 0;
      const imgs = new Array(photosArray.length);

      photosArray.forEach((src, i) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          imgs[i] = img;
          if (++loaded === photosArray.length) {
            imgs.forEach((im, idx) => {
              const s = FRAME_SLOTS[idx];
              drawCoverFit(ctx, im, s.x, s.y, s.w, s.h);
            });
            resolve(canvas.toDataURL("image/png"));
          }
        };
        img.onerror = () => { loaded++; if (loaded === photosArray.length) resolve(canvas.toDataURL("image/png")); };
      });
    };
    frame.onerror = reject;
  });
}

// ── Plain strip (no frame image) ─────────────────────────────────────────────
function generatePlainStrip(photosArray, style) {
  return new Promise((resolve) => {
    const PHOTO_W   = 480;
    const PHOTO_H   = 300;
    const GAP       = style.gap;
    const PAD       = style.padding;
    const LABEL_H   = 28;

    const canvas = document.createElement("canvas");
    canvas.width  = PHOTO_W + PAD * 2;
    canvas.height = PAD + (PHOTO_H + GAP) * photosArray.length - GAP + LABEL_H + PAD;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = style.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    if (style.border) {
      ctx.strokeStyle = style.border;
      ctx.lineWidth   = 3;
      ctx.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3);
    }

    let loaded = 0;
    const imgs = new Array(photosArray.length);

    photosArray.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imgs[i] = img;
        if (++loaded === photosArray.length) {
          imgs.forEach((im, idx) => {
            const x = PAD;
            const y = PAD + idx * (PHOTO_H + GAP);
            drawCoverFit(ctx, im, x, y, PHOTO_W, PHOTO_H);

            // thin border around each photo
            if (style.border) {
              ctx.strokeStyle = style.border;
              ctx.lineWidth   = 1.5;
              ctx.strokeRect(x, y, PHOTO_W, PHOTO_H);
            }
          });

          // Label at bottom
          const labelY = PAD + photosArray.length * (PHOTO_H + GAP) - GAP + 8;
          ctx.fillStyle = style.border || "#999";
          ctx.font      = "bold 13px 'Patrick Hand', cursive";
          ctx.textAlign = "center";
          ctx.fillText("✦ photobooth ✦", canvas.width / 2, labelY + 14);

          resolve(canvas.toDataURL("image/png"));
        }
      };
      img.onerror = () => { loaded++; if (loaded === photosArray.length) resolve(canvas.toDataURL("image/png")); };
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Camera({ onReset }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);

  const [photos,         setPhotos]         = useState([]);
  const [currentStep,    setCurrentStep]    = useState(0);
  const [countdown,      setCountdown]      = useState(null);
  const [isCapturing,    setIsCapturing]    = useState(false);
  const [strips,         setStrips]         = useState({});   // { styleId: dataURL }
  const [activeStrip,    setActiveStrip]    = useState("film");
  const [generatingStrip,setGeneratingStrip]= useState(false);
  const [flash,          setFlash]          = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [cameraError,    setCameraError]    = useState(null);

  // 🎥 Start camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCameraError("Camera access denied. Allow camera permissions and refresh.");
      }
    }
    startCamera();
    return () => {
      videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // 📸 Capture one frame with filter applied
  const capturePhoto = useCallback(() => {
    try { new Audio("/click.mp3").play().catch(() => {}); } catch {}

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.filter = selectedFilter.css;
    // Mirror so selfie looks natural
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = "none";

    return canvas.toDataURL("image/png");
  }, [selectedFilter]);

  // 🎬 Full session: 4 photos with countdown
  const startSequence = async () => {
    setIsCapturing(true);
    setPhotos([]);
    setStrips({});
    let newPhotos = [];

    for (let i = 0; i < 4; i++) {
      setCurrentStep(i + 1);
      for (let j = 3; j > 0; j--) {
        setCountdown(j);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown("📸");
      await new Promise(r => setTimeout(r, 400));

      setFlash(true);
      setTimeout(() => setFlash(false), 180);
      await new Promise(r => setTimeout(r, 300));

      newPhotos.push(capturePhoto());
      setPhotos([...newPhotos]);
      await new Promise(r => setTimeout(r, 700));
    }

    setCurrentStep(0);
    setCountdown(null);
    setIsCapturing(false);
    buildAllStrips(newPhotos);
  };

  // 🎞️ Build all strip styles in parallel
  const buildAllStrips = async (photosArray) => {
    setGeneratingStrip(true);
    setActiveStrip("film");

    const results = await Promise.all(
      STRIP_STYLES.map(async (style) => {
        const url = style.useFrame
          ? await generateFilmStrip(photosArray)
          : await generatePlainStrip(photosArray, style);
        return [style.id, url];
      })
    );

    setStrips(Object.fromEntries(results));
    setGeneratingStrip(false);
  };

  const resetSession = () => {
    setPhotos([]);
    setStrips({});
    setCurrentStep(0);
    setCountdown(null);
  };

  // ── Error state ────────────────────────────────────────────────────────────
  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center mt-16 gap-4 text-center px-4">
        <p className="text-2xl">📷</p>
        <p className="text-lg border-2 border-black p-4 max-w-sm">{cameraError}</p>
        <button onClick={onReset} className="border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
          ← back to booth
        </button>
      </div>
    );
  }

  const hasStrips = Object.keys(strips).length > 0;
  const currentStripUrl = strips[activeStrip];

  return (
    <div className="w-full flex flex-col items-center mt-6 gap-6">
      {flash && <div className="fixed inset-0 bg-white opacity-80 z-50 pointer-events-none" />}

      {/* ── BOOTH ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-4xl border-2 border-black p-4 flex flex-col md:flex-row gap-6">

        {/* LEFT: camera + controls */}
        <div className="w-full md:w-2/3 flex flex-col items-center gap-3 relative">

          {/* Video */}
          <div className="w-full relative border-2 border-black overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full block"
              style={{
                filter: selectedFilter.css,
                transform: "scaleX(-1)",  // mirror for natural selfie feel
              }}
            />
            {countdown && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-8xl font-bold text-white drop-shadow-lg animate-pulse">
                  {countdown}
                </span>
              </div>
            )}
            {currentStep > 0 && (
              <div className="absolute top-2 right-2 bg-white border border-black px-2 py-0.5 text-sm font-bold">
                {currentStep} / 4
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap justify-center">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f)}
                disabled={isCapturing}
                className={`px-3 py-1 text-sm border-2 transition-colors ${
                  selectedFilter.id === f.id
                    ? "bg-black text-white border-black"
                    : "bg-white border-black hover:bg-gray-100"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={startSequence}
              disabled={isCapturing}
              className={`border-2 border-black px-5 py-2 font-medium transition-colors ${
                isCapturing
                  ? "bg-gray-200 cursor-not-allowed text-gray-400"
                  : "bg-white hover:bg-black hover:text-white"
              }`}
            >
              {isCapturing ? `capturing ${currentStep}/4...` : "start session 🎬"}
            </button>
            {photos.length > 0 && !isCapturing && (
              <button onClick={resetSession} className="border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                retake 🔄
              </button>
            )}
          </div>

          <button onClick={onReset} className="text-sm text-gray-400 underline hover:text-black">
            ← back to booth
          </button>
        </div>

        {/* RIGHT: live photo preview */}
        <div className="w-full md:w-1/3 border-2 border-black p-2 flex flex-row md:flex-col gap-2 items-center overflow-x-auto min-h-[100px]">
          {photos.length === 0
            ? <p className="text-gray-400 text-sm text-center w-full">photos appear here</p>
            : photos.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt={`Shot ${i + 1}`}
                  className="w-[80px] md:w-full border border-black animate-[fadeIn_0.4s_ease-in]"
                />
              ))
          }
        </div>
      </div>

      {/* ── STRIPS ────────────────────────────────────────────────────── */}
      {generatingStrip && (
        <p className="animate-pulse text-gray-500">developing your strips... 🎞️</p>
      )}

      {hasStrips && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-4 animate-[fadeIn_0.8s_ease-in]">
          <h2 className="text-xl tracking-wide">your photostrips ✨</h2>

          {/* Style tabs */}
          <div className="flex gap-2 flex-wrap justify-center">
            {STRIP_STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveStrip(s.id)}
                className={`px-4 py-1.5 border-2 transition-colors ${
                  activeStrip === s.id
                    ? "bg-black text-white border-black"
                    : "bg-white border-black hover:bg-gray-100"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Strip preview */}
          {currentStripUrl && (
            <div className="flex flex-col items-center gap-3">
              <img
                key={activeStrip}
                src={currentStripUrl}
                alt={`${activeStrip} strip`}
                className="w-[220px] border-2 border-black shadow-xl animate-[fadeIn_0.4s_ease-in]"
              />
              <div className="flex gap-3">
                <a
                  href={currentStripUrl}
                  download={`photostrip-${activeStrip}.png`}
                  className="border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                >
                  download 💾
                </a>
                <button onClick={resetSession} className="border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                  retake 🔄
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}