import { Injectable } from '@nestjs/common';

export type TaxonVerificationStatus =
  'VERIFIED_MATCH' | 'UNVERIFIED' | 'AMBIGUOUS' | 'SOURCE_UNAVAILABLE';

export type TaxonVerification = {
  status: TaxonVerificationStatus;
  source: 'GBIF';
  externalId?: string;
  acceptedScientificName?: string;
  taxonStatus?: string;
  sourceUrl?: string;
  family?: string;
  genus?: string;
  species?: string;
  reason?: string;
};

export type RegistryTaxonSuggestion = {
  externalId: string;
  scientificName: string;
  rank: string;
  taxonStatus?: string;
  sourceUrl: string;
  family?: string;
  genus?: string;
};

type GbifMatch = {
  usageKey?: number;
  acceptedUsageKey?: number;
  scientificName?: string;
  canonicalName?: string;
  rank?: string;
  status?: string;
  confidence?: number;
  matchType?: string;
  alternatives?: unknown[];
  kingdom?: string;
  family?: string;
  genus?: string;
  species?: string;
};

@Injectable()
export class TaxonVerificationService {
  private readonly apiUrl = 'https://api.gbif.org/v1/species';

  async verify(scientificName: string): Promise<TaxonVerification> {
    try {
      const match = await this.fetchJson<GbifMatch>(
        `${this.apiUrl}/match?${new URLSearchParams({
          name: scientificName,
          kingdom: 'Plantae',
        })}`,
      );
      if (match.alternatives?.length || match.matchType !== 'EXACT')
        return this.result('AMBIGUOUS', match, 'Збіг таксона не є точним');
      if (
        !match.usageKey ||
        match.rank !== 'SPECIES' ||
        match.confidence === undefined ||
        match.confidence < 98 ||
        match.kingdom !== 'Plantae'
      )
        return this.result(
          'UNVERIFIED',
          match,
          'GBIF не підтвердив однозначний вид рослини',
        );

      const accepted =
        match.status === 'SYNONYM' && match.acceptedUsageKey
          ? await this.fetchJson<GbifMatch>(
              `${this.apiUrl}/${match.acceptedUsageKey}`,
            )
          : match;
      if (
        accepted.status !== 'ACCEPTED' ||
        accepted.rank !== 'SPECIES' ||
        !accepted.canonicalName
      )
        return this.result(
          'UNVERIFIED',
          match,
          'GBIF не надав прийняту наукову назву',
        );
      return {
        status: 'VERIFIED_MATCH',
        source: 'GBIF',
        externalId: String(
          accepted.usageKey ?? match.acceptedUsageKey ?? match.usageKey,
        ),
        acceptedScientificName: accepted.canonicalName,
        taxonStatus: accepted.status,
        sourceUrl: `https://www.gbif.org/species/${accepted.usageKey ?? match.acceptedUsageKey ?? match.usageKey}`,
        family: accepted.family ?? match.family,
        genus: accepted.genus ?? match.genus,
        species: accepted.species ?? match.species,
      };
    } catch (error) {
      return {
        status: 'SOURCE_UNAVAILABLE',
        source: 'GBIF',
        reason: error instanceof Error ? error.message : 'GBIF is unavailable',
      };
    }
  }

  /**
   * These are GBIF registry results, not Gardens catalogue records.  They are
   * deliberately limited to accepted plant species so a user cannot select a
   * synonym or a cultivar-looking free-text result as a confirmed taxon.
   */
  async suggest(query: string): Promise<RegistryTaxonSuggestion[]> {
    const value = query.trim();
    if (!value) return [];

    try {
      const rows = await this.fetchJson<GbifMatch[]>(
        `${this.apiUrl}/suggest?${new URLSearchParams({
          q: value,
          rank: 'SPECIES',
          kingdom: 'Plantae',
          limit: '12',
        })}`,
      );

      const seen = new Set<string>();
      const suggestions: RegistryTaxonSuggestion[] = [];

      for (const item of rows) {
        if (
          !item.usageKey ||
          !item.canonicalName ||
          item.kingdom !== 'Plantae' ||
          item.rank !== 'SPECIES' ||
          item.status !== 'ACCEPTED'
        ) {
          continue;
        }

        const key = item.canonicalName.toLocaleLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        suggestions.push({
          externalId: String(item.usageKey),
          scientificName: item.canonicalName,
          rank: item.rank,
          taxonStatus: item.status,
          sourceUrl: `https://www.gbif.org/species/${item.usageKey}`,
          family: item.family,
          genus: item.genus,
        });
      }

      return suggestions;
    } catch {
      return [];
    }
  }

  private result(
    status: Exclude<
      TaxonVerificationStatus,
      'SOURCE_UNAVAILABLE' | 'VERIFIED_MATCH'
    >,
    match: GbifMatch,
    reason: string,
  ): TaxonVerification {
    return {
      status,
      source: 'GBIF',
      externalId: match.usageKey ? String(match.usageKey) : undefined,
      acceptedScientificName: match.canonicalName,
      taxonStatus: match.status,
      sourceUrl: match.usageKey
        ? `https://www.gbif.org/species/${match.usageKey}`
        : undefined,
      reason,
    };
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const signal = AbortSignal.timeout(5000);
    const response = await fetch(url, {
      signal,
      headers: { 'User-Agent': 'Gardens/1.0 (+https://gardens.local)' },
    });
    if (!response.ok) throw new Error(`GBIF returned HTTP ${response.status}`);
    return response.json() as Promise<T>;
  }
}
