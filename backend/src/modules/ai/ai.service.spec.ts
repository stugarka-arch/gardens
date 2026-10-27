import { ServiceUnavailableException } from '@nestjs/common';
import { parsePlantProposal } from './ai.service';

describe('parsePlantProposal', () => {
  it('accepts a structured Gemini response', () => {
    expect(
      parsePlantProposal(
        JSON.stringify({
          plantName: 'Кохія',
          scientificName: 'Bassia scoparia',
          varietyName: null,
          color: null,
          commonNames: ['Кохія'],
          description: null,
          confidence: null,
          sources: [],
          fieldVerification: {},
        }),
      ),
    ).toMatchObject({ scientificName: 'Bassia scoparia' });
  });

  it('does not expose a raw JSON parser error', () => {
    expect(() => parsePlantProposal('{"scientificName":"Bassia')).toThrow(
      ServiceUnavailableException,
    );
  });
});
