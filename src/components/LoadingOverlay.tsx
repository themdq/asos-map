import React from 'react';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "Загрузка карты..." }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#111] z-[2]">
      <div className="text-center text-white">
        <div className="text-[32px] mb-2.5">⏳</div>
        <p>{message}</p>
      </div>
    </div>
  );
}
