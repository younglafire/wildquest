// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CaptureForm } from "./capture-form";

const getUserMedia = vi.fn();
const stopTrack = vi.fn();
const stream = { getTracks: () => [{ stop: stopTrack }] } as unknown as MediaStream;
const canvasContext = {
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(96 * 72 * 4).fill(180),
  })),
};

function setMobileDevice(isMobile: boolean) {
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: isMobile ? "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  });
  Object.defineProperty(navigator, "maxTouchPoints", {
    configurable: true,
    value: isMobile ? 1 : 0,
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({
      matches: isMobile,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

beforeEach(() => {
  setMobileDevice(true);
  getUserMedia.mockReset();
  stopTrack.mockReset();
  getUserMedia.mockResolvedValue(stream);
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  Object.defineProperties(HTMLVideoElement.prototype, {
    videoWidth: { configurable: true, get: () => 1280 },
    videoHeight: { configurable: true, get: () => 720 },
    readyState: {
      configurable: true,
      get: () => HTMLMediaElement.HAVE_CURRENT_DATA,
    },
    play: { configurable: true, value: vi.fn(() => Promise.resolve()) },
  });
  Object.defineProperties(HTMLCanvasElement.prototype, {
    getContext: { configurable: true, value: vi.fn(() => canvasContext) },
    toBlob: {
      configurable: true,
      value: (callback: BlobCallback) =>
        callback(new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" })),
    },
  });
  Object.defineProperties(URL, {
    createObjectURL: { configurable: true, value: vi.fn(() => "blob:capture") },
    revokeObjectURL: { configurable: true, value: vi.fn() },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CaptureForm", () => {
  it("keeps capture unavailable on desktop", async () => {
    setMobileDevice(false);
    render(<CaptureForm />);

    expect(
      await screen.findByRole("heading", {
        name: "Capture is available on a phone",
      }),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Start camera" })).toBeNull();
  });

  it("opens the rear camera after an explicit phone action", async () => {
    const user = userEvent.setup();
    render(<CaptureForm />);

    await user.click(await screen.findByRole("button", { name: "Start camera" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Live rear camera preview")).toBeVisible(),
    );
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
  });

  it("identifies an image selected from the library", async () => {
    const user = userEvent.setup();
    const onIdentify = vi.fn();
    const file = new File([new Uint8Array([1, 2, 3])], "animal.jpg", {
      type: "image/jpeg",
    });
    render(<CaptureForm onIdentify={onIdentify} />);

    await user.upload(
      await screen.findByLabelText("Choose from library"),
      file,
    );
    expect(await screen.findByText("Frame ready to identify")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Identify creature" }));
    expect(onIdentify).toHaveBeenCalledWith(file);
  });

  it("allows image upload on desktop", async () => {
    const user = userEvent.setup();
    const onIdentify = vi.fn();
    const file = new File([new Uint8Array([1, 2, 3])], "animal.png", {
      type: "image/png",
    });
    setMobileDevice(false);
    render(<CaptureForm onIdentify={onIdentify} />);

    await user.upload(await screen.findByLabelText("Choose an image"), file);
    await user.click(screen.getByRole("button", { name: "Identify creature" }));
    expect(onIdentify).toHaveBeenCalledWith(file);
  });

  it("explains a denied camera permission", async () => {
    const user = userEvent.setup();
    getUserMedia.mockRejectedValueOnce(
      new DOMException("Denied", "NotAllowedError"),
    );
    render(<CaptureForm />);

    await user.click(await screen.findByRole("button", { name: "Start camera" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Camera permission was denied",
    );
  });

  it("keeps the camera frame in memory until identification", async () => {
    const user = userEvent.setup();
    const onIdentify = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const storageSpy = vi.spyOn(window.Storage.prototype, "setItem");
    render(<CaptureForm onIdentify={onIdentify} />);

    await user.click(await screen.findByRole("button", { name: "Start camera" }));
    await screen.findByLabelText("Live rear camera preview");
    await user.click(screen.getByRole("button", { name: "Scan this animal" }));

    expect(await screen.findByText("Frame ready to identify")).toBeVisible();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(storageSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Identify creature" }));
    expect(onIdentify).toHaveBeenCalledOnce();
    expect(onIdentify.mock.calls[0][0]).toBeInstanceOf(File);
    expect(stopTrack).toHaveBeenCalledOnce();
  });

  it("stops the camera when the player closes the scanner", async () => {
    const user = userEvent.setup();
    render(<CaptureForm />);

    await user.click(await screen.findByRole("button", { name: "Start camera" }));
    await screen.findByLabelText("Live rear camera preview");
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(stopTrack).toHaveBeenCalledOnce();
    expect(
      await screen.findByRole("button", { name: "Start camera" }),
    ).toBeVisible();
  });
});
