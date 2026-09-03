// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_IMAGE_BYTES } from "@/app/lib/vision/upload";
import { CaptureForm } from "./capture-form";

let objectUrlSequence = 0;
const createObjectURL = vi.fn(() => {
  objectUrlSequence += 1;
  return `blob:capture-${objectUrlSequence}`;
});
const revokeObjectURL = vi.fn();

function getPhotoInput() {
  return screen.getByLabelText(/take or choose a photo/i) as HTMLInputElement;
}

beforeEach(() => {
  objectUrlSequence = 0;
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  Object.defineProperties(URL, {
    createObjectURL: { configurable: true, value: createObjectURL },
    revokeObjectURL: { configurable: true, value: revokeObjectURL },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CaptureForm", () => {
  it("requests the rear camera with a single desktop-compatible file input", () => {
    render(<CaptureForm />);
    const input = getPhotoInput();

    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("name", "image");
    expect(input).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
    expect(input).toHaveAttribute("capture", "environment");
    expect(input).not.toHaveAttribute("multiple");
  });

  it("previews, replaces, and clears a valid photo", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CaptureForm />);
    const input = getPhotoInput();
    const first = new File([new Uint8Array([1, 2, 3])], "bee.jpg", {
      type: "image/jpeg",
    });
    const second = new File([new Uint8Array([4, 5, 6])], "frog.png", {
      type: "image/png",
    });

    await user.upload(input, first);
    expect(screen.getByAltText("Preview of bee.jpg")).toBeInTheDocument();
    expect(screen.getByText("Photo ready", { exact: false })).toBeVisible();

    await user.upload(input, second);
    expect(screen.getByAltText("Preview of frog.png")).toBeInTheDocument();
    await waitFor(() =>
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:capture-1"),
    );

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(
      screen.queryByAltText("Preview of frog.png"),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:capture-2"),
    );

    unmount();
  });

  it("allows the same file to be selected again", async () => {
    const user = userEvent.setup();
    render(<CaptureForm />);
    const input = getPhotoInput();
    const file = new File([new Uint8Array([1])], "ant.webp", {
      type: "image/webp",
    });

    await user.upload(input, file);
    await user.upload(input, file);

    expect(createObjectURL).toHaveBeenCalledTimes(2);
    await waitFor(() =>
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:capture-1"),
    );
  });

  it("releases the preview URL when the screen unmounts", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CaptureForm />);

    await user.upload(
      getPhotoInput(),
      new File([new Uint8Array([1])], "dragonfly.jpg", {
        type: "image/jpeg",
      }),
    );
    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:capture-1");
  });

  it.each([
    [
      "empty",
      new File([], "empty.jpg", { type: "image/jpeg" }),
      "That image is empty",
    ],
    [
      "oversized",
      new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "large.jpg", {
        type: "image/jpeg",
      }),
      "larger than 4 MB",
    ],
    [
      "HEIC",
      new File([new Uint8Array([1])], "phone.heic", { type: "image/heic" }),
      "HEIC is not supported yet",
    ],
    [
      "unsupported",
      new File([new Uint8Array([1])], "notes.txt", { type: "text/plain" }),
      "Choose a JPEG, PNG, or WebP",
    ],
  ])("shows a clear error for an %s file", async (_name, file, message) => {
    const user = userEvent.setup({ applyAccept: false });
    render(<CaptureForm />);

    await user.upload(getPhotoInput(), file);

    expect(screen.getByRole("alert")).toHaveTextContent(message);
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("keeps the selected bytes in memory without calling or persisting them", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const storageSpy = vi.spyOn(window.Storage.prototype, "setItem");
    render(<CaptureForm />);

    await user.upload(
      getPhotoInput(),
      new File([new Uint8Array([1, 2, 3])], "butterfly.jpg", {
        type: "image/jpeg",
      }),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(storageSpy).not.toHaveBeenCalled();
  });

  it("submits the selected file only after the identify action", async () => {
    const user = userEvent.setup();
    const onIdentify = vi.fn();
    const image = new File([new Uint8Array([1, 2, 3])], "bee.jpg", {
      type: "image/jpeg",
    });
    render(<CaptureForm onIdentify={onIdentify} />);

    await user.upload(getPhotoInput(), image);
    expect(onIdentify).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "Identify discovery" }),
    );
    expect(onIdentify).toHaveBeenCalledOnce();
    expect(onIdentify).toHaveBeenCalledWith(image);
  });
});
