export default function Booth({ setStart }) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-[900px] h-[450px] border-2 border-black flex">

        {/* LEFT */}
        <div className="w-1/3 border-r-2 border-black p-4 flex flex-col items-center justify-between">
          <div className="border-2 border-black p-2">
            <div className="flex gap-2">
              <div className="w-6 h-24 bg-gray-400"></div>
              <div className="w-6 h-24 bg-gray-400"></div>
              <div className="w-6 h-24 bg-gray-400"></div>
              <div className="w-6 h-24 bg-gray-400"></div>
            </div>
          </div>

          <p className="text-sm">featured strips</p>

          <div className="border-2 border-black w-10 h-20 flex items-center justify-center">
            |
          </div>
        </div>

        {/* CENTER */}
        <div className="w-1/3 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,black,black_2px,transparent_2px,transparent_10px)] opacity-30"></div>

          <button
            onClick={() => setStart(true)}
            className="border px-4 py-1 bg-white z-10"
          >
            enter →
          </button>
        </div>

        {/* RIGHT */}
        <div className="w-1/3 border-l-2 border-black flex items-center justify-center">
          <div className="border-2 border-black w-32 h-48"></div>
        </div>

      </div>
    </div>
  );
}