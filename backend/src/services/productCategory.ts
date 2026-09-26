import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const productCategoryService = {
  async create(data: { name: string }) {
    try {
      return await prisma.productCategory.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('PRODUCT_CATEGORY_NAME_EXISTS');
      }
      throw error;
    }
  },

  async findAll(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductCategoryWhereInput = search ? {
      name: { contains: search, mode: 'insensitive' },
    } : {};

    const [items, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.productCategory.count({ where }),
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
    return prisma.productCategory.findUnique({
      where: { id },
    });
  },

  async update(id: string, data: { name?: string }) {
    try {
      return await prisma.productCategory.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('PRODUCT_CATEGORY_NOT_FOUND');
        }
        if (error.code === 'P2002') {
          throw new Error('PRODUCT_CATEGORY_NAME_EXISTS');
        }
      }
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await prisma.productCategory.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('PRODUCT_CATEGORY_NOT_FOUND');
        }
        if (error.code === 'P2003') {
          throw new Error('PRODUCT_CATEGORY_HAS_PRODUCTS');
        }
      }
      throw error;
    }
  },
};