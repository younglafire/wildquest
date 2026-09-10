export const SUPPORTED_SPECIES_IDS = [
  "rooster",
  "hen",
  "bullfrog",
  "tree_frog",
  "sea_snake",
  "african_grey_parrot",
  "macaw",
  "chihuahua",
  "toy_terrier",
  "staffordshire_bull_terrier",
  "boston_terrier",
  "golden_retriever",
  "labrador_retriever",
  "english_springer_spaniel",
  "cocker_spaniel",
  "german_shepherd",
  "bull_mastiff",
  "siberian_husky",
  "pug",
  "samoyed",
  "pembroke_corgi",
  "tabby_cat",
  "persian_cat",
  "siamese_cat",
  "egyptian_cat",
  "bee",
  "ant",
  "dragonfly",
  "damselfly",
  "ringlet_butterfly",
  "monarch_butterfly",
  "cabbage_butterfly",
  "angora_rabbit",
  "hamster",
  "pig",
  "water_buffalo",
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
  [7, "rooster"],
  [8, "hen"],
  [30, "bullfrog"],
  [31, "tree_frog"],
  [65, "sea_snake"],
  [87, "african_grey_parrot"],
  [88, "macaw"],
  [151, "chihuahua"],
  [158, "toy_terrier"],
  [179, "staffordshire_bull_terrier"],
  [195, "boston_terrier"],
  [207, "golden_retriever"],
  [208, "labrador_retriever"],
  [217, "english_springer_spaniel"],
  [219, "cocker_spaniel"],
  [235, "german_shepherd"],
  [243, "bull_mastiff"],
  [250, "siberian_husky"],
  [254, "pug"],
  [258, "samoyed"],
  [263, "pembroke_corgi"],
  [281, "tabby_cat"],
  [283, "persian_cat"],
  [284, "siamese_cat"],
  [285, "egyptian_cat"],
  [309, "bee"],
  [310, "ant"],
  [319, "dragonfly"],
  [320, "damselfly"],
  [322, "ringlet_butterfly"],
  [323, "monarch_butterfly"],
  [324, "cabbage_butterfly"],
  [332, "angora_rabbit"],
  [333, "hamster"],
  [341, "pig"],
  [346, "water_buffalo"],
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
