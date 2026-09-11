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
  return /Android.*Mobile|iPhone|iPod/i.test(navigator.userAgent);
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
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-border-low bg-card p-6 text-center shadow-[0_24px_90px_-55px_rgba(0,0,0,0.55)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          Expedition capture
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Capture is available on a phone
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Upload a photo here, or open WildQuest on your phone to scan an
          animal with its rear camera.
        </p>
        <label className="mt-6 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-background">
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
                className="mt-4 min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:pointer-events-none disabled:opacity-60"
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
      className="mx-auto w-full max-w-2xl rounded-3xl border border-border-low bg-card p-5 shadow-[0_24px_90px_-55px_rgba(0,0,0,0.55)] sm:p-8"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          Expedition capture
        </p>
        <h1
          id="capture-heading"
          className="text-3xl font-black tracking-tight sm:text-4xl"
        >
          Scan your discovery
        </h1>
        <p id="capture-help" className="text-sm leading-relaxed text-muted">
          Use the rear camera. The selected frame stays in memory until you
          identify it.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border-low bg-cream/40">
        {state.status === "ready" ? (
          <div className="p-3 sm:p-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-background">
              <Image
                src={state.previewUrl}
                alt="Captured camera frame"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-sm font-semibold">
              Frame ready to identify
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={resetCapture}
                disabled={isIdentifying}
                className="min-h-12 rounded-xl border border-border px-4 py-2.5 text-sm font-bold"
              >
                Scan again
              </button>
              {onIdentify && (
                <button
                  type="button"
                  disabled={isIdentifying}
                  onClick={() => onIdentify(state.file)}
                  className="min-h-12 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:pointer-events-none disabled:opacity-60"
                >
                  {isIdentifying ? "Identifying creature…" : "Identify creature"}
                </button>
              )}
            </div>
          </div>
        ) : cameraStatus !== "off" ? (
          <div className="relative min-h-72 overflow-hidden bg-slate-950">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Live rear camera preview"
              className="absolute inset-0 h-full min-h-72 w-full object-contain"
              onLoadedMetadata={(event) => {
                void event.currentTarget.play().catch(() => {
                  stopCamera();
                  setCameraError("Camera playback was interrupted. Open the camera again.");
                });
              }}
            />
            <div className="pointer-events-none absolute inset-5 rounded-3xl border-2 border-white/70 shadow-[0_0_0_999px_rgba(0,0,0,0.25)]">
              <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_24px_8px_rgba(110,231,183,0.6)]" />
              <span
                aria-live="polite"
                className="absolute left-1/2 top-3 -translate-x-1/2 text-center text-xs font-bold uppercase tracking-[0.2em] text-white drop-shadow"
              >
                {cameraStatus === "starting"
                  ? "Opening camera…"
                  : isCapturingFrame
                    ? "Preparing frame…"
                    : CAMERA_GUIDANCE_COPY[guidance]}
              </span>
              {cameraStatus === "ready" && !isCapturingFrame && (
                <span className="scan-line absolute inset-x-2 top-1/2 h-0.5 bg-emerald-300/90 shadow-[0_0_12px_4px_rgba(110,231,183,0.6)]" />
              )}
            </div>
            <div className="absolute inset-x-5 bottom-5 flex gap-3">
              <button
                type="button"
                disabled={cameraStatus !== "ready" || isCapturingFrame}
                onClick={captureFrame}
                className="min-h-12 flex-1 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg disabled:opacity-50"
              >
                {isCapturingFrame ? "Preparing…" : "Scan this animal"}
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="min-h-12 rounded-xl border border-white/70 bg-black/40 px-4 py-3 text-sm font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm"
              aria-hidden="true"
            >
              ⌁
            </span>
            <div className="max-w-sm">
              <p className="text-lg font-semibold">Scan with camera</p>
              <p className="mt-1 text-sm text-muted">
                Point the rear camera at one animal, keep it centered, then hold
                still.
              </p>
              <button
                type="button"
                onClick={() => void startCamera()}
                className="mt-4 min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
              >
                Start camera
              </button>
              <label className="mt-2 flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-bold">
                Choose from library
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => selectImage(event.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        )}
      </div>
      {cameraError && (
        <p role="alert" className="mt-3 text-sm font-semibold text-destructive">
          {cameraError}
        </p>
      )}
    </section>
  );
}
