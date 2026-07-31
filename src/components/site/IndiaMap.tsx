import { useEffect, useState } from "react";

import indiaOutline from "@/assets/India_outline.svg";
import mpDistrictMap from "@/assets/Madhya_Pradesh_district_map.svg";

const serviceLocations = [
  { name: "Rajgarh", x: 405, y: 350, color: "#22d3ee" },
  { name: "Shajapur", x: 390, y: 430, color: "#38bdf8" },
  { name: "Sehore", x: 455, y: 455, color: "#a78bfa" },
  { name: "Vidisha", x: 545, y: 335, color: "#22d3ee" },
  { name: "Raisen", x: 585, y: 440, color: "#38bdf8" },
  { name: "Narmadapuram", x: 565, y: 525, color: "#a78bfa" },
  { name: "Harda", x: 500, y: 595, color: "#22d3ee" },
  { name: "Sagar", x: 675, y: 335, color: "#38bdf8" },
];

export function IndiaMap() {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setZoomed(true);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.14),transparent_62%)]" />

      {/* India opening view */}
      <img
        src={indiaOutline}
        alt="India"
        className={`absolute left-1/2 top-1/2 w-[70%] -translate-x-1/2 -translate-y-1/2 object-contain transition-all duration-1000 ${
          zoomed ? "scale-[2.8] opacity-0" : "scale-100 opacity-90"
        }`}
      />

      {/* Madhya Pradesh view */}
      <div
        className={`absolute left-1/2 top-1/2 w-[90%] -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
          zoomed ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        {/* Glow behind map */}
        <div className="pointer-events-none absolute inset-[5%] rounded-full bg-sky-500/10 blur-3xl" />

        {/* District map */}
        <img
          src={mpDistrictMap}
          alt="Madhya Pradesh district map"
          className="relative z-10 block w-full object-contain"
          style={{
            filter:
              "invert(1) brightness(.74) contrast(1.55) saturate(.18) hue-rotate(180deg)",
            mixBlendMode: "screen",
          }}
        />

        {/* Routes and service highlights */}
        <svg
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="routeGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id="districtGlow">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#0ea5e9" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="bhopalGlow">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Bright areas around service districts */}
          {serviceLocations.map((location) => (
            <circle
              key={`glow-${location.name}`}
              cx={location.x}
              cy={location.y}
              r="54"
              fill="url(#districtGlow)"
            />
          ))}

          {/* Bhopal central glow */}
          <circle cx="520" cy="410" r="76" fill="url(#bhopalGlow)" />

          {/* Routes from Bhopal */}
          {serviceLocations.map((location, index) => {
            const controlX = (520 + location.x) / 2;
            const controlY =
              Math.min(410, location.y) - 45 - (index % 3) * 12;

            return (
              <path
                key={`route-${location.name}`}
                d={`M 520 410 Q ${controlX} ${controlY} ${location.x} ${location.y}`}
                fill="none"
                stroke={location.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="9 10"
                filter="url(#routeGlow)"
                className="service-route"
              />
            );
          })}

          {/* Service dots */}
          {serviceLocations.map((location) => (
            <g key={`point-${location.name}`}>
              <circle
                cx={location.x}
                cy={location.y}
                r="15"
                fill={location.color}
                opacity="0.18"
                className="service-pulse"
              />

              <circle
                cx={location.x}
                cy={location.y}
                r="6"
                fill={location.color}
                stroke="#e0f2fe"
                strokeWidth="2"
                filter="url(#routeGlow)"
              />
            </g>
          ))}

          {/* Bhopal epicentre */}
          <circle
            cx="520"
            cy="410"
            r="31"
            fill="#ef4444"
            opacity="0.2"
            className="bhopal-pulse"
          />

          <circle
            cx="520"
            cy="410"
            r="15"
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth="4"
            filter="url(#routeGlow)"
          />
        </svg>

        {/* Bhopal label */}
        <div
          className="pointer-events-none absolute z-30"
          style={{
            left: "52%",
            top: "58%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="rounded-full border border-red-400/30 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_0_22px_rgba(239,68,68,0.45)] backdrop-blur-md">
            Bhopal HQ
          </div>
        </div>

        {/* Service location labels */}
        {serviceLocations.map((location) => (
          <div
            key={`label-${location.name}`}
            className="pointer-events-none absolute z-30 hidden rounded-md border border-sky-400/20 bg-slate-950/85 px-2 py-1 text-[10px] font-medium text-sky-100 shadow-lg backdrop-blur-sm sm:block"
            style={{
              left: `${location.x / 10}%`,
              top: `${location.y / 7}%`,
              transform: "translate(-50%, 12px)",
            }}
          >
            {location.name}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes routeFlow {
          from {
            stroke-dashoffset: 38;
          }

          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes servicePulse {
          0%, 100% {
            opacity: 0.18;
            transform: scale(1);
          }

          50% {
            opacity: 0.5;
            transform: scale(1.7);
          }
        }

        @keyframes bhopalPulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }

          50% {
            opacity: 0.5;
            transform: scale(1.65);
          }
        }

        .service-route {
          animation: routeFlow 1.6s linear infinite;
        }

        .service-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: servicePulse 2.2s ease-in-out infinite;
        }

        .bhopal-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: bhopalPulse 1.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .service-route,
          .service-pulse,
          .bhopal-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
