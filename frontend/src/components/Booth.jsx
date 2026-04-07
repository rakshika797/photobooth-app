export default function Booth({ setStart }) {
  return (
    <div className="border-2 border-black h-[300px] flex items-center justify-center mt-6">
      <button
        onClick={() => setStart(true)}
        className="border px-6 py-2 hover:bg-black hover:text-white"
      >
        enter →
      </button>
    </div>
  );
}