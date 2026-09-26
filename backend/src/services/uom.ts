import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const uomService = {
  async create(data: { name: string }) {
    try {
      return await prisma.uom.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('UOM_NAME_EXISTS');
      }
      throw error;
    }
  },

  async findAll(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UomWhereInput = search ? {
      name: { contains: search, mode: 'insensitive' },
    } : {};

    const [items, total] = await Promise.all([
      prisma.uom.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.uom.count({ where }),
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
    return prisma.uom.findUnique({ where: { id } });
  },

  async update(id: string, data: { name?: string }) {
    try {
      return await prisma.uom.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('UOM_NOT_FOUND');
        if (error.code === 'P2002') throw new Error('UOM_NAME_EXISTS');
      }
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await prisma.uom.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('UOM_NOT_FOUND');
        if (error.code === 'P2003') throw new Error('UOM_HAS_PRODUCTS');
      }
      throw error;
    }
  },
};