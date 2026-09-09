export const SUPPORTED_SPECIES_IDS = [
  "chihuahua",
  "golden_retriever",
  "german_shepherd",
  "tabby_cat",
  "persian_cat",
  "monarch_butterfly",
] as const;

export type SupportedSpeciesId = (typeof SUPPORTED_SPECIES_IDS)[number];

export type ImageClassificationPrediction = {
  label: string;
  score: number;
};

export type MappedClassification = {
  speciesId: SupportedSpeciesId;
  classId: number;
  confidence: number;
  label: string;
};

const SPECIES_BY_IMAGENET_CLASS = new Map<number, SupportedSpeciesId>([
  [151, "chihuahua"],
  [207, "golden_retriever"],
  [235, "german_shepherd"],
  [281, "tabby_cat"],
  [283, "persian_cat"],
  [323, "monarch_butterfly"],
]);

export class UnsupportedSpeciesError extends Error {
  constructor(
    readonly label: string,
    readonly confidence: number,
  ) {
    super(`ImageNet label is not supported: ${label}`);
    this.name = "UnsupportedSpeciesError";
  }
}

export class InvalidModelOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidModelOutputError";
  }
}

export function speciesIdForImageNetClass(
  classId: number,
): SupportedSpeciesId | null {
  return SPECIES_BY_IMAGENET_CLASS.get(classId) ?? null;
}

export function buildImageNetLabelIndex(
  idToLabel: Record<string, string>,
): ReadonlyMap<string, number> {
  const entries = Object.entries(idToLabel).map(
    ([classId, label]) => [label, Number(classId)] as const,
  );

  if (
    entries.length === 0 ||
    entries.some(([, classId]) => !Number.isInteger(classId))
  ) {
    throw new InvalidModelOutputError(
      "ImageNet label configuration is invalid.",
    );
  }

  return new Map(entries);
}

export function mapImageNetPredictions(
  predictions: ImageClassificationPrediction[],
  labelToClassId: ReadonlyMap<string, number>,
): MappedClassification {
  if (predictions.length === 0) {
    throw new InvalidModelOutputError(
      "The classifier returned no predictions.",
    );
  }

  for (const prediction of predictions) {
    if (
      typeof prediction.label !== "string" ||
      prediction.label.length === 0 ||
      !Number.isFinite(prediction.score) ||
      prediction.score < 0 ||
      prediction.score > 1
    ) {
      throw new InvalidModelOutputError(
        "The classifier returned an invalid prediction.",
      );
    }
  }

  const topPrediction = predictions.reduce((best, current) =>
    current.score > best.score ? current : best,
  );
  const topClassId = labelToClassId.get(topPrediction.label);

  if (topClassId === undefined) {
    throw new InvalidModelOutputError(
      `The classifier returned an unknown label: ${topPrediction.label}`,
    );
  }

  const speciesId = speciesIdForImageNetClass(topClassId);
  if (speciesId === null) {
    throw new UnsupportedSpeciesError(topPrediction.label, topPrediction.score);
  }

  return {
    speciesId,
    classId: topClassId,
    confidence: topPrediction.score,
    label: topPrediction.label,
  };
}
