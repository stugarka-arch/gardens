import { Injectable } from '@nestjs/common';
import { PlantSubmissionStatus, Prisma } from '../../generated/prisma/client';
import { AiService } from '../ai/ai.service';
import { PlantsService } from '../plants/plants.service';
import { PrismaService } from '../prisma/prisma.service';
import { DiscoverPlantDto } from './dto/discover-plant.dto';
import { TaxonVerificationService } from './taxon-verification.service';

export type DiscoveryOutcome =
  | 'CATALOG_CREATED'
  | 'CATALOG_EXISTING'
  | 'NEEDS_REVIEW'
  | 'SOURCE_UNAVAILABLE';

@Injectable()
export class PlantDiscoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly verifier: TaxonVerificationService,
    private readonly plants: PlantsService,
  ) {}

  async discover(userId: string, dto: DiscoverPlantDto) {
    const query = dto.query.trim();
    const language = dto.language || 'uk';
    const submission = await this.prisma.plantSubmission.create({
      data: {
        userId,
        query,
        language,
        status: PlantSubmissionStatus.SEARCHING,
      },
    });
    try {
      const result = await this.ai.discoverPlant(
        query,
        {
          varietyName: dto.varietyName,
          color: dto.color,
          isNoSpecifiedVariety: dto.isNoSpecifiedVariety,
        },
        language,
      );
      const candidate = this.candidateName(result.proposal.scientificName);
      if (!candidate)
        return this.updateForReview(submission.id, result, 'NEEDS_REVIEW', {
          status: 'UNVERIFIED',
          source: 'GBIF',
          reason: 'AI не надав коректну наукову назву',
        });
      const verification = await this.verifier.verify(candidate);
      if (verification.status !== 'VERIFIED_MATCH') {
        const registrySuggestions =
          verification.status === 'SOURCE_UNAVAILABLE'
            ? []
            : await this.verifier.suggest(candidate);

        return this.updateForReview(
          submission.id,
          result,
          verification.status === 'SOURCE_UNAVAILABLE'
            ? 'SOURCE_UNAVAILABLE'
            : 'NEEDS_REVIEW',
          {
            ...verification,
            requestedPlant: query,
            requestedVariety: dto.varietyName?.trim() || null,
            requestedColor: dto.color?.trim() || null,
            registrySuggestions,
            reason:
              registrySuggestions.length > 0
                ? 'Точний таксон не підтверджено. Знайдено альтернативні ботанічні таксони у GBIF.'
                : 'Точний таксон не підтверджено. Потрібен окремий пошук ботанічного виду та садового сорту.',
          },
        );
      }

      const taxonInput = {
        scientificName: verification.acceptedScientificName!,
        externalId: verification.externalId!,
        sourceUrl: verification.sourceUrl!,
        family: verification.family,
        genus: verification.genus,
        species: verification.species,
        plantName:
          typeof result.proposal.plantName === 'string'
            ? result.proposal.plantName
            : query,
      };
      const canCreateVariant =
        typeof dto.color === 'string' &&
        dto.color.trim().length > 0 &&
        (dto.isNoSpecifiedVariety === true ||
          (typeof dto.varietyName === 'string' &&
            dto.varietyName.trim().length > 0));
      const catalog = canCreateVariant
        ? await this.plants.createDiscoveredCatalogEntry({
            ...taxonInput,
            varietyName: dto.varietyName,
            color: dto.color!,
            isNoSpecifiedVariety: dto.isNoSpecifiedVariety === true,
            description:
              typeof result.proposal.description === 'string'
                ? result.proposal.description
                : undefined,
          })
        : undefined;

      if (!catalog) {
        return this.updateForReview(submission.id, result, 'NEEDS_REVIEW', {
          ...verification,
          reason:
            'Ботанічний вид підтверджено через GBIF, але для створення запису в каталозі потрібно вказати сорт і колір.',
          missingFields: {
            varietyName:
              dto.isNoSpecifiedVariety === true ||
              Boolean(dto.varietyName?.trim())
                ? undefined
                : 'Потрібно вказати сорт або явно обрати «Без зазначеного сорту».',
            color: dto.color?.trim() ? undefined : 'Потрібно вказати колір.',
          },
        });
      }

      const updated = await this.prisma.plantSubmission.update({
        where: { id: submission.id },
        data: {
          status: PlantSubmissionStatus.APPROVED,
          matchedPlantId: catalog.plant.id,
          proposedData: result.proposal as Prisma.InputJsonValue,
          searchResults: verification,
          aiModel: result.model,
          confidence:
            typeof result.proposal.confidence === 'number'
              ? result.proposal.confidence
              : null,
          completedAt: new Date(),
        },
        include: { matchedPlant: { include: { names: true, images: true } } },
      });
      return {
        ...updated,
        outcome: catalog.created
          ? ('CATALOG_CREATED' as DiscoveryOutcome)
          : ('CATALOG_EXISTING' as DiscoveryOutcome),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'AI search failed';
      return this.prisma.plantSubmission.update({
        where: { id: submission.id },
        data: {
          status: PlantSubmissionStatus.FAILED,
          errorMessage: message,
          completedAt: new Date(),
        },
      });
    }
  }

  history(userId: string) {
    return this.prisma.plantSubmission.findMany({
      where: { userId },
      include: { matchedPlant: { include: { names: true, images: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private updateForReview(
    id: string,
    result: Awaited<ReturnType<AiService['discoverPlant']>>,
    outcome: Extract<DiscoveryOutcome, 'NEEDS_REVIEW' | 'SOURCE_UNAVAILABLE'>,
    verification: object,
  ) {
    return this.prisma.plantSubmission
      .update({
        where: { id },
        data: {
          status: PlantSubmissionStatus.NEEDS_REVIEW,
          proposedData: result.proposal as Prisma.InputJsonValue,
          searchResults: verification,
          aiModel: result.model,
          confidence:
            typeof result.proposal.confidence === 'number'
              ? result.proposal.confidence
              : null,
          errorMessage:
            outcome === 'SOURCE_UNAVAILABLE'
              ? 'GBIF тимчасово недоступний; заявку передано на перевірку.'
              : null,
          completedAt: new Date(),
        },
      })
      .then((submission) => ({ ...submission, outcome }));
  }

  private candidateName(value: unknown) {
    if (typeof value !== 'string') return undefined;
    const name = value.trim().replace(/\s+/g, ' ');
    return /^[A-Z][a-z-]+\s+[a-z-]+(?:\s+[a-z-]+)?$/.test(name)
      ? name
      : undefined;
  }

  async registrySuggestions(query: string) {
    const value = query.trim();

    if (!value) {
      return {
        externalRegistry: [],
        gardensCatalog: [],
      };
    }

    const [externalRegistry, gardensCatalog] = await Promise.all([
      this.verifier.suggest(value),
      this.plants.searchChoices(value),
    ]);

    return {
      externalRegistry,
      gardensCatalog,
    };
  }

  async confirmRegistryTaxon(userId: string, dto: DiscoverPlantDto) {
    const query = dto.query.trim();

    if (!query) {
      return {
        outcome: 'NEEDS_REVIEW',
        externalRegistry: [],
        gardensCatalog: [],
        message: 'Вкажіть назву ботанічного виду для пошуку.',
      };
    }

    // Перевіряємо ботанічний таксон, а не садовий сорт.
    const verification = await this.verifier.verify(query);

    // Якщо точного таксона немає, повертаємо альтернативи
    // із зовнішнього реєстру та окремо з каталогу Gardens.
    if (verification.status !== 'VERIFIED_MATCH') {
      const [externalRegistry, gardensCatalog] = await Promise.all([
        verification.status === 'SOURCE_UNAVAILABLE'
          ? Promise.resolve([])
          : this.verifier.suggest(query),
        this.plants.searchChoices(query),
      ]);

      return {
        outcome:
          verification.status === 'SOURCE_UNAVAILABLE'
            ? 'SOURCE_UNAVAILABLE'
            : 'NEEDS_REVIEW',
        verification,
        requestedPlant: query,
        requestedVariety: dto.varietyName?.trim() || null,
        requestedColor: dto.color?.trim() || null,
        externalRegistry,
        gardensCatalog,
        message:
          verification.status === 'SOURCE_UNAVAILABLE'
            ? 'Зовнішній реєстр тимчасово недоступний. Спробуйте пізніше; наявні рослини каталогу показано окремо.'
            : externalRegistry.length > 0 || gardensCatalog.length > 0
              ? 'Точний таксон не підтверджено. Перегляньте зовнішні результати та каталог Gardens і виберіть відповідний ботанічний вид.'
              : 'Точного таксона та відповідних альтернатив не знайдено. Спробуйте шукати за ботанічною назвою виду.',
      };
    }

    // GBIF підтверджує ботанічний вид, але не садовий сорт і колір.
    const varietyName = dto.isNoSpecifiedVariety
      ? 'Без зазначеного сорту'
      : dto.varietyName?.trim();

    const color = dto.color?.trim();

    if (!color || (!dto.isNoSpecifiedVariety && !varietyName)) {
      return {
        outcome: 'NEEDS_REVIEW',
        verification,
        taxon: {
          scientificName: verification.acceptedScientificName,
          externalId: verification.externalId,
          sourceUrl: verification.sourceUrl,
          family: verification.family,
          genus: verification.genus,
          species: verification.species,
        },
        proposedVariant: {
          varietyName: varietyName || null,
          color: color || null,
        },
        missingFields: {
          varietyName:
            !dto.isNoSpecifiedVariety && !varietyName
              ? 'Вкажіть сорт або оберіть «Без зазначеного сорту».'
              : undefined,
          color: !color ? 'Вкажіть колір рослини.' : undefined,
        },
        message:
          'Ботанічний вид підтверджено через GBIF. Для додавання варіанта потрібно вказати сорт і колір.',
      };
    }

    // Не створюємо підтверджений запис лише на підставі відповіді GBIF.
    // Сорт і колір потребують незалежної перевірки.
    return {
      outcome: 'NEEDS_REVIEW',
      verification,
      taxon: {
        scientificName: verification.acceptedScientificName,
        externalId: verification.externalId,
        sourceUrl: verification.sourceUrl,
        family: verification.family,
        genus: verification.genus,
        species: verification.species,
      },
      proposedVariant: {
        varietyName,
        color,
      },
      message:
        'Ботанічний вид підтверджено. Сорт і колір потрібно окремо перевірити за садівничими джерелами перед додаванням до каталогу.',
    };
  }
}
