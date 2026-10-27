import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import {
  AddFlowerbedPlantDto,
  FlowerbedDto,
  UpdateFlowerbedDto,
  UpdateFlowerbedPlantDto,
} from './dto/flowerbed.dto';

@Injectable()
export class FlowerbedsService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly include = {
    plants: {
      include: {
        plant: {
          include: {
            names: true,
            images: { orderBy: { isPrimary: 'desc' as const } },
          },
        },
      },
      orderBy: { createdAt: 'asc' as const },
    },
  };
  private data(
    dto: FlowerbedDto,
  ):
    | Prisma.FlowerbedUncheckedCreateInput
    | Prisma.FlowerbedUncheckedUpdateInput {
    const { widthCm, lengthCm, layout, ...data } = dto;
    return {
      ...data,
      ...(layout !== undefined
        ? { layout: layout as Prisma.InputJsonValue }
        : {}),
      ...(widthCm !== undefined ? { widthCm } : {}),
      ...(lengthCm !== undefined ? { lengthCm } : {}),
      ...(widthCm !== undefined && lengthCm !== undefined
        ? { areaM2: (widthCm * lengthCm) / 10_000 }
        : {}),
    };
  }
  create(userId: string, dto: FlowerbedDto) {
    return this.prisma.flowerbed.create({
      data: {
        userId,
        ...this.data(dto),
      } as Prisma.FlowerbedUncheckedCreateInput,
      include: this.include,
    });
  }
  list(userId: string) {
    return this.prisma.flowerbed.findMany({
      where: { userId },
      include: { _count: { select: { plants: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }
  async one(userId: string, id: string) {
    const bed = await this.prisma.flowerbed.findUnique({
      where: { id },
      include: this.include,
    });
    if (!bed) throw new NotFoundException('Клумбу не знайдено');
    if (bed.userId !== userId && !bed.isPublic)
      throw new ForbiddenException('Немає доступу до клумби');
    return bed;
  }
  async owned(userId: string, id: string) {
    const bed = await this.prisma.flowerbed.findUnique({ where: { id } });
    if (!bed) throw new NotFoundException('Клумбу не знайдено');
    if (bed.userId !== userId)
      throw new ForbiddenException('Немає доступу до клумби');
    return bed;
  }
  async update(userId: string, id: string, dto: UpdateFlowerbedDto) {
    await this.owned(userId, id);
    return this.prisma.flowerbed.update({
      where: { id },
      data: this.data(dto),
      include: this.include,
    });
  }
  async remove(userId: string, id: string) {
    await this.owned(userId, id);
    await this.prisma.flowerbed.delete({ where: { id } });
  }
  async addPlant(userId: string, id: string, dto: AddFlowerbedPlantDto) {
    const bed = await this.owned(userId, id);
    await this.prisma.plant.findUniqueOrThrow({ where: { id: dto.plantId } });
    this.assertPosition(bed.widthCm, bed.lengthCm, dto.xCm, dto.yCm);
    return this.prisma.flowerbedPlant.create({
      data: {
        flowerbedId: id,
        plantId: dto.plantId,
        quantity: dto.quantity,
        xCm: dto.xCm,
        yCm: dto.yCm,
        rotationDeg: dto.rotationDeg,
        notes: dto.notes,
        plantedAt: dto.plantedAt ? new Date(dto.plantedAt) : undefined,
        customHeightCm: dto.customHeightCm,
        customWidthCm: dto.customWidthCm,
      },
      include: { plant: { include: { names: true, images: true } } },
    });
  }
  async updatePlant(
    userId: string,
    id: string,
    placementId: string,
    dto: UpdateFlowerbedPlantDto,
  ) {
    const bed = await this.owned(userId, id);
    const placement = await this.prisma.flowerbedPlant.findFirst({
      where: { id: placementId, flowerbedId: id },
    });
    if (!placement)
      throw new NotFoundException('Розміщення рослини не знайдено');
    this.assertPosition(bed.widthCm, bed.lengthCm, dto.xCm, dto.yCm);
    return this.prisma.flowerbedPlant.update({
      where: { id: placementId },
      data: {
        ...(dto.plantId ? { plantId: dto.plantId } : {}),
        quantity: dto.quantity,
        xCm: dto.xCm,
        yCm: dto.yCm,
        rotationDeg: dto.rotationDeg,
        notes: dto.notes,
        plantedAt: dto.plantedAt ? new Date(dto.plantedAt) : undefined,
        customHeightCm: dto.customHeightCm,
        customWidthCm: dto.customWidthCm,
      },
      include: { plant: { include: { names: true, images: true } } },
    });
  }
  async removePlant(userId: string, id: string, placementId: string) {
    await this.owned(userId, id);
    const result = await this.prisma.flowerbedPlant.deleteMany({
      where: { id: placementId, flowerbedId: id },
    });
    if (!result.count)
      throw new NotFoundException('Розміщення рослини не знайдено');
  }
  private assertPosition(
    width: number | null,
    length: number | null,
    x?: number,
    y?: number,
  ) {
    if (x === undefined && y === undefined) return;
    if (
      x === undefined ||
      y === undefined ||
      (width !== null && x > width) ||
      (length !== null && y > length)
    )
      throw new ForbiddenException('Координати мають бути в межах клумби');
  }
}
