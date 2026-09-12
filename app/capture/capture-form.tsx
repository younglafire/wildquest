"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { validateImageUpload } from "@/app/lib/vision/upload";
import { getCameraGuidance, type CameraGuidance } from "./camera-guidance";

type CaptureState =
  | { status: "empty" }
  | { status: "ready"; file: File; previewUrl: string };

type CameraStatus = "off" | "starting" | "ready";
type CaptureDevice = "checking" | "mobile" | "desktop";

const CAMERA_GUIDANCE_COPY: Record<CameraGuidance, string> = {
  searching: "Checking the frame…",
  add_light: "Move into brighter light",
  hold_still: "Hold your phone still",
  ready: "Ready to scan this animal",
};

function isMobileCaptureDevice() {
  if (typeof window === "undefined") return false;
  return (
    /Android.*Mobile|iPhone|iPod/i.test(navigator.userAgent) ||
    (/Android|Mobile/i.test(navigator.userAgent) && navigator.maxTouchPoints > 0)
  );
}

function getCameraError(error: unknown) {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Camera permission was denied. Allow camera access and try again.";
  }
  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No rear camera is available on this phone.";
  }
  return "The camera could not be opened. Check the browser permission and try again.";
}

type CaptureFormProps = {
  onIdentify?: (file: File) => void;
  isIdentifying?: boolean;
};

export function CaptureForm({
  onIdentify,
  isIdentifying = false,
}: CaptureFormProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastLumaRef = useRef<Uint8Array | null>(null);
  const cameraGeneration = useRef(0);
  const framePending = useRef(false);
  const [state, setState] = useState<CaptureState>({ status: "empty" });
  const [device, setDevice] = useState<CaptureDevice>("checking");
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("off");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [guidance, setGuidance] = useState<CameraGuidance>("searching");
  const [isCapturingFrame, setIsCapturingFrame] = useState(false);

  const selectImage = (file: File | undefined) => {
    if (!file) return;
    const validation = validateImageUpload(file);
    if (!validation.valid) {
      setCameraError(
        validation.code === "IMAGE_TOO_LARGE"
          ? "That photo is too large. Choose an image smaller than 4 MB."
          : "Choose a JPEG, PNG, or WebP photo.",
      );
      return;
    }
    stopCamera();
    setCameraError(null);
    setState({
      status: "ready",
      file,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const stopCamera = () => {
    cameraGeneration.current += 1;
    framePending.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    lastLumaRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraStatus("off");
    setGuidance("searching");
    setIsCapturingFrame(false);
  };

  useEffect(() => {
    queueMicrotask(() => setDevice(isMobileCaptureDevice() ? "mobile" : "desktop"));
  }, []);

  useEffect(() => {
    if (state.status !== "ready") return;
    const previewUrl = state.previewUrl;
    return () => URL.revokeObjectURL(previewUrl);
  }, [state]);

  useEffect(() => {
    return () => {
      cameraGeneration.current += 1;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!streamRef.current || !videoRef.current) return;
    videoRef.current.srcObject = streamRef.current;
  }, [cameraStatus]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" || cameraStatus === "off") return;
      stopCamera();
      setCameraError("Camera paused while WildQuest was in the background.");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  useEffect(() => {
    if (cameraStatus !== "ready") return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    const samplingInterval = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0 || video.videoHeight === 0) return;
      canvas.width = 96;
      canvas.height = 72;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const sample = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = getCameraGuidance(sample.data, lastLumaRef.current);
      lastLumaRef.current = result.luma;
      setGuidance(result.guidance);
    }, 500);
    return () => window.clearInterval(samplingInterval);
  }, [cameraStatus]);

  const startCamera = async () => {
    if (cameraStatus !== "off" || !isMobileCaptureDevice()) return;
    const generation = ++cameraGeneration.current;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Live camera is unavailable here. Use HTTPS in a supported mobile browser.",
      );
      return;
    }
    setCameraError(null);
    setCameraStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (generation !== cameraGeneration.current || document.visibilityState === "hidden") {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setCameraStatus("ready");
    } catch (error) {
      if (generation !== cameraGeneration.current) return;
      setCameraStatus("off");
      setCameraError(getCameraError(error));
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (framePending.current || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    const generation = cameraGeneration.current;
    framePending.current = true;
    setIsCapturingFrame(true);
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context || canvas.width === 0 || canvas.height === 0) {
      framePending.current = false;
      setIsCapturingFrame(false);
      setCameraError("The camera frame is not ready yet. Try again in a moment.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (generation !== cameraGeneration.current) return;
        framePending.current = false;
        setIsCapturingFrame(false);
        if (!blob) {
          setCameraError("The camera frame could not be prepared. Try again.");
          return;
        }
        const file = new File([blob], `wildquest-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        if (!validateImageUpload(file).valid) {
          setCameraError("The camera frame is invalid. Try again.");
          return;
        }
        selectImage(file);
      },
      "image/jpeg",
      0.88,
    );
  };

  const resetCapture = () => {
    setState({ status: "empty" });
    setCameraError(null);
  };

  if (device === "checking") {
    return <div className="mx-auto min-h-72 w-full max-w-2xl" aria-busy="true" />;
  }

  if (device === "desktop") {
    return (
      <section
        className="mx-auto w-full max-w-2xl rounded-2xl p-6 text-center sm:rounded-3xl sm:p-8"
        style={{
          background: "#1c1810",
          border: "1px solid #3a2e1e",
          boxShadow: "0 24px 90px -55px rgba(0,0,0,0.8)",
        }}
      >
        <p className="wax-badge wax-badge-forest">Neural Bio-Scanner</p>
        <h1
          className="mt-3 text-3xl font-black tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
        >
          Capture is available on a phone
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "#8a7a62" }}>
          Upload a photo here, or open WildQuest on your mobile phone to scan
          wildlife directly with your phone camera.
        </p>
        <label className="btn-guild mt-6 cursor-pointer">
          Choose an image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => selectImage(event.target.files?.[0])}
          />
        </label>
        {state.status === "ready" && (
          <div className="mt-6 text-left">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-xl"
              style={{ background: "#100e09", border: "1px solid #3a2e1e" }}
            >
              <Image
                src={state.previewUrl}
                alt="Selected animal photo"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            {onIdentify && (
              <button
                type="button"
                disabled={isIdentifying}
                onClick={() => onIdentify(state.file)}
                className="btn-guild mt-4 w-full"
              >
                {isIdentifying ? "Identifying creature…" : "Identify creature"}
              </button>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      aria-labelledby="capture-heading"
      className="mx-auto w-full max-w-2xl rounded-2xl p-4 sm:rounded-3xl sm:p-7"
      style={{
        background: "#1c1810",
        border: "1px solid #3a2e1e",
        boxShadow: "0 24px 90px -55px rgba(0,0,0,0.8)",
      }}
    >
      <div className="space-y-1.5 text-center sm:text-left">
        <div className="inline-flex">
          <p className="wax-badge wax-badge-forest">Neural Bio-Scanner</p>
        </div>
        <h1
          id="capture-heading"
          className="text-2xl font-black tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
        >
          Scan your discovery
        </h1>
        <p id="capture-help" className="text-xs leading-relaxed sm:text-sm" style={{ color: "#8a7a62" }}>
          Target one animal in frame. Keep steady to lock the neural scan.
        </p>
      </div>

      <div
        className="mt-4 overflow-hidden rounded-2xl"
        style={{
          background: "#100e09",
          border: "1px solid #3a2e1e",
        }}
      >
        {state.status === "ready" ? (
          <div className="p-3 sm:p-4">
            <div
              className="relative aspect-[4/3] max-h-[50vh] overflow-hidden rounded-xl"
              style={{ background: "#0a0805", border: "1px solid #3a2e1e" }}
            >
              <Image
                src={state.previewUrl}
                alt="Captured camera frame"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <p
              className="mt-3 text-center text-xs font-bold uppercase tracking-wider sm:text-left"
              style={{ fontFamily: "var(--font-display)", color: "#c8a96e" }}
            >
              Frame ready to identify
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={resetCapture}
                disabled={isIdentifying}
                className="flex min-h-14 items-center justify-center rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                style={{
                  fontFamily: "var(--font-display)",
                  border: "1px solid #3a2e1e",
                  color: "#8a7a62",
                  background: "rgba(58,46,30,0.2)",
                }}
              >
                Scan again
              </button>
              {onIdentify && (
                <button
                  type="button"
                  disabled={isIdentifying}
                  onClick={() => onIdentify(state.file)}
                  className="btn-guild w-full"
                >
                  {isIdentifying ? "Identifying creature…" : "Identify creature"}
                </button>
              )}
            </div>
          </div>
        ) : cameraStatus !== "off" ? (
          <div className="relative h-[55vh] min-h-[340px] max-h-[520px] w-full overflow-hidden bg-[#0a0805]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Live rear camera preview"
              className="absolute inset-0 h-full w-full object-cover"
              onLoadedMetadata={(event) => {
                void event.currentTarget.play().catch(() => {
                  stopCamera();
                  setCameraError("Camera playback was interrupted. Open the camera again.");
                });
              }}
            />
            {/* Tactical HUD Reticle Viewfinder */}
            <div className="pointer-events-none absolute inset-4 rounded-2xl sm:inset-6">
              {/* Corner brackets */}
              <div className="absolute -left-0.5 -top-0.5 h-4 w-4 border-l-2 border-t-2 border-[#c8a96e]" />
              <div className="absolute -right-0.5 -top-0.5 h-4 w-4 border-r-2 border-t-2 border-[#c8a96e]" />
              <div className="absolute -bottom-0.5 -left-0.5 h-4 w-4 border-b-2 border-l-2 border-[#c8a96e]" />
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 border-b-2 border-r-2 border-[#c8a96e]" />

              {/* Crosshair point */}
              <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c8a96e] shadow-[0_0_16px_4px_rgba(200,169,110,0.8)]" />

              {/* Guidance status pill */}
              <div
                aria-live="polite"
                className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full px-3 py-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md"
                style={{
                  background: "rgba(16,14,9,0.88)",
                  color: guidance === "ready" ? "#6aab7a" : "#c8a96e",
                  border: "1px solid rgba(200,169,110,0.35)",
                }}
              >
                {cameraStatus === "starting"
                  ? "Opening camera…"
                  : isCapturingFrame
                    ? "Locking frame…"
                    : CAMERA_GUIDANCE_COPY[guidance]}
              </div>

              {/* Animated scan line */}
              {cameraStatus === "ready" && !isCapturingFrame && (
                <span className="scan-line absolute inset-x-3 top-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#c8a96e] to-transparent shadow-[0_0_12px_2px_rgba(200,169,110,0.6)]" />
              )}
            </div>

            {/* Bottom action controls */}
            <div className="absolute inset-x-4 bottom-4 flex gap-2.5 sm:gap-3">
              <button
                type="button"
                disabled={cameraStatus !== "ready" || isCapturingFrame}
                onClick={captureFrame}
                className="btn-guild min-h-14 flex-1 text-xs font-black uppercase tracking-wider shadow-2xl"
              >
                {isCapturingFrame ? "Locking target…" : "Scan this animal"}
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="min-h-14 rounded-xl border border-[#3a2e1e] bg-[#100e09]/90 px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#f0e8d4] backdrop-blur-md transition-colors hover:border-[#c8a96e]"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-6 text-center sm:p-8">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(200,169,110,0.2), rgba(200,169,110,0.05))",
                border: "1px solid rgba(200,169,110,0.3)",
                color: "#c8a96e",
              }}
              aria-hidden="true"
            >
              ⌁
            </div>
            <div className="w-full max-w-sm space-y-2">
              <p
                className="text-base font-bold sm:text-lg"
                style={{ fontFamily: "var(--font-display)", color: "#f0e8d4" }}
              >
                Live Camera Scanner
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#8a7a62" }}>
                Point rear camera at the creature. Photos are processed locally in memory.
              </p>
              <button
                type="button"
                onClick={() => void startCamera()}
                className="btn-guild mt-3 w-full"
              >
                Start camera
              </button>
              <label
                className="mt-2 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl text-xs font-bold uppercase tracking-wider transition-colors active:scale-98"
                style={{
                  fontFamily: "var(--font-display)",
                  border: "1px solid #3a2e1e",
                  color: "#c8a96e",
                  background: "rgba(200,169,110,0.06)",
                }}
              >
                Choose from library
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  className="sr-only"
                  onChange={(event) => selectImage(event.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        )}
      </div>
      {cameraError && (
        <p
          role="alert"
          className="mt-3 rounded-lg p-3 text-xs font-semibold sm:text-sm"
          style={{
            background: "rgba(192,57,43,0.12)",
            color: "#f8c8c4",
            border: "1px solid rgba(192,57,43,0.3)",
          }}
        >
          {cameraError}
        </p>
      )}
    </section>
  );
}
