import path from "node:path";
import {
  env,
  pipeline,
  RawImage,
  type ImageClassificationOutput,
  type ImageClassificationPipelineType,
} from "@huggingface/transformers";
import modelConfig from "@/models/Xenova/resnet-50/config.json";
import { InvalidImageError, ModelUnavailableError } from "./errors";
import {
  buildImageNetLabelIndex,
  InvalidModelOutputError,
  mapImageNetPredictions,
  type MappedClassification,
} from "./mapping";

const MODEL_ID = "Xenova/resnet-50";
const IMAGE_NET_CLASS_COUNT = Object.keys(modelConfig.id2label).length;
const labelToClassId = buildImageNetLabelIndex(
  modelConfig.id2label as Record<string, string>,
);

env.localModelPath = path.join(process.cwd(), "models");
env.allowLocalModels = true;
env.allowRemoteModels = false;

let classifierPromise: Promise<ImageClassificationPipelineType> | null = null;

function getClassifier(): Promise<ImageClassificationPipelineType> {
  if (!classifierPromise) {
    classifierPromise = pipeline("image-classification", MODEL_ID, {
      dtype: "q8",
    }).catch((error: unknown) => {
      classifierPromise = null;
      throw new ModelUnavailableError({ cause: error });
    });
  }

  return classifierPromise;
}

export async function classifyImage(
  image: Blob,
): Promise<MappedClassification> {
  let rawImage: RawImage;
  try {
    rawImage = await RawImage.fromBlob(image);
  } catch {
    throw new InvalidImageError();
  }

  const classifier = await getClassifier();
  let output: ImageClassificationOutput | ImageClassificationOutput[];

  try {
    output = await classifier(rawImage, { top_k: IMAGE_NET_CLASS_COUNT });
  } catch (error) {
    throw new InvalidModelOutputError(
      error instanceof Error
        ? `The classifier failed: ${error.message}`
        : "The classifier failed.",
    );
  }

  if (!Array.isArray(output) || output.length === 0) {
    throw new InvalidModelOutputError(
      "The classifier returned an unexpected output shape.",
    );
  }

  const predictions: ImageClassificationOutput = Array.isArray(output[0])
    ? output[0]
    : (output as ImageClassificationOutput);
  if (predictions.length === 0) {
    throw new InvalidModelOutputError(
      "The classifier returned an unexpected output shape.",
    );
  }

  return mapImageNetPredictions(predictions, labelToClassId);
}
