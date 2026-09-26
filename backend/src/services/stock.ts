import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const stockService = {
  async findAll(params: {
    page: number;
    limit: number;
    locationId?: string;
    warehouseId?: string;
    productId?: string;
    lowStockOnly: boolean;
  }) {
    const { page, limit, locationId, warehouseId, productId, lowStockOnly } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.StockQuantWhereInput = {
      ...(locationId && { locationId }),
      ...(productId && { productId }),
      ...(warehouseId && { location: { warehouseId } }),
      ...(lowStockOnly && { freeToUse: { lt: 10 } }), // TODO: replace hardcoded 10 with per-product reorder threshold
    };

    const [items, total] = await Promise.all([
      prisma.stockQuant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { product: { name: 'asc' } },
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              unitCost: true,
              uom: { select: { id: true, name: true } },
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              shortCode: true,
              warehouse: { select: { id: true, name: true, shortCode: true } },
            },
          },
        },
      }),
      prisma.stockQuant.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findByProductAndLocation(productId: string, locationId: string) {
    return prisma.stockQuant.findFirst({
      where: { productId, locationId },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unitCost: true,
            uom: { select: { id: true, name: true } },
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            shortCode: true,
            warehouse: { select: { id: true, name: true, shortCode: true } },
          },
        },
      },
    });
  },

  async updateOnHand(productId: string, locationId: string, newOnHand: number, userId: string) {
    // Use a transaction to update StockQuant and create StockMove atomically
    return prisma.$transaction(async (tx) => {
      const existing = await tx.stockQuant.findFirst({
        where: { productId, locationId },
      });

      if (!existing) {
        throw new Error('STOCK_QUANT_NOT_FOUND');
      }

      const oldOnHand = Number(existing.onHand);
      const delta = newOnHand - oldOnHand;
      const newFreeToUse = newOnHand - Number(existing.reservedQty);

      // Update StockQuant
      const updated = await tx.stockQuant.update({
        where: { id: existing.id },
        data: {
          onHand: newOnHand,
          freeToUse: newFreeToUse,
        },
        include: {
          product: {
            select: { id: true, sku: true, name: true, unitCost: true },
          },
          location: {
            select: { id: true, name: true, warehouse: { select: { id: true, name: true } } },
          },
        },
      });

      // Create a dummy picking for the adjustment (or use a special one)
      // Since StockMove requires a pickingId, we'll create a minimal picking record
      const picking = await tx.stockPicking.create({
        data: {
          reference: `ADJ-${Date.now()}`,
          docType: 'ADJUSTMENT',
          responsibleId: userId,
          scheduledDate: new Date(),
          docStatus: 'DONE',
        },
      });

      // Create StockMove for audit trail
      await tx.stockMove.create({
        data: {
          pickingId: picking.id,
          productId,
          srcLocationId: locationId,
          destLocationId: locationId,
          quantity: Math.abs(delta), // quantity is always positive in stock moves
          moveStatus: 'DONE',
          doneAt: new Date(),
          note: `Manual stock override: ${delta > 0 ? '+' : ''}${delta.toFixed(2)}`,
        },
      });

      return updated;
    });
  },
};