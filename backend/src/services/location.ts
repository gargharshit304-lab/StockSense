import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const locationService = {
  async create(data: { warehouseId: string; name: string; shortCode: string }) {
    const warehouse = await prisma.warehouse.findUnique({ where: { id: data.warehouseId } });
    if (!warehouse) {
      throw new Error('WAREHOUSE_NOT_FOUND');
    }

    try {
      return await prisma.location.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002' && Array.isArray(error.meta?.target) && error.meta.target.includes('warehouseId') && error.meta.target.includes('shortCode')) {
          throw new Error('LOCATION_SHORT_CODE_EXISTS_IN_WAREHOUSE');
        }
      }
      throw error;
    }
  },

  async findAll(params: { page: number; limit: number; search?: string; warehouseId?: string }) {
    const { page, limit, search, warehouseId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.LocationWhereInput = {
      ...(warehouseId && { warehouseId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { shortCode: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { shortCode: 'asc' },
        include: { warehouse: { select: { id: true, name: true, shortCode: true } } },
      }),
      prisma.location.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string) {
    return prisma.location.findUnique({
      where: { id },
      include: { warehouse: { select: { id: true, name: true, shortCode: true } } },
    });
  },

  async update(id: string, data: { warehouseId?: string; name?: string; shortCode?: string }) {
    if (data.warehouseId) {
      const warehouse = await prisma.warehouse.findUnique({ where: { id: data.warehouseId } });
      if (!warehouse) {
        throw new Error('WAREHOUSE_NOT_FOUND');
      }
    }

    try {
      return await prisma.location.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('LOCATION_NOT_FOUND');
        if (error.code === 'P2002' && Array.isArray(error.meta?.target) && error.meta.target.includes('warehouseId') && error.meta.target.includes('shortCode')) {
          throw new Error('LOCATION_SHORT_CODE_EXISTS_IN_WAREHOUSE');
        }
      }
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await prisma.location.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('LOCATION_NOT_FOUND');
        if (error.code === 'P2003') throw new Error('LOCATION_HAS_STOCK_QUANTS');
      }
      throw error;
    }
  },
};