import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const productService = {
  async create(data: { sku: string; name: string; categoryId: string; uomId: string; unitCost: number }) {
    const [category, uom] = await Promise.all([
      prisma.productCategory.findUnique({ where: { id: data.categoryId } }),
      prisma.uom.findUnique({ where: { id: data.uomId } }),
    ]);

    if (!category) throw new Error('CATEGORY_NOT_FOUND');
    if (!uom) throw new Error('UOM_NOT_FOUND');

    try {
      return await prisma.product.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('PRODUCT_SKU_EXISTS');
      }
      throw error;
    }
  },

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    uomId?: string;
    includeStock?: boolean;
  }) {
    const { page, limit, search, categoryId, uomId, includeStock } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(categoryId && { categoryId }),
      ...(uomId && { uomId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          category: { select: { id: true, name: true } },
          uom: { select: { id: true, name: true } },
          ...(includeStock && {
            stockQuants: {
              select: { onHand: true },
            },
          }),
        },
      }),
      prisma.product.count({ where }),
    ]);

    const itemsWithStock = includeStock
      ? items.map(item => ({
          ...item,
          totalOnHand: item.stockQuants.reduce((sum, q) => sum + Number(q.onHand), 0),
          stockQuants: undefined,
        }))
      : items;

    return {
      items: itemsWithStock,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string, includeStock = false) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        uom: { select: { id: true, name: true } },
        ...(includeStock && {
          stockQuants: { select: { onHand: true } },
        }),
      },
    });
  },

  async update(id: string, data: { sku?: string; name?: string; categoryId?: string; uomId?: string; unitCost?: number }) {
    if (data.categoryId) {
      const category = await prisma.productCategory.findUnique({ where: { id: data.categoryId } });
      if (!category) throw new Error('CATEGORY_NOT_FOUND');
    }
    if (data.uomId) {
      const uom = await prisma.uom.findUnique({ where: { id: data.uomId } });
      if (!uom) throw new Error('UOM_NOT_FOUND');
    }

    try {
      const product = await prisma.product.update({
        where: { id },
        data,
        include: {
          category: { select: { id: true, name: true } },
          uom: { select: { id: true, name: true } },
        },
      });
      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('PRODUCT_NOT_FOUND');
        if (error.code === 'P2002') throw new Error('PRODUCT_SKU_EXISTS');
      }
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await prisma.product.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('PRODUCT_NOT_FOUND');
        if (error.code === 'P2003') throw new Error('PRODUCT_HAS_STOCK_QUANTS_OR_MOVES');
      }
      throw error;
    }
  },
};