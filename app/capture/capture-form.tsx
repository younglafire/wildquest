"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { validateImageUpload } from "@/app/lib/vision/upload";
import { getCameraGuidance, type CameraGuidance } from "./camera-guidance";

type CaptureState =
  { status: "empty" } | { status: "ready"; file: File; previewUrl: string };

type CameraStatus = "off" | "starting" | "ready";
type CaptureDevice = "checking" | "mobile" | "desktop";

const CAMERA_GUIDANCE_COPY: Record<CameraGuidance, string> = {
  searching: "Finding the animal...",
  add_light: "Find brighter light",
  hold_still: "Hold your phone still",
  ready: "Animal locked",
};

function isMobileCaptureDevice() {
  if (typeof window === "undefined") return false;
  return (
    /Android.*Mobile|iPhone|iPod/i.test(navigator.userAgent) ||
    (/Android|Mobile/i.test(navigator.userAgent) &&
      navigator.maxTouchPoints > 0)
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
  onReset?: () => void;
  isIdentifying?: boolean;
  identificationError?: string | null;
};

export function CaptureForm({
  onIdentify,
  onReset,
  isIdentifying = false,
  identificationError = null,
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
    queueMicrotask(() =>
      setDevice(isMobileCaptureDevice() ? "mobile" : "desktop"),
    );
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
      if (document.visibilityState === "visible" || cameraStatus === "off")
        return;
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
      if (
        !video ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }
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
      if (
        generation !== cameraGeneration.current ||
        document.visibilityState === "hidden"
      ) {
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
    if (
      framePending.current ||
      !video ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return;
    }
    const generation = cameraGeneration.current;
    framePending.current = true;
    setIsCapturingFrame(true);
    const canvas = document.createElement("canvas");
    const scale = Math.min(
      1,
      1600 / Math.max(video.videoWidth, video.videoHeight),
    );
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context || canvas.width === 0 || canvas.height === 0) {
      framePending.current = false;
      setIsCapturingFrame(false);
      setCameraError(
        "The camera frame is not ready yet. Try again in a moment.",
      );
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
        const previewUrl = URL.createObjectURL(file);
        stopCamera();
        setState({ status: "ready", file, previewUrl });
        onIdentify?.(file);
      },
      "image/jpeg",
      0.88,
    );
  };

  const resetCapture = () => {
    setState({ status: "empty" });
    setCameraError(null);
    onReset?.();
  };

  const closeScanner = () => {
    if (cameraStatus !== "off") {
      stopCamera();
      return;
    }
    if (state.status === "ready" && !isIdentifying) {
      resetCapture();
      return;
    }
    window.history.back();
  };

  if (device === "checking") {
    return <div className="fixed inset-0 z-50 bg-[#080906]" aria-busy="true" />;
  }

  if (device === "desktop") {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#3a2e1e] bg-[#1c1810] p-8 text-center shadow-2xl">
        <p className="wax-badge wax-badge-forest">Mobile field tool</p>
        <h1
          className="mt-4 text-3xl font-black tracking-tight text-[#f0e8d4]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Hunt with your phone
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#8a7a62]">
          Open WildQuest on a phone to use the live rear-camera scanner. Your
          collection, quests, and battles remain available here.
        </p>
      </section>
    );
  }

  const cameraIsOpen = cameraStatus !== "off";

  return (
    <section
      aria-labelledby="capture-heading"
      className="fixed inset-0 z-50 overflow-hidden bg-[#080906] text-white"
    >
      {state.status === "ready" ? (
        <Image
          src={state.previewUrl}
          alt="Captured animal"
          fill
          unoptimized
          priority
          className="object-cover"
        />
      ) : cameraIsOpen ? (
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
              setCameraError(
                "Camera playback was interrupted. Open the camera again.",
              );
            });
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#233126_0%,#10150f_42%,#080906_78%)]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
      <header className="absolute inset-x-0 top-0 z-10 px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-lg items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d7c18e]">
              WildQuest field scanner
            </p>
            <h1
              id="capture-heading"
              className="mt-1 text-xl font-black tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isIdentifying
                ? "Reading the field signature"
                : "Find one animal"}
            </h1>
          </div>
          <button
            type="button"
            onClick={closeScanner}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/35 text-xl backdrop-blur-md"
            aria-label="Close scanner"
          >
            ×
          </button>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-6 bottom-[9.5rem] top-[7rem] mx-auto max-w-lg">
        <div
          className={`capture-focus-frame relative h-full w-full rounded-[2rem] ${guidance === "ready" ? "is-ready" : ""}`}
        >
          <span className="capture-corner capture-corner-top-left" />
          <span className="capture-corner capture-corner-top-right" />
          <span className="capture-corner capture-corner-bottom-left" />
          <span className="capture-corner capture-corner-bottom-right" />
          {cameraStatus === "ready" && !isCapturingFrame && (
            <span className="capture-scan-beam" />
          )}
          {isIdentifying && (
            <div className="absolute inset-0 grid place-items-center rounded-[2rem] bg-black/25 backdrop-blur-[2px]">
              <div className="text-center">
                <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-2 border-[#d7c18e]/30 border-t-[#f3d98c]" />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.24em] text-[#f3d98c]">
                  Identifying animal
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-lg text-center">
          {identificationError ? (
            <p
              role="alert"
              className="mb-4 rounded-2xl border border-amber-200/30 bg-[#21170b]/90 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-50 backdrop-blur-md"
            >
              {identificationError}
            </p>
          ) : cameraError ? (
            <p
              role="alert"
              className="mb-4 rounded-2xl border border-red-300/25 bg-red-950/70 px-4 py-3 text-sm text-red-100 backdrop-blur-md"
            >
              {cameraError}
            </p>
          ) : (
            <p
              aria-live="polite"
              className="mb-4 text-sm font-bold drop-shadow-lg"
            >
              {isIdentifying
                ? "Keep WildQuest open while the scan finishes"
                : cameraStatus === "starting"
                  ? "Opening the rear camera..."
                  : cameraStatus === "ready"
                    ? CAMERA_GUIDANCE_COPY[guidance]
                    : "Fill the frame with the animal and keep the phone level"}
            </p>
          )}

          {state.status === "ready" ? (
            !isIdentifying && (
              <button
                type="button"
                onClick={resetCapture}
                className="min-h-12 rounded-full border border-white/25 bg-black/55 px-6 text-xs font-black uppercase tracking-[0.18em] backdrop-blur-md"
              >
                {identificationError
                  ? "Scan another animal"
                  : "Try another photo"}
              </button>
            )
          ) : cameraIsOpen ? (
            <div className="flex items-center justify-center">
              <button
                type="button"
                disabled={cameraStatus !== "ready" || isCapturingFrame}
                onClick={captureFrame}
                className="capture-shutter grid h-[4.75rem] w-[4.75rem] place-items-center rounded-full border-[3px] border-white/90 disabled:opacity-40"
                aria-label="Scan this animal"
              >
                <span className="h-[3.65rem] w-[3.65rem] rounded-full bg-[#f3d98c] shadow-[0_0_28px_rgba(243,217,140,0.45)]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void startCamera()}
              className="btn-guild min-h-14 w-full"
            >
              Open camera
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
