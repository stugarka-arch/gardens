import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PlantCategory,
  PlantKind,
  PlantSourceType,
  Prisma,
  PlantStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListPlantsDto } from './dto/list-plants.dto';
import { CreatePlantVariantDto } from './dto/create-plant-variant.dto';

@Injectable()
export class PlantsService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly include = {
    names: true,
    images: { orderBy: { isPrimary: 'desc' as const } },
  };
  private readonly variantInclude = {
    colors: { where: { isVerified: true } },
    images: { orderBy: { isPrimary: 'desc' as const } },
  };

  async searchChoices(query: string) {
    const value = query.trim();

    if (!value) return [];

    const aliases: Record<string, string[]> = {
      'гортензія': ['Hydrangea', 'гортензия'],
      'гортензия': ['Hydrangea', 'гортензія'],
      'hydrangea': ['гортензія', 'гортензия'],
    };

    const normalizedValue = value.toLocaleLowerCase();

    const searchTerms = new Set<string>([value]);

    for (const [key, values] of Object.entries(aliases)) {
      if (normalizedValue.includes(key)) {
        for (const alias of values) {
          searchTerms.add(alias);
        }

        // Залишаємо решту запиту, наприклад назву сорту.
        const remainder = normalizedValue
          .replace(key, '')
          .trim();

        if (remainder) {
          searchTerms.add(remainder);
        }
      }
    }

    const terms = [...searchTerms].filter(Boolean);

    return this.prisma.plant.findMany({
      where: {
        status: 'VERIFIED',
        OR: terms.flatMap((term) => [
          {
            scientificName: {
              contains: term,
              mode: 'insensitive' as const,
            },
          },
          {
            names: {
              some: {
                name: {
                  contains: term,
                  mode: 'insensitive' as const,
                },
              },
            },
          },
          {
            variants: {
              some: {
                status: 'VERIFIED',
                normalizedVarietyName: {
                  contains: this.normalize(term),
                },
              },
            },
          },
        ]),
      },
      select: {
        id: true,
        scientificName: true,
        names: {
          select: {
            name: true,
            language: true,
            isPrimary: true,
          },
        },
        variants: {
          where: {
            status: 'VERIFIED',
          },
          select: {
            id: true,
            varietyName: true,
            isNoSpecifiedVariety: true,
          },
        },
      },
      take: 20,
      orderBy: {
        scientificName: 'asc',
      },
    });
  }

  async variants(plantId: string) {
    await this.one(plantId);
    return this.prisma.plantVariant.findMany({
      where: { plantId, status: PlantStatus.VERIFIED },
      include: this.variantInclude,
      orderBy: { varietyName: 'asc' },
    });
  }

  async variantColor(plantId: string, variantId: string, colorId: string) {
    const variant = await this.prisma.plantVariant.findFirst({
      where: { id: variantId, plantId, status: PlantStatus.VERIFIED },
      include: this.variantInclude,
    });
    const color = variant?.colors.find((item) => item.id === colorId);
    if (!variant || !color)
      throw new NotFoundException('Варіант рослини або колір не знайдено');
    return { plant: await this.one(plantId), variant, color };
  }

  async createVerifiedVariant(
    role: string,
    plantId: string,
    dto: CreatePlantVariantDto,
  ) {
    if (role !== 'ADMIN')
      throw new ForbiddenException(
        'Лише адміністратор може публікувати варіант',
      );
    await this.one(plantId);
    const varietyName = dto.isNoSpecifiedVariety
      ? 'Без зазначеного сорту'
      : dto.varietyName.trim();
    if (!dto.isNoSpecifiedVariety && !varietyName)
      throw new NotFoundException('Потрібно вказати підтверджений сорт');
    const normalizedVarietyName = this.normalize(varietyName);
    const normalizedColor = this.normalize(dto.color);
    const existing = await this.prisma.plantVariant.findFirst({
      where: {
        plantId,
        normalizedVarietyName,
        colors: { some: { normalizedName: normalizedColor } },
      },
      include: this.variantInclude,
    });
    if (existing) return { variant: existing, created: false };
    const variant = await this.prisma.plantVariant.upsert({
      where: {
        plantId_normalizedVarietyName: { plantId, normalizedVarietyName },
      },
      create: {
        plantId,
        varietyName,
        normalizedVarietyName,
        isNoSpecifiedVariety: dto.isNoSpecifiedVariety,
        status: PlantStatus.VERIFIED,
        description: dto.description,
        verifiedAt: new Date(),
        colors: {
          create: {
            name: dto.color.trim(),
            normalizedName: normalizedColor,
            decorativePart: dto.decorativePart,
            season: dto.season,
            isVerified: true,
          },
        },
      },
      update: {
        colors: {
          create: {
            name: dto.color.trim(),
            normalizedName: normalizedColor,
            decorativePart: dto.decorativePart,
            season: dto.season,
            isVerified: true,
          },
        },
      },
      include: this.variantInclude,
    });
    await this.prisma.plantSource.create({
      data: {
        plantId,
        type: PlantSourceType.EXPERT,
        name: 'Variant verification',
        url: dto.sourceUrl,
        accessedAt: new Date(),
        notes: `variantId=${variant.id}; color=${dto.color.trim()}`,
      },
    });
    return { variant, created: true };
  }

  async createDiscoveredCatalogEntry(input: {
    scientificName: string;
    externalId: string;
    sourceUrl: string;
    family?: string;
    genus?: string;
    species?: string;
    plantName?: string;
    varietyName?: string;
    color: string;
    isNoSpecifiedVariety: boolean;
    description?: string;
  }) {
    const taxon = await this.createVerifiedTaxon(input);
    const varietyName = input.isNoSpecifiedVariety
      ? 'Без зазначеного сорту'
      : input.varietyName!.trim();
    const normalizedVarietyName = this.normalize(varietyName);
    const normalizedColor = this.normalize(input.color);
    let variant = await this.prisma.plantVariant.findUnique({
      where: {
        plantId_normalizedVarietyName: {
          plantId: taxon.plant.id,
          normalizedVarietyName,
        },
      },
      include: this.variantInclude,
    });
    if (!variant) {
      variant = await this.prisma.plantVariant.create({
        data: {
          plantId: taxon.plant.id,
          varietyName,
          normalizedVarietyName,
          isNoSpecifiedVariety: input.isNoSpecifiedVariety,
          status: PlantStatus.VERIFIED,
          description: input.description,
          verifiedAt: new Date(),
          colors: {
            create: {
              name: input.color.trim(),
              normalizedName: normalizedColor,
              isVerified: true,
            },
          },
        },
        include: this.variantInclude,
      });
    } else if (
      !variant.colors.some((color) => color.normalizedName === normalizedColor)
    ) {
      await this.prisma.plantVariantColor.create({
        data: {
          variantId: variant.id,
          name: input.color.trim(),
          normalizedName: normalizedColor,
          isVerified: true,
        },
      });
      variant = await this.prisma.plantVariant.findUniqueOrThrow({
        where: { id: variant.id },
        include: this.variantInclude,
      });
    }
    return { plant: taxon.plant, variant, created: taxon.created };
  }

  async list(dto: ListPlantsDto) {
    const where: Prisma.PlantWhereInput = { status: PlantStatus.VERIFIED };
    if (dto.q?.trim()) {
      const q = dto.q.trim();
      where.OR = [
        { scientificName: { contains: q, mode: 'insensitive' } },
        { names: { some: { name: { contains: q, mode: 'insensitive' } } } },
      ];
    }
    if (dto.category) where.category = dto.category;
    if (dto.light) where.lightRequirements = { has: dto.light };
    if (dto.moisture) where.soilMoisture = { has: dto.moisture };
    if (dto.soilType) where.soilTypes = { has: dto.soilType };
    if (dto.ph) where.soilPH = { has: dto.ph };
    if (dto.bloomColor) where.bloomColors = { has: dto.bloomColor };
    if (dto.evergreen !== undefined) where.evergreen = dto.evergreen;
    if (dto.minHeightCm !== undefined)
      where.maxHeightCm = { gte: dto.minHeightCm };
    if (dto.maxHeightCm !== undefined)
      where.minHeightCm = { lte: dto.maxHeightCm };
    if (dto.zone !== undefined) {
      where.usdaZoneMin = { lte: dto.zone };
      where.usdaZoneMax = { gte: dto.zone };
    }
    const orderBy: Prisma.PlantOrderByWithRelationInput =
      dto.sort === 'newest'
        ? { createdAt: 'desc' }
        : dto.sort === 'height'
          ? { maxHeightCm: 'asc' }
          : { scientificName: 'asc' };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.plant.findMany({
        where,
        include: this.include,
        orderBy,
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
      }),
      this.prisma.plant.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        pages: Math.ceil(total / dto.limit),
      },
    };
  }
  async one(id: string) {
    const plant = await this.prisma.plant.findFirst({
      where: { id, status: PlantStatus.VERIFIED },
      include: {
        ...this.include,
        variants: {
          where: { status: PlantStatus.VERIFIED },
          include: this.variantInclude,
        },
        sources: true,
        facts: true,
        parent: true,
        children: true,
      },
    });
    if (!plant) throw new NotFoundException('Рослину не знайдено');
    return plant;
  }
  async collection(userId: string) {
    return this.prisma.userPlant.findMany({
      where: { userId },
      include: { plant: { include: this.include } },
      orderBy: { createdAt: 'desc' },
    });
  }
  async addToCollection(userId: string, plantId: string) {
    await this.one(plantId);
    return this.prisma.userPlant.upsert({
      where: { userId_plantId: { userId, plantId } },
      create: { userId, plantId },
      update: {},
      include: { plant: { include: this.include } },
    });
  }
  async removeFromCollection(userId: string, plantId: string) {
    await this.prisma.userPlant.deleteMany({ where: { userId, plantId } });
  }

  async createVerifiedTaxon(input: {
    scientificName: string;
    externalId: string;
    sourceUrl: string;
    family?: string;
    genus?: string;
    species?: string;
    plantName?: string;
  }) {
    const existing = await this.prisma.plant.findFirst({
      where: {
        OR: [
          {
            scientificName: {
              equals: input.scientificName,
              mode: 'insensitive',
            },
          },
          {
            sources: {
              some: {
                name: 'GBIF Backbone Taxonomy',
                notes: { contains: `gbifTaxonKey=${input.externalId}` },
              },
            },
          },
        ],
      },
      include: this.include,
    });
    if (existing) return { plant: existing, created: false };

    try {
      const plant = await this.prisma.$transaction(async (tx) =>
        tx.plant.create({
          data: {
            scientificName: input.scientificName,
            slug: this.slug(input.scientificName),
            kind: PlantKind.SPECIES,
            category: PlantCategory.OTHER,
            status: PlantStatus.VERIFIED,
            family: input.family,
            genus: input.genus,
            species: input.species,
            verifiedAt: new Date(),
            lightRequirements: [],
            soilMoisture: [],
            soilTypes: [],
            soilPH: [],
            bloomColors: [],
            bloomMonths: [],
            foliageColors: [],
            pruningMonths: [],
            plantingMonths: [],
            sources: {
              create: {
                type: PlantSourceType.BOTANICAL_DATABASE,
                name: 'GBIF Backbone Taxonomy',
                url: input.sourceUrl,
                accessedAt: new Date(),
                notes: `gbifTaxonKey=${input.externalId}`,
              },
            },
            names: input.plantName
              ? {
                  create: {
                    name: input.plantName.trim(),
                    language: 'uk',
                    isPrimary: true,
                  },
                }
              : undefined,
          },
          include: this.include,
        }),
      );
      return { plant, created: true };
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2002'
      )
        throw error;
      const plant = await this.prisma.plant.findFirstOrThrow({
        where: {
          OR: [
            {
              scientificName: {
                equals: input.scientificName,
                mode: 'insensitive',
              },
            },
            {
              sources: {
                some: {
                  name: 'GBIF Backbone Taxonomy',
                  notes: { contains: `gbifTaxonKey=${input.externalId}` },
                },
              },
            },
          ],
        },
        include: this.include,
      });
      return { plant, created: false };
    }
  }

  private slug(name: string) {
    return name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private normalize(value: string) {
    return value.trim().toLocaleLowerCase('uk').replace(/\s+/g, ' ');
  }
}
