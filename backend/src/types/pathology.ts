/**
 * Core pathology and diagnostic domain types for Vistara.
 * Open-ended to support any plant pathogen category (fungi, bacteria,
 * viruses, viroids, nematodes, phytoplasmas, abiotic stresses, etc.)
 * and any disease classification.
 */
export type SeverityLevel = string;
export type PathogenCategory = string;

export interface DiagnosticData {
  crop: string;
  disease: string;
  pathogenType: PathogenCategory;
  confidence: number; // e.g. 96.8
  severity: SeverityLevel;
  symptoms: string[];
  organicTreatment: string;
  chemicalTreatment: string;
  preventativeAction: string;
}

export interface ImageAttachmentPayload {
  id?: string;
  name: string;
  url?: string;
  data?: string; // base64 string or data URL
  mimeType?: string;
}

export interface VideoAttachmentPayload {
  id?: string;
  name: string;
  url?: string;
  data?: string; // base64 string or data URL
  mimeType?: string;
  sizeBytes?: number;
  durationSeconds?: number;
}
