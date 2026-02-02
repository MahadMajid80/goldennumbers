"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

type DeviceType = "iphone-14-pro-max" | "nokia-3310" | "samsung-s25-ultra";

type CallPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  number: string;
  network: "Jazz" | "Ufone" | "Telenor" | "Warid" | "Zong";
  deviceType?: DeviceType;
};

const getNetworkLogo = (network: string) => {
  const logos: Record<string, string> = {
    Jazz: "/jazz-logo.png",
    Ufone: "/ufone-logo (1).png",
    Telenor: "/telenor-logo-icon (3).png",
    Warid: "/596_warid_telecom_logo-Photoroom (1).png",
    Zong: "/zong-logo (1).png",
  };
  return logos[network] || "/jazz-logo.png";
};

const CallPreviewModal = ({
  isOpen,
  onClose,
  number,
  network,
  deviceType = "iphone-14-pro-max",
}: CallPreviewModalProps) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      setCurrentTime(`${displayHours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderIPhonePreview = () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-[430px] h-[932px] overflow-hidden rounded-[50px] border-[8px] border-gray-900 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-black to-blue-950"></div>

        <div className="absolute top-[59px] left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white/60 rounded-sm"></div>
            <span
              className="text-white/80 text-[14px] font-medium"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              mobile
            </span>
          </div>
        </div>

        <div className="absolute top-[12px] left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-[126px] h-[37px] bg-black rounded-full flex items-center justify-center relative shadow-lg">
            <div className="absolute right-[8px] w-[6px] h-[6px] bg-white/60 rounded-full"></div>
          </div>
        </div>

        <div className="flex flex-col h-full relative z-10">
          <div className="flex items-center justify-center pt-[180px] pb-[400px]">
            <div
              className="text-center w-full"
              style={{
                paddingLeft: "4px",
                paddingRight: "4px",
                maxWidth: "100%",
              }}
            >
              <p
                className="font-light text-white tracking-[-1.5px] leading-tight whitespace-nowrap"
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize:
                    number.length > 14
                      ? "40px"
                      : number.length > 12
                      ? "48px"
                      : number.length > 10
                      ? "56px"
                      : "64px",
                  transform: "scale(1)",
                  display: "inline-block",
                }}
              >
                {number}
              </p>
            </div>
          </div>

          <div className="absolute bottom-[120px] left-0 right-0 px-8">
            <div className="flex flex-col gap-[60px]">
              <div className="flex items-center justify-between">
                <button className="flex flex-col items-center gap-[12px] group">
                  <div className="w-[64px] h-[64px] rounded-full bg-white/20 flex items-center justify-center shadow-lg group-active:scale-90 transition-transform backdrop-blur-sm">
                    <svg
                      className="w-[28px] h-[28px] text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-white text-[13px] font-medium"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}
                  >
                    Remind Me
                  </span>
                </button>

                <button className="flex flex-col items-center gap-[12px] group">
                  <div className="w-[64px] h-[64px] rounded-full bg-white/20 flex items-center justify-center shadow-lg group-active:scale-90 transition-transform backdrop-blur-sm">
                    <svg
                      className="w-[28px] h-[28px] text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-white text-[13px] font-medium"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}
                  >
                    Message
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <button className="flex flex-col items-center gap-[12px] group">
                  <div className="w-[64px] h-[64px] rounded-full bg-[#FF3B30] flex items-center justify-center shadow-lg group-active:scale-90 transition-transform">
                    <svg
                      className="w-[28px] h-[28px] text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      style={{ transform: "rotate(135deg)" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-white text-[13px] font-medium"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}
                  >
                    Decline
                  </span>
                </button>

                <button className="flex flex-col items-center gap-[12px] group">
                  <div className="w-[64px] h-[64px] rounded-full bg-[#34C759] flex items-center justify-center shadow-lg group-active:scale-90 transition-transform">
                    <svg
                      className="w-[28px] h-[28px] text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-white text-[13px] font-medium"
                    style={{
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}
                  >
                    Accept
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[10px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] bg-white/30 rounded-full z-10"></div>
      </div>

      <button
        onClick={onClose}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#FFD700] text-black px-6 py-2 rounded-full font-semibold hover:bg-[#FFA500] transition-colors z-50"
      >
        Close Preview
      </button>
    </div>
  );

  const renderNokia3310Preview = () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
      <div
        className="relative w-full max-w-[240px] h-[400px] overflow-hidden rounded-[6px] shadow-2xl"
        style={{
          borderTop: "12px solid #1a202c",
          borderBottom: "12px solid #1a202c",
          borderLeft: "8px solid #e2e8f0",
          borderRight: "8px solid #e2e8f0",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "#e6e8c4" }}
        ></div>

        <div className="absolute top-[10px] left-[6px] flex flex-col items-center gap-0.5 z-10">
          <div className="flex flex-col gap-[1px]">
            <div className="w-[4px] h-[5px] bg-black"></div>
            <div className="w-[4px] h-[5px] bg-black"></div>
            <div className="w-[4px] h-[5px] bg-black"></div>
            <div className="w-[4px] h-[5px] bg-black"></div>
            <div className="w-[4px] h-[3px] bg-gray-500"></div>
          </div>
          <div
            className="text-black text-[9px] font-bold mt-0.5"
            style={{ fontFamily: "monospace" }}
          >
            T
          </div>
        </div>

        <div className="absolute top-[10px] right-[6px] flex flex-col items-center gap-0.5 z-10">
          <div className="flex flex-col gap-[1px]">
            <div className="w-[4px] h-[5px] bg-black"></div>
            <div className="w-[4px] h-[5px] bg-black"></div>
            <div className="w-[4px] h-[5px] bg-black"></div>
            <div className="w-[4px] h-[5px] bg-black"></div>
            <div className="w-[4px] h-[5px] bg-black"></div>
          </div>
          <div
            className="text-black text-[9px] font-bold mt-0.5"
            style={{ fontFamily: "monospace" }}
          >
            D
          </div>
        </div>

        <div className="flex flex-col h-full pt-[45px] pb-[90px] px-4 relative z-10">
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-6">
              <div
                className="text-black text-[18px] font-bold"
                style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}
              >
                {number}
              </div>
            </div>

            <div className="w-full mt-auto">
              <div
                className="text-black text-[16px] font-bold text-center py-3 border-2 border-black"
                style={{ fontFamily: "monospace", backgroundColor: "#d4d6b8" }}
              >
                Answer
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#FFD700] text-black px-6 py-2 rounded-full font-semibold hover:bg-[#FFA500] transition-colors z-50"
      >
        Close Preview
      </button>
    </div>
  );

  const renderSamsungS25UltraPreview = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const displayTime = `${hours}:${minutes}`;

    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
        <div className="relative w-full max-w-[412px] h-[915px] overflow-hidden rounded-[40px] border-[6px] border-gray-900 shadow-2xl">
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-orange-900"
            style={{
              background:
                "linear-gradient(135deg, #6b21a8 0%, #4c1d95 50%, #ea580c 100%)",
            }}
          ></div>

          <div className="absolute top-[12px] left-0 right-0 px-6 flex items-center justify-between z-20">
            <span
              className="text-white text-[14px] font-medium"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              {displayTime}
            </span>
            <div className="absolute left-1/2 transform -translate-x-1/2 w-[6px] h-[6px] bg-white rounded-full"></div>
            <div className="flex items-center gap-1">
              <svg
                className="w-[16px] h-[10px]"
                viewBox="0 0 16 10"
                fill="none"
              >
                <rect
                  x="0.5"
                  y="3.5"
                  width="2.5"
                  height="6"
                  rx="0.5"
                  fill="white"
                />
                <rect
                  x="3.5"
                  y="1.5"
                  width="2.5"
                  height="8"
                  rx="0.5"
                  fill="white"
                />
                <rect
                  x="6.5"
                  y="0.5"
                  width="2.5"
                  height="9"
                  rx="0.5"
                  fill="white"
                />
                <rect
                  x="9.5"
                  y="2.5"
                  width="2.5"
                  height="7"
                  rx="0.5"
                  fill="white"
                />
              </svg>
              <span
                className="text-white text-[12px] font-medium"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                100
              </span>
            </div>
          </div>

          <div className="flex flex-col h-full pt-[60px] pb-[120px] relative z-10">
            <div className="text-center mb-4">
              <div
                className="text-white/90 text-[13px] font-medium mb-6"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                HD+ Incoming call
              </div>
              <p
                className="font-bold text-white whitespace-nowrap mb-8"
                style={{
                  fontFamily: "Roboto, sans-serif",
                  fontSize:
                    number.length > 14
                      ? "36px"
                      : number.length > 12
                      ? "42px"
                      : number.length > 10
                      ? "48px"
                      : "54px",
                  fontWeight: 700,
                }}
              >
                {number}
              </p>
            </div>

            <div className="flex-1 flex items-center justify-center mb-8">
              <button className="bg-white/20 rounded-xl px-6 py-3 flex items-center gap-2 backdrop-blur-sm border border-white/30">
                <svg
                  className="w-[16px] h-[16px] text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                <span
                  className="text-white text-[14px] font-medium"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  Call assist
                </span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-[160px] px-6">
              <button className="flex flex-col items-center gap-[12px] group">
                <div className="w-[64px] h-[64px] rounded-full bg-[#4CAF50] flex items-center justify-center shadow-lg group-active:scale-90 transition-transform">
                  <svg
                    className="w-[28px] h-[28px] text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
              </button>

              <button className="flex flex-col items-center gap-[12px] group">
                <div className="w-[64px] h-[64px] rounded-full bg-[#F44336] flex items-center justify-center shadow-lg group-active:scale-90 transition-transform">
                  <svg
                    className="w-[28px] h-[28px] text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    style={{ transform: "rotate(45deg)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
              </button>
            </div>

            <div className="mt-8 text-center">
              <div className="w-[40px] h-[2px] bg-white/30 mx-auto mb-2"></div>
              <button
                className="text-white/70 text-[14px] font-medium"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                Send message
              </button>
            </div>
          </div>

          <div className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] bg-white/30 rounded-full z-10"></div>
        </div>

        <button
          onClick={onClose}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#FFD700] text-black px-6 py-2 rounded-full font-semibold hover:bg-[#FFA500] transition-colors z-50"
        >
          Close Preview
        </button>
      </div>
    );
  };

  if (!isOpen) return null;

  if (deviceType === "nokia-3310") {
    return renderNokia3310Preview();
  } else if (deviceType === "samsung-s25-ultra") {
    return renderSamsungS25UltraPreview();
  } else {
    return renderIPhonePreview();
  }
};

export default CallPreviewModal;
