import React, { CSSProperties, useCallback } from "react";
import { ActiveNote, KeyData } from "../types";

interface PianoKeyProps {
  keyData: KeyData;
  activeData?: ActiveNote;
  isPressed: boolean;
  onPress: () => void;
  onRelease: () => void;
  positionStyle?: CSSProperties;
}

const PianoKey: React.FC<PianoKeyProps> = ({
  keyData,
  activeData,
  isPressed,
  onPress,
  onRelease,
  positionStyle,
}) => {
  const isActive = isPressed || !!activeData;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (keyData.isBlack) e.stopPropagation();
      onPress();
    },
    [keyData.isBlack, onPress],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (keyData.isBlack) e.stopPropagation();
      onRelease();
    },
    [keyData.isBlack, onRelease],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (keyData.isBlack) e.stopPropagation();
      onRelease();
    },
    [keyData.isBlack, onRelease],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (keyData.isBlack) e.stopPropagation();
      onPress();
    },
    [keyData.isBlack, onPress],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (keyData.isBlack) e.stopPropagation();
      onRelease();
    },
    [keyData.isBlack, onRelease],
  );

  if (keyData.isBlack) {
    const activeStyle: CSSProperties = isActive
      ? {
          backgroundColor: activeData?.color,
          boxShadow: `0 4px 15px ${activeData?.color ?? "#000"}60`,
        }
      : {};

    return (
      <div
        className="absolute top-0 h-[60%] rounded-b-[20px] cursor-pointer pointer-events-auto z-10 transition-all duration-150 ease-out active:scale-y-[0.98] origin-top flex items-end justify-center pb-3 bg-[#2D3436] shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
        style={{
          left: positionStyle?.left,
          width: positionStyle?.width,
          transform: positionStyle?.transform,
          ...activeStyle,
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!isActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-b-[20px] pointer-events-none"></div>
        )}

        {isActive && (
          <span className="text-[9px] text-slate-800 font-bold opacity-90 pointer-events-none">
            {activeData?.note ?? keyData.note}
          </span>
        )}
      </div>
    );
  }

  const activeStyle: CSSProperties = isActive
    ? {
        backgroundColor: activeData?.color,
        boxShadow: "inset 0 -10px 20px -5px rgba(0,0,0,0.1)",
      }
    : {};

  return (
    <div
      className="relative flex-1 h-full rounded-b-[20px] mr-[2px] last:mr-0 transition-all duration-200 ease-out cursor-pointer active:scale-y-[0.99] origin-top flex items-end justify-center pb-4 z-0 group bg-white hover:bg-slate-50"
      style={isActive ? activeStyle : {}}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!isActive && (
        <div className="absolute inset-0 shadow-[inset_0_-8px_10px_-5px_rgba(0,0,0,0.03)] rounded-b-[20px] pointer-events-none"></div>
      )}

      <span
        className={`text-[10px] sm:text-xs font-bold z-10 ${isActive ? "text-slate-800" : "text-slate-300 opacity-50 group-hover:opacity-100 transition-opacity"}`}
      >
        {keyData.note}
      </span>
    </div>
  );
};

export default PianoKey;
