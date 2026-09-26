import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const partnerService = {
  async create(data: { name: string; partnerType: 'VENDOR' | 'CUSTOMER'; contactInfo: string }) {
    return prisma.partner.create({ data });
  },

  async findAll(params: { page: number; limit: number; search?: string; partnerType?: 'VENDOR' | 'CUSTOMER' }) {
    const { page, limit, search, partnerType } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PartnerWhereInput = {
      ...(partnerType && { partnerType }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { contactInfo: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.partner.count({ where }),
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
    return prisma.partner.findUnique({ where: { id } });
  },

  async update(id: string, data: { name?: string; partnerType?: 'VENDOR' | 'CUSTOMER'; contactInfo?: string }) {
    try {
      return await prisma.partner.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('PARTNER_NOT_FOUND');
      }
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await prisma.partner.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('PARTNER_NOT_FOUND');
        if (error.code === 'P2003') throw new Error('PARTNER_HAS_PICKINGS');
      }
      throw error;
    }
  },
};