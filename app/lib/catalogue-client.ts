import { z } from "zod";
import { RARITIES } from "./species";

export const catalogueSpeciesSchema = z
  .object({
    id: z.union([z.string(), z.number().int().positive()]),
    speciesId: z.string().min(1),
    name: z.string().min(1),
    scientificName: z.string().nullable(),
    rarity: z.enum(RARITIES),
    habitat: z.string().nullable(),
    description: z.string().nullable(),
    imageUrl: z.string().url().nullable(),
    iconUrl: z.string().url().nullable(),
    isActive: z.boolean(),
    modelClassId: z.number().int().min(0).max(999).nullable(),
    captureEnabled: z.boolean(),
    baseXp: z.number().int().positive(),
    facts: z.array(z.string().min(1)),
    quiz: z
      .object({
        question: z.string().trim().min(1),
        options: z.array(z.string().trim().min(1)).min(2),
        correctOptionIndex: z.number().int().nonnegative(),
      })
      .refine(
        (quiz) => quiz.correctOptionIndex < quiz.options.length,
        "The correct quiz option must exist.",
      )
      .nullable(),
    targetForQuest: z.boolean(),
    sourceUrl: z.string().url().nullable(),
  })
  .strict();

export type CatalogueSpecies = z.infer<typeof catalogueSpeciesSchema>;

const catalogueResponseSchema = z
  .object({ species: z.array(catalogueSpeciesSchema) })
  .strict();

const speciesResponseSchema = z
  .object({ species: catalogueSpeciesSchema })
  .strict();

export async function fetchCatalogue(): Promise<Array<CatalogueSpecies>> {
  const response = await fetch("/api/species");
  if (!response.ok) throw new Error("The species catalogue is unavailable.");
  return catalogueResponseSchema.parse(await response.json()).species;
}

export async function fetchCatalogueSpecies(
  speciesId: string,
): Promise<CatalogueSpecies> {
  const response = await fetch(`/api/species/${encodeURIComponent(speciesId)}`);
  if (!response.ok) throw new Error("Species details are unavailable.");
  return speciesResponseSchema.parse(await response.json()).species;
}
