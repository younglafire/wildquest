/**
 * Browser-only in-memory and session storage for player-captured photos and creatures.
 * Adheres strictly to AGENTS.md data boundaries:
 * "The browser may hold a selected photo and pending identification in memory
 * or session storage as already designed. Never add photo bytes to local storage,
 * logs, Supabase Storage, the database, or the filesystem."
 */

const PHOTO_PREFIX = "wildquest_captured_photo:";
const CREATURE_PREFIX = "wildquest_captured_creature:";
const inMemoryPhotos = new Map<string, string>();
const inMemoryCapturedCreatures = new Set<string>();

/**
 * Persists a captured photo Data URL in browser memory and session storage.
 */
export function saveCapturedPhoto(speciesId: string, dataUrl: string): void {
  if (typeof window === "undefined" || !speciesId || !dataUrl) return;
  const key = speciesId.toLowerCase();
  inMemoryPhotos.set(key, dataUrl);
  try {
    sessionStorage.setItem(`${PHOTO_PREFIX}${key}`, dataUrl);
  } catch {
    // Quota exceeded or private browsing mode; inMemoryPhotos retains it for this session
  }
}

/**
 * Retrieves a captured photo Data URL for the given species ID.
 */
export function getCapturedPhoto(speciesId: string): string | null {
  if (typeof window === "undefined" || !speciesId) return null;
  const key = speciesId.toLowerCase();
  if (inMemoryPhotos.has(key)) {
    return inMemoryPhotos.get(key)!;
  }
  try {
    const stored = sessionStorage.getItem(`${PHOTO_PREFIX}${key}`);
    if (stored) {
      inMemoryPhotos.set(key, stored);
      return stored;
    }
  } catch {
    // Ignore storage read failure
  }
  return null;
}

/**
 * Marks a species as captured in the current browser session.
 */
export function saveCapturedCreature(
  speciesId: string,
  catalogueId?: number | string | bigint,
): void {
  if (typeof window === "undefined" || !speciesId) return;
  const key = speciesId.toLowerCase();
  inMemoryCapturedCreatures.add(key);
  if (catalogueId != null) {
    inMemoryCapturedCreatures.add(String(catalogueId));
  }
  try {
    sessionStorage.setItem(
      `${CREATURE_PREFIX}${key}`,
      String(catalogueId ?? "1"),
    );
  } catch {
    // Ignore storage failure
  }
}

/**
 * Checks if a species has been captured in this browser session.
 */
export function isLocallyCapturedCreature(
  speciesId?: string,
  catalogueId?: number | string | bigint,
): boolean {
  if (typeof window === "undefined") return false;
  if (speciesId && inMemoryCapturedCreatures.has(speciesId.toLowerCase())) {
    return true;
  }
  if (
    catalogueId != null &&
    inMemoryCapturedCreatures.has(String(catalogueId))
  ) {
    return true;
  }
  try {
    if (speciesId) {
      const val = sessionStorage.getItem(
        `${CREATURE_PREFIX}${speciesId.toLowerCase()}`,
      );
      if (val) {
        inMemoryCapturedCreatures.add(speciesId.toLowerCase());
        return true;
      }
    }
    if (catalogueId != null) {
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (
          k?.startsWith(CREATURE_PREFIX) &&
          sessionStorage.getItem(k) === String(catalogueId)
        ) {
          return true;
        }
      }
    }
  } catch {
    // Ignore storage read failure
  }
  return false;
}

/**
 * Converts a captured File or Blob into an optimized JPEG Data URL (max 512px)
 * to ensure fast rendering on 3D textures and compact footprint in sessionStorage (~30-50KB).
 */
export function createCompressedPhotoDataUrl(
  file: File | Blob,
  maxDimension = 512,
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        resolve("");
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Clean JPEG compression at 0.82 quality
        const compressed = canvas.toDataURL("image/jpeg", 0.82);
        resolve(compressed);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}
