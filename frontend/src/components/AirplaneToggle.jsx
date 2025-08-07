import React from "react";

export default function AirplaneToggle({ isAirplaneMode, setAirplaneMode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-zinc-400">☁️ Cloud</span>

      <button
        onClick={() => setAirplaneMode(!isAirplaneMode)}
        className={`w-14 h-7 rounded-full relative transition-colors duration-300 ${
          isAirplaneMode ? "bg-red-600" : "bg-zinc-700"
        }`}
        aria-label="Toggle Airplane Mode"
      >
        <div
          className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
            isAirplaneMode ? "translate-x-7" : "translate-x-0"
          }`}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs">
            {isAirplaneMode ? "✈️" : "☁️"}
          </span>
        </div>
      </button>

      <span className="text-sm text-zinc-400">✈️ Airplane</span>
    </div>
  );
}
