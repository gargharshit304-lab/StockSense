import prisma from '../utils/prisma';
import { Prisma, DocType, DocStatus, MoveStatus } from '@prisma/client';

export const moveHistoryService = {
  async findAll(params: {
    page: number;
    limit: number;
    productId?: string;
    locationId?: string;
    docType?: DocType;
    status?: MoveStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { page, limit, productId, locationId, docType, status, dateFrom, dateTo } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMoveWhereInput = {
      ...(productId && { productId }),
      ...(locationId && {
        OR: [
          { srcLocationId: locationId },
          { destLocationId: locationId },
        ],
      }),
      ...(docType && { picking: { docType } }),
      ...(status && { moveStatus: status }),
      ...(dateFrom && { doneAt: { gte: dateFrom } }),
      ...(dateTo && { doneAt: { lte: dateTo } }),
    };

    const [items, total] = await Promise.all([
      prisma.stockMove.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { doneAt: 'desc' },
          { picking: { createdAt: 'desc' } },
        ],
        include: {
          picking: { select: { reference: true, docType: true, createdAt: true } },
          product: { select: { id: true, name: true, sku: true } },
          srcLocation: { select: { id: true, name: true, shortCode: true } },
          destLocation: { select: { id: true, name: true, shortCode: true } },
        },
      }),
      prisma.stockMove.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};

export const dashboardService = {
  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalProductsInStock,
      lowStockCount,
      outOfStockCount,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
      lateReceipts,
      receiptOps,
      lateDeliveries,
      deliveryOps,
    ] = await Promise.all([
      // totalProductsInStock: distinct products with onHand > 0 anywhere
      prisma.stockQuant.groupBy({
        by: ['productId'],
        where: { onHand: { gt: 0 } },
        _count: { productId: true },
      }).then(r => r.length),

      // lowStockCount: distinct products where ANY location has freeToUse > 0 and < 10
      prisma.stockQuant.groupBy({
        by: ['productId'],
        where: { freeToUse: { gt: 0, lt: 10 } },
        _count: { productId: true },
      }).then(r => r.length),

      // outOfStockCount: distinct products where freeToUse = 0 at at least one location with a quant
      prisma.stockQuant.groupBy({
        by: ['productId'],
        where: { freeToUse: { lte: 0 } },
        _count: { productId: true },
      }).then(r => r.length),

      // pendingReceipts
      prisma.stockPicking.count({
        where: {
          docType: DocType.RECEIPT,
          docStatus: { in: [DocStatus.DRAFT, DocStatus.WAITING, DocStatus.READY] },
        },
      }),

      // pendingDeliveries
      prisma.stockPicking.count({
        where: {
          docType: DocType.DELIVERY,
          docStatus: { in: [DocStatus.DRAFT, DocStatus.WAITING, DocStatus.READY] },
        },
      }),

      // scheduledTransfers
      prisma.stockPicking.count({
        where: {
          docType: DocType.INTERNAL_TRANSFER,
          docStatus: { in: [DocStatus.DRAFT, DocStatus.WAITING, DocStatus.READY] },
        },
      }),

      // lateReceipts: scheduledDate < today, not DONE/CANCELED
      prisma.stockPicking.count({
        where: {
          docType: DocType.RECEIPT,
          scheduledDate: { lt: today },
          docStatus: { notIn: [DocStatus.DONE, DocStatus.CANCELED] },
        },
      }),

      // receiptOps: DRAFT/WAITING/READY
      prisma.stockPicking.count({
        where: {
          docType: DocType.RECEIPT,
          docStatus: { in: [DocStatus.DRAFT, DocStatus.WAITING, DocStatus.READY] },
        },
      }),

      // lateDeliveries
      prisma.stockPicking.count({
        where: {
          docType: DocType.DELIVERY,
          scheduledDate: { lt: today },
          docStatus: { notIn: [DocStatus.DONE, DocStatus.CANCELED] },
        },
      }),

      // deliveryOps
      prisma.stockPicking.count({
        where: {
          docType: DocType.DELIVERY,
          docStatus: { in: [DocStatus.DRAFT, DocStatus.WAITING, DocStatus.READY] },
        },
      }),
    ]);

    return {
      totalProductsInStock,
      lowStockCount,
      outOfStockCount,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
      receiptsBreakdown: {
        late: lateReceipts,
        operations: receiptOps,
      },
      deliveriesBreakdown: {
        late: lateDeliveries,
        operations: deliveryOps,
      },
    };
  },

  async getFilters() {
    const [warehouses, categories] = await Promise.all([
      prisma.warehouse.findMany({
        select: { id: true, name: true, shortCode: true },
        orderBy: { name: 'asc' },
      }),
      prisma.productCategory.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      docTypes: ['RECEIPT', 'DELIVERY', 'INTERNAL_TRANSFER', 'ADJUSTMENT'],
      statuses: ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'],
      warehouses,
      categories,
    };
  },
};