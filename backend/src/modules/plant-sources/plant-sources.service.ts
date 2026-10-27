import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlantSourceDto } from './dto/plant-source.dto';

@Injectable()
export class PlantSourcesService {
  constructor(private readonly prisma: PrismaService) {}
  list(plantId: string) {
    return this.prisma.plantSource.findMany({
      where: { plantId },
      orderBy: { createdAt: 'desc' },
    });
  }
  async create(role: string, plantId: string, dto: CreatePlantSourceDto) {
    this.requireAdmin(role);
    await this.prisma.plant.findUniqueOrThrow({ where: { id: plantId } });
    return this.prisma.plantSource.create({
      data: {
        plantId,
        type: dto.type,
        name: dto.name,
        url: dto.url,
        notes: dto.notes,
        accessedAt: dto.accessedAt ? new Date(dto.accessedAt) : undefined,
      },
    });
  }
  async remove(role: string, id: string) {
    this.requireAdmin(role);
    await this.prisma.plantSource.delete({ where: { id } });
  }
  private requireAdmin(role: string) {
    if (role !== 'ADMIN')
      throw new ForbiddenException(
        'Лише адміністратор може змінювати джерела каталогу',
      );
  }
}
