import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const warehouseService = {
  async create(data: { name: string; shortCode: string; address: string }) {
    try {
      return await prisma.warehouse.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('WAREHOUSE_SHORT_CODE_EXISTS');
      }
      throw error;
    }
  },

  async findAll(params: { page: number; limit: number; search?: string; includeLocations?: boolean }) {
    const { page, limit, search, includeLocations } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.WarehouseWhereInput = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { shortCode: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    const [items, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: includeLocations ? { locations: { orderBy: { shortCode: 'asc' } } } : undefined,
      }),
      prisma.warehouse.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string, includeLocations = false) {
    return prisma.warehouse.findUnique({
      where: { id },
      include: includeLocations ? { locations: { orderBy: { shortCode: 'asc' } } } : undefined,
    });
  },

  async update(id: string, data: { name?: string; shortCode?: string; address?: string }) {
    try {
      return await prisma.warehouse.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('WAREHOUSE_NOT_FOUND');
        if (error.code === 'P2002') throw new Error('WAREHOUSE_SHORT_CODE_EXISTS');
      }
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await prisma.warehouse.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('WAREHOUSE_NOT_FOUND');
        if (error.code === 'P2003') throw new Error('WAREHOUSE_HAS_LOCATIONS');
      }
      throw error;
    }
  },
};