export const SUPPORTED_SPECIES_IDS = [
  "dog",
  "cat",
  "bee",
  "chicken",
  "butterfly",
  "dragonfly",
  "frog",
  "ant",
] as const;

export type SupportedSpeciesId = (typeof SUPPORTED_SPECIES_IDS)[number];

export type ImageClassificationPrediction = {
  label: string;
  score: number;
};

export type MappedClassification = {
  speciesId: SupportedSpeciesId;
  confidence: number;
  label: string;
};

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
  if (classId >= 151 && classId <= 268) return "dog";
  if (classId >= 281 && classId <= 285) return "cat";
  if (classId === 309) return "bee";
  if (classId === 7 || classId === 8) return "chicken";
  if (classId >= 322 && classId <= 326) return "butterfly";
  if (classId === 319) return "dragonfly";
  if (classId >= 30 && classId <= 32) return "frog";
  if (classId === 310) return "ant";
  return null;
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

  if (speciesIdForImageNetClass(topClassId) === null) {
    throw new UnsupportedSpeciesError(topPrediction.label, topPrediction.score);
  }

  const totals = new Map<SupportedSpeciesId, number>();
  const bestLabels = new Map<
    SupportedSpeciesId,
    ImageClassificationPrediction
  >();

  for (const prediction of predictions) {
    const classId = labelToClassId.get(prediction.label);
    if (classId === undefined) {
      throw new InvalidModelOutputError(
        `The classifier returned an unknown label: ${prediction.label}`,
      );
    }

    const speciesId = speciesIdForImageNetClass(classId);
    if (speciesId === null) continue;

    totals.set(speciesId, (totals.get(speciesId) ?? 0) + prediction.score);

    const currentBest = bestLabels.get(speciesId);
    if (!currentBest || prediction.score > currentBest.score) {
      bestLabels.set(speciesId, prediction);
    }
  }

  const winner = [...totals.entries()].reduce((best, current) =>
    current[1] > best[1] ? current : best,
  );
  const bestLabel = bestLabels.get(winner[0]);

  if (!bestLabel) {
    throw new InvalidModelOutputError(
      "The classifier did not return a label for the winning species.",
    );
  }

  return {
    speciesId: winner[0],
    confidence: Math.min(1, winner[1]),
    label: bestLabel.label,
  };
}
