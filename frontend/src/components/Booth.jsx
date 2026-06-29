export default function Booth({ setStart }) {
  const strips = [
    ["bg-gray-300", "bg-gray-500", "bg-gray-200", "bg-gray-400"],
    ["bg-stone-300", "bg-stone-500", "bg-stone-200", "bg-stone-400"],
    ["bg-zinc-300", "bg-zinc-500", "bg-zinc-200", "bg-zinc-400"],
  ];

  return (
    <div className="w-full flex justify-center mt-6">
      <div className="w-full max-w-4xl border-2 border-black flex min-h-[400px]">

        {/* LEFT — Sample strips */}
        <div className="w-1/3 border-r-2 border-black p-4 flex flex-col items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">sample strips</p>

          <div className="flex gap-3 justify-center">
            {strips.map((strip, si) => (
              <div key={si} className="border-2 border-black p-1 flex flex-col gap-1">
                {strip.map((color, ci) => (
                  <div key={ci} className={`w-8 h-10 ${color}`} />
                ))}
              </div>
            ))}
          </div>

          <div className="border-2 border-black w-10 h-14 flex items-center justify-center text-gray-400 text-xs">
            🎞️
          </div>
        </div>

        {/* CENTER — Enter button */}
        <div className="w-1/3 flex flex-col items-center justify-center relative gap-4">
          {/* Striped background */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,black,black_1px,transparent_1px,transparent_10px)] opacity-10" />

          <p className="z-10 text-sm text-center px-2 text-gray-600 leading-snug">
            4 photos · your choice of filter · instant strip
          </p>

          <button
            onClick={() => setStart(true)}
            className="border-2 border-black px-6 py-2 bg-white z-10 hover:bg-black hover:text-white transition-colors duration-200 text-lg"
          >
            enter →
          </button>

          <p className="z-10 text-xs text-gray-400">click to start</p>
        </div>

        {/* RIGHT — Preview frame */}
        <div className="w-1/3 border-l-2 border-black flex flex-col items-center justify-center gap-3 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">preview</p>
          <div className="border-2 border-black w-32 h-44 flex flex-col gap-1 p-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-300 text-xs"
              >
                {i + 1}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">your strip will look like this</p>
        </div>

      </div>
    </div>
  );
}