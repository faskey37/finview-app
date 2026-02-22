"use client";

import * as React from "react";

export function AppLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent">
      <div className="relative w-[140px] h-[140px]">
        {/* Logo Image */}
        <img
          src="https://raw.githubusercontent.com/faskey37/My-Portfolio/main/logo.png"
          alt="EcoVest"
          className="w-full h-full object-contain"
          style={{
            animation: 'float 3.5s ease-in-out infinite, fadeIn 0.6s ease forwards'
          }}
        />

        {/* Glow Trail */}
        <div
          className="absolute inset-0"
          style={{
            animation: 'rotate 3s linear infinite'
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #ff7a18, #8e44ff, #00c6ff, transparent 70%)',
              filter: 'blur(25px)',
              opacity: 0.7,
              width: '120px',
              height: '120px',
              margin: 'auto',
              inset: 0
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}