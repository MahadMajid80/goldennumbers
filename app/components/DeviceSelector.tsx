"use client";

import { useState, useRef, useEffect } from "react";

type DeviceType = "iphone-14-pro-max" | "nokia-3310" | "samsung-s25-ultra";

type DeviceSelectorProps = {
  onSelectDevice: (device: DeviceType) => void;
};

const devices: { value: DeviceType; label: string }[] = [
  { value: "iphone-14-pro-max", label: "iPhone 14 Pro Max" },
  { value: "samsung-s25-ultra", label: "Samsung S25 Ultra" },
];

const DeviceSelector = ({ onSelectDevice }: DeviceSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] =
    useState<DeviceType>("iphone-14-pro-max");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (device: DeviceType) => {
    setSelectedDevice(device);
    setIsOpen(false);
    onSelectDevice(device);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black p-2 rounded-full hover:bg-gray-900 transition-colors relative"
        title="Preview Call"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 min-w-[180px] z-50">
          <div className="py-1">
            {devices.map((device) => (
              <button
                key={device.value}
                onClick={() => handleSelect(device.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                  selectedDevice === device.value
                    ? "bg-gray-700 text-[#FFD700]"
                    : "text-white"
                }`}
              >
                {device.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceSelector;
export type { DeviceType };
