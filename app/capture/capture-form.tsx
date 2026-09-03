"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  IMAGE_INPUT_ACCEPT,
  MAX_IMAGE_BYTES,
  validateImageUpload,
} from "@/app/lib/vision/upload";

type CaptureState =
  | { status: "empty"; error: string | null }
  | {
      status: "ready";
      file: File;
      previewUrl: string;
      error: string | null;
    };

const ERROR_MESSAGES = {
  EMPTY_IMAGE: "That image is empty. Choose another photo.",
  IMAGE_TOO_LARGE: "That image is larger than 4 MB. Choose a smaller photo.",
  UNSUPPORTED_MEDIA_TYPE:
    "Choose a JPEG, PNG, or WebP photo. HEIC is not supported yet.",
} as const;

function formatFileSize(size: number) {
  if (size < 1_000_000) return `${Math.max(1, Math.round(size / 1_000))} KB`;
  return `${(size / 1_000_000).toFixed(1)} MB`;
}

type CaptureFormProps = {
  onIdentify?: (file: File) => void;
  isIdentifying?: boolean;
};

export function CaptureForm({
  onIdentify,
  isIdentifying = false,
}: CaptureFormProps = {}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<CaptureState>({
    status: "empty",
    error: null,
  });

  useEffect(() => {
    if (state.status !== "ready") return;
    const previewUrl = state.previewUrl;
    return () => URL.revokeObjectURL(previewUrl);
  }, [state]);

  const handleSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const validation = validateImageUpload(file);
    if (!validation.valid) {
      const error = ERROR_MESSAGES[validation.code];
      setState((current) =>
        current.status === "ready"
          ? { ...current, error }
          : { status: "empty", error },
      );
      return;
    }

    setState({
      status: "ready",
      file,
      previewUrl: URL.createObjectURL(file),
      error: null,
    });
  };

  const clearSelection = () => {
    setState({ status: "empty", error: null });
    inputRef.current?.focus();
  };

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
          Photograph your discovery
        </h1>
        <p id="capture-help" className="text-sm leading-relaxed text-muted">
          Use your rear camera on mobile or choose a photo on desktop. Your
          image stays in this browser and is not uploaded yet.
        </p>
      </div>

      <input
        ref={inputRef}
        id="wildlife-photo"
        name="image"
        type="file"
        accept={IMAGE_INPUT_ACCEPT}
        capture="environment"
        aria-describedby="capture-help capture-requirements capture-error"
        className="sr-only"
        onChange={handleSelection}
      />

      <div className="mt-6 overflow-hidden rounded-2xl border border-border-low bg-cream/40">
        {state.status === "ready" ? (
          <div className="p-3 sm:p-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-background">
              <Image
                src={state.previewUrl}
                alt={`Preview of ${state.file.name}`}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {state.file.name}
                </p>
                <p className="text-xs text-muted">
                  {formatFileSize(state.file.size)} · Photo ready
                </p>
              </div>
              <div className="flex gap-2">
                <label
                  htmlFor="wildlife-photo"
                  className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:flex-none"
                >
                  Retake / Choose another
                </label>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-cream"
                >
                  Clear
                </button>
              </div>
            </div>
            {onIdentify && (
              <button
                type="button"
                disabled={isIdentifying}
                onClick={() => onIdentify(state.file)}
                className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
              >
                {isIdentifying ? "Verifying discovery…" : "Identify discovery"}
              </button>
            )}
          </div>
        ) : (
          <label
            htmlFor="wildlife-photo"
            className="flex min-h-72 cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center transition hover:bg-cream/70"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3Z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </span>
            <span>
              <span className="block text-lg font-semibold">
                Take or choose a photo
              </span>
              <span className="mt-1 block text-sm text-muted">
                Mobile camera · Desktop file picker
              </span>
            </span>
          </label>
        )}
      </div>

      <p
        id="capture-error"
        role={state.error ? "alert" : undefined}
        className="mt-3 min-h-5 text-sm font-medium text-destructive"
      >
        {state.error}
      </p>
      <p id="capture-requirements" className="mt-1 text-xs text-muted">
        JPEG, PNG, or WebP · Maximum {MAX_IMAGE_BYTES / 1_000_000} MB · One
        photo
      </p>
    </section>
  );
}
