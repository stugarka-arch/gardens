import { TaxonVerificationService } from './taxon-verification.service';

describe('TaxonVerificationService', () => {
  const service = new TaxonVerificationService();
  const fetchMock = jest.spyOn(global, 'fetch');

  afterEach(() => fetchMock.mockReset());
  afterAll(() => fetchMock.mockRestore());

  it('accepts an exact accepted GBIF species match', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          usageKey: 2927305,
          canonicalName: 'Lavandula angustifolia',
          rank: 'SPECIES',
          status: 'ACCEPTED',
          confidence: 99,
          matchType: 'EXACT',
          kingdom: 'Plantae',
          family: 'Lamiaceae',
          genus: 'Lavandula',
          species: 'Lavandula angustifolia',
        }),
        { status: 200 },
      ),
    );
    await expect(
      service.verify('Lavandula angustifolia'),
    ).resolves.toMatchObject({
      status: 'VERIFIED_MATCH',
      acceptedScientificName: 'Lavandula angustifolia',
      externalId: '2927305',
    });
  });

  it('resolves an exact synonym to its accepted GBIF taxon', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            usageKey: 1,
            acceptedUsageKey: 2,
            rank: 'SPECIES',
            status: 'SYNONYM',
            confidence: 99,
            matchType: 'EXACT',
            kingdom: 'Plantae',
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            usageKey: 2,
            canonicalName: 'Accepted plant',
            rank: 'SPECIES',
            status: 'ACCEPTED',
            kingdom: 'Plantae',
          }),
          { status: 200 },
        ),
      );
    await expect(service.verify('Former plant')).resolves.toMatchObject({
      status: 'VERIFIED_MATCH',
      acceptedScientificName: 'Accepted plant',
      externalId: '2',
    });
  });

  it('requires moderation for a non-exact or ambiguous match', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          usageKey: 1,
          matchType: 'FUZZY',
          alternatives: [{ usageKey: 2 }],
        }),
        { status: 200 },
      ),
    );
    await expect(service.verify('Lavandula angus')).resolves.toMatchObject({
      status: 'AMBIGUOUS',
    });
  });

  it('does not treat a registry failure as a taxonomy decision', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network timeout'));
    await expect(service.verify('Unknown plant')).resolves.toMatchObject({
      status: 'SOURCE_UNAVAILABLE',
    });
  });
});
