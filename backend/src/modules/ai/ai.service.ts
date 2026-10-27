import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

export type PlantProposal = {
  plantName?: string;
  scientificName?: string;
  varietyName?: string;
  color?: string;
  fieldVerification?: Record<
    string,
    { status: 'VERIFIED' | 'UNVERIFIED'; sourceUrl?: string }
  >;
  commonNames?: string[];
  description?: string;
  confidence?: number;
  sources?: { name: string; url?: string }[];
  [key: string]: unknown;
};

const plantProposalSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    plantName: { type: ['string', 'null'] },
    scientificName: { type: ['string', 'null'] },
    varietyName: { type: ['string', 'null'] },
    color: { type: ['string', 'null'] },
    commonNames: { type: 'array', items: { type: 'string' } },
    description: { type: ['string', 'null'] },
    confidence: { type: ['number', 'null'] },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          url: { type: ['string', 'null'] },
        },
        required: ['name', 'url'],
      },
    },
    fieldVerification: {
      type: 'object',
      additionalProperties: false,
      properties: {
        plantName: { $ref: '#/$defs/verification' },
        scientificName: { $ref: '#/$defs/verification' },
        varietyName: { $ref: '#/$defs/verification' },
        color: { $ref: '#/$defs/verification' },
      },
      required: ['plantName', 'scientificName', 'varietyName', 'color'],
    },
  },
  required: [
    'plantName',
    'scientificName',
    'varietyName',
    'color',
    'commonNames',
    'description',
    'confidence',
    'sources',
    'fieldVerification',
  ],
  $defs: {
    verification: {
      type: 'object',
      additionalProperties: false,
      properties: {
        status: { type: 'string', enum: ['VERIFIED', 'UNVERIFIED'] },
        sourceUrl: { type: ['string', 'null'] },
      },
      required: ['status', 'sourceUrl'],
    },
  },
} as const;

export function parsePlantProposal(text: string): PlantProposal {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ServiceUnavailableException(
      'AI-пошук тимчасово повернув некоректну структуровану відповідь.',
    );
  }
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new ServiceUnavailableException(
      'AI-пошук тимчасово повернув некоректну структуровану відповідь.',
    );
  return value as PlantProposal;
}

@Injectable()
export class AiService {
  private readonly model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  async discoverPlant(
    query: string,
    details: {
      varietyName?: string;
      color?: string;
      isNoSpecifiedVariety?: boolean;
    },
    language = 'uk',
  ): Promise<{ model: string; proposal: PlantProposal }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      throw new ServiceUnavailableException(
        'AI-пошук недоступний: GEMINI_API_KEY не налаштований',
      );
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: this.model,
        contents: `Identify the plant requested as "${query}". The optional user variety is "${details.isNoSpecifiedVariety ? 'Без зазначеного сорту' : details.varietyName || 'не вказано'}" and color is "${details.color || 'не вказано'}". Return the requested structured data in ${language}. Do not invent a cultivar or color when the user did not provide one. Mark every unconfirmed value UNVERIFIED. A botanical taxon confirmation does not confirm a cultivar or color.`,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: plantProposalSchema,
          maxOutputTokens: 1500,
        },
      });
      const parsed = parsePlantProposal(response.text || '');
      return { model: this.model, proposal: parsed };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Gemini error';
      throw new ServiceUnavailableException(`AI-пошук недоступний: ${message}`);
    }
  }
}
