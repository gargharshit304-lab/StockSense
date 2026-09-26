import prisma from '../utils/prisma';
import { Prisma, DocType, DocStatus, MoveStatus, NotificationType, UserRole } from '@prisma/client';

const OPERATION_CODES: Record<DocType, string> = {
  RECEIPT: 'IN',
  DELIVERY: 'OUT',
  INTERNAL_TRANSFER: 'INT',
  ADJUSTMENT: 'ADJ',
};

type MovementType = 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT';

interface StockMoveLine {
  productId: string;
  quantity: number;
  srcLocationId?: string;
  destLocationId?: string;
}

interface ValidationContext {
  docType: DocType;
  movementType: MovementType;
  requiresStockCheck: boolean;
  srcLocationId: string;
  destLocationId: string;
  lines: StockMoveLine[];
}

async function getNextReferenceNumber(tx: Prisma.TransactionClient, warehouseId: string, docType: DocType): Promise<number> {
  const counter = await tx.referenceCounter.upsert({
    where: {
      reference_counter_warehouse_doctype_unique: {
        warehouseId,
        docType,
      },
    },
    update: {
      lastNumber: { increment: 1 },
    },
    create: {
      warehouseId,
      docType,
      lastNumber: 1,
    },
  });
  return counter.lastNumber;
}

function formatReference(warehouseShortCode: string, docType: DocType, number: number): string {
  const opCode = OPERATION_CODES[docType];
  return `${warehouseShortCode}/${opCode}/${String(number).padStart(4, '0')}`;
}

async function getOrCreateVirtualLocation(
  tx: Prisma.TransactionClient,
  warehouseId: string,
  partnerId: string,
  partnerType: 'VENDOR' | 'CUSTOMER',
  partnerName: string
): Promise<string> {
  const virtualShortCode = partnerType === 'VENDOR' ? `VENDOR-${partnerId.slice(0, 8)}` : `CUSTOMER-${partnerId.slice(0, 8)}`;
  const virtualName = `${partnerType === 'VENDOR' ? 'Vendor' : 'Customer'}: ${partnerName}`;

  const existing = await tx.location.findFirst({
    where: {
      warehouseId,
      shortCode: virtualShortCode,
      isVirtual: true,
    },
  });

  if (existing) {
    return existing.id;
  }

  const created = await tx.location.create({
    data: {
      warehouseId,
      name: virtualName,
      shortCode: virtualShortCode,
      isVirtual: true,
    },
  });

  return created.id;
}

async function checkStockAvailability(
  tx: Prisma.TransactionClient,
  lines: { productId: string; quantity: number }[],
  srcLocationId: string
): Promise<{ productId: string; productName: string; available: number; required: number }[]> {
  const productIds = lines.map(l => l.productId);
  const quants = await tx.stockQuant.findMany({
    where: {
      productId: { in: productIds },
      locationId: srcLocationId,
    },
    include: { product: { select: { name: true } } },
  });

  const quantMap = new Map(quants.map(q => [q.productId, { freeToUse: Number(q.freeToUse), name: q.product.name }]));

  const shortages: { productId: string; productName: string; available: number; required: number }[] = [];
  for (const line of lines) {
    const quant = quantMap.get(line.productId);
    const available = quant?.freeToUse ?? 0;
    if (available < line.quantity) {
      shortages.push({
        productId: line.productId,
        productName: quant?.name ?? 'Unknown',
        available,
        required: line.quantity,
      });
    }
  }

  return shortages;
}

async function applyStockMoves(
  tx: Prisma.TransactionClient,
  ctx: ValidationContext
): Promise<void> {
  for (const line of ctx.lines) {
    const { productId, quantity, srcLocationId, destLocationId } = line;
    const src = srcLocationId ?? ctx.srcLocationId;
    const dest = destLocationId ?? ctx.destLocationId;

    if (ctx.movementType === 'ADJUSTMENT') {
      const existing = await tx.stockQuant.findUnique({
        where: { stock_quant_product_location_unique: { productId, locationId: src } },
      });
      const currentOnHand = Number(existing?.onHand ?? 0);
      const newOnHand = quantity;
      const delta = newOnHand - currentOnHand;
      const newFreeToUse = newOnHand - Number(existing?.reservedQty ?? 0);

      await tx.stockQuant.upsert({
        where: { stock_quant_product_location_unique: { productId, locationId: src } },
        update: { onHand: newOnHand, freeToUse: newFreeToUse },
        create: { productId, locationId: src, onHand: newOnHand, freeToUse: newFreeToUse, reservedQty: 0 },
      });
    } else {
      if (src) {
        await tx.stockQuant.upsert({
          where: { stock_quant_product_location_unique: { productId, locationId: src } },
          update: { onHand: { decrement: quantity }, freeToUse: { decrement: quantity } },
          create: { productId, locationId: src, onHand: -quantity, freeToUse: -quantity, reservedQty: 0 },
        });
      }

      await tx.stockQuant.upsert({
        where: { stock_quant_product_location_unique: { productId, locationId: dest } },
        update: { onHand: { increment: quantity }, freeToUse: { increment: quantity } },
        create: { productId, locationId: dest, onHand: quantity, freeToUse: quantity, reservedQty: 0 },
      });
    }
  }
}

async function createLowStockNotifications(
  tx: Prisma.TransactionClient,
  lines: { productId: string }[],
  locations: string[]
): Promise<void> {
  const quants = await tx.stockQuant.findMany({
    where: {
      productId: { in: lines.map(l => l.productId) },
      locationId: { in: locations },
    },
    include: { product: { select: { name: true } } },
  });

  const adminUsers = await tx.user.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER] } },
    select: { id: true },
  });

  for (const quant of quants) {
    const freeToUse = Number(quant.freeToUse);
    if (freeToUse <= 0) {
      for (const user of adminUsers) {
        await tx.notification.create({
          data: {
            userId: user.id,
            notifType: NotificationType.OUT_OF_STOCK,
            title: 'Out of Stock',
            message: `Product ${quant.product.name} is out of stock at location.`,
            productId: quant.productId,
          },
        });
      }
    } else if (freeToUse < 10) {
      for (const user of adminUsers) {
        await tx.notification.create({
          data: {
            userId: user.id,
            notifType: NotificationType.LOW_STOCK,
            title: 'Low Stock Alert',
            message: `Product ${quant.product.name} is running low with only ${freeToUse} units remaining.`,
            productId: quant.productId,
          },
        });
      }
    }
  }
}

function buildValidationContext(docType: DocType, picking: any): ValidationContext {
  const srcLocationId = picking.stockMoves[0]?.srcLocationId;
  const destLocationId = picking.stockMoves[0]?.destLocationId;
  const lines = picking.stockMoves.map((m: any) => ({
    productId: m.productId,
    quantity: Number(m.quantity),
    srcLocationId: m.srcLocationId,
    destLocationId: m.destLocationId,
  }));

  switch (docType) {
    case 'RECEIPT':
      return {
        docType,
        movementType: 'RECEIPT',
        requiresStockCheck: false,
        srcLocationId: destLocationId,
        destLocationId,
        lines,
      };
    case 'DELIVERY':
      return {
        docType,
        movementType: 'DELIVERY',
        requiresStockCheck: true,
        srcLocationId: srcLocationId!,
        destLocationId,
        lines,
      };
    case 'INTERNAL_TRANSFER':
      return {
        docType,
        movementType: 'TRANSFER',
        requiresStockCheck: true,
        srcLocationId: srcLocationId!,
        destLocationId,
        lines,
      };
    case 'ADJUSTMENT':
      return {
        docType,
        movementType: 'ADJUSTMENT',
        requiresStockCheck: false,
        srcLocationId: srcLocationId!,
        destLocationId,
        lines,
      };
    default:
      throw new Error(`Unknown docType: ${docType}`);
  }
}

interface CreatePickingParams {
  docType: DocType;
  warehouseId: string;
  partnerId?: string;
  scheduledDate: Date;
  responsibleId: string;
  srcLocationId?: string;
  destLocationId?: string;
  locationId?: string;
  lines: { productId: string; quantity: number; countedQuantity?: number }[];
}

interface FindAllParams {
  page: number;
  limit: number;
  status?: DocStatus;
  warehouseId?: string;
  search?: string;
}

export const pickingService = {
  async create(params: CreatePickingParams) {
    return prisma.$transaction(async (tx) => {
      const warehouse = await tx.warehouse.findUniqueOrThrow({
        where: { id: params.warehouseId },
        select: { shortCode: true },
      });

      let partnerName: string | undefined;
      let partnerType: 'VENDOR' | 'CUSTOMER' | undefined;
      if (params.partnerId) {
        const partner = await tx.partner.findUniqueOrThrow({
          where: { id: params.partnerId },
          select: { name: true, partnerType: true },
        });
        partnerName = partner.name;
        partnerType = partner.partnerType === 'VENDOR' ? 'VENDOR' : 'CUSTOMER';
      }

      const refNumber = await getNextReferenceNumber(tx, params.warehouseId, params.docType);
      const reference = formatReference(warehouse.shortCode, params.docType, refNumber);

      let srcLocationId: string | null = null;
      let destLocationId: string;
      let partnerIdForPicking: string | null = params.partnerId ?? null;

      switch (params.docType) {
        case 'RECEIPT': {
          srcLocationId = await getOrCreateVirtualLocation(
            tx,
            params.warehouseId,
            params.partnerId!,
            'VENDOR',
            partnerName!
          );
          destLocationId = params.destLocationId ?? params.locationId!;
          break;
        }
        case 'DELIVERY': {
          srcLocationId = params.srcLocationId ?? params.locationId!;
          destLocationId = await getOrCreateVirtualLocation(
            tx,
            params.warehouseId,
            params.partnerId!,
            'CUSTOMER',
            partnerName!
          );
          break;
        }
        case 'INTERNAL_TRANSFER': {
          srcLocationId = params.srcLocationId!;
          destLocationId = params.destLocationId!;
          partnerIdForPicking = null;

          const [srcLoc, destLoc] = await Promise.all([
            tx.location.findUnique({ where: { id: srcLocationId }, select: { warehouseId: true, isVirtual: true } }),
            tx.location.findUnique({ where: { id: destLocationId }, select: { warehouseId: true, isVirtual: true } }),
          ]);

          if (srcLoc?.isVirtual || destLoc?.isVirtual) {
            throw new Error('INVALID_LOCATION: Transfer locations must be non-virtual');
          }
          if (srcLoc?.warehouseId !== destLoc?.warehouseId) {
            console.warn(`Cross-warehouse transfer: ${srcLoc?.warehouseId} -> ${destLoc?.warehouseId}`);
          }
          break;
        }
        case 'ADJUSTMENT': {
          srcLocationId = params.locationId!;
          destLocationId = params.locationId!;
          partnerIdForPicking = null;

          const loc = await tx.location.findUnique({ where: { id: srcLocationId }, select: { isVirtual: true } });
          if (loc?.isVirtual) {
            throw new Error('INVALID_LOCATION: Adjustment location must be non-virtual');
          }
          break;
        }
      }

      const moveLines = params.lines.map(line => ({
        productId: line.productId,
        quantity: params.docType === 'ADJUSTMENT' ? line.countedQuantity ?? line.quantity : line.quantity,
        srcLocationId: srcLocationId!,
        destLocationId,
        note: params.docType === 'ADJUSTMENT' ? 'Stock adjustment' : undefined,
      }));

      const picking = await tx.stockPicking.create({
        data: {
          reference,
          docType: params.docType,
          partnerId: partnerIdForPicking,
          responsibleId: params.responsibleId,
          scheduledDate: params.scheduledDate,
          docStatus: DocStatus.DRAFT,
          stockMoves: { create: moveLines },
        },
        include: {
          partner: { select: { id: true, name: true, partnerType: true } },
          responsible: { select: { id: true, fullName: true, email: true } },
          stockMoves: {
            include: {
              product: { select: { id: true, sku: true, name: true, unitCost: true } },
              srcLocation: { select: { id: true, name: true, shortCode: true, isVirtual: true } },
              destLocation: { select: { id: true, name: true, shortCode: true, isVirtual: true } },
            },
          },
        },
      });

      return picking;
    });
  },

  async findAll(docType: DocType, params: FindAllParams) {
    const { page, limit, status, warehouseId, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.StockPickingWhereInput = {
      docType,
      ...(status && { docStatus: status }),
      ...(warehouseId && {
        stockMoves: {
          some: {
            OR: [
              { srcLocation: { warehouseId } },
              { destLocation: { warehouseId } },
            ],
          },
        },
      }),
      ...(search && {
        OR: [
          { reference: { contains: search, mode: 'insensitive' } },
          { partner: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.stockPicking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          partner: { select: { id: true, name: true, partnerType: true } },
          responsible: { select: { id: true, fullName: true } },
          stockMoves: {
            include: {
              product: { select: { id: true, sku: true, name: true } },
              srcLocation: { select: { id: true, name: true, shortCode: true, isVirtual: true } },
              destLocation: { select: { id: true, name: true, shortCode: true, isVirtual: true } },
            },
          },
        },
      }),
      prisma.stockPicking.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findById(id: string, docType: DocType) {
    return prisma.stockPicking.findFirst({
      where: { id, docType },
      include: {
        partner: { select: { id: true, name: true, partnerType: true, contactInfo: true } },
        responsible: { select: { id: true, fullName: true, email: true } },
        stockMoves: {
          include: {
            product: { select: { id: true, sku: true, name: true, unitCost: true } },
            srcLocation: { select: { id: true, name: true, shortCode: true, isVirtual: true, warehouse: { select: { id: true, name: true, shortCode: true } } } },
            destLocation: { select: { id: true, name: true, shortCode: true, isVirtual: true, warehouse: { select: { id: true, name: true, shortCode: true } } } },
          },
        },
      },
    });
  },

  async update(id: string, docType: DocType, data: {
    scheduledDate?: Date;
    responsibleId?: string;
    lines?: { productId: string; quantity: number; countedQuantity?: number }[];
  }) {
    return prisma.$transaction(async (tx) => {
      const picking = await tx.stockPicking.findFirst({
        where: { id, docType },
        include: { stockMoves: true },
      });

      if (!picking) {
        throw new Error('PICKING_NOT_FOUND');
      }

      if (picking.docStatus === DocStatus.DONE || picking.docStatus === DocStatus.CANCELED) {
        throw new Error('CANNOT_EDIT_DONE_OR_CANCELED');
      }

      if (data.scheduledDate || data.responsibleId) {
        await tx.stockPicking.update({
          where: { id },
          data: {
            ...(data.scheduledDate && { scheduledDate: data.scheduledDate }),
            ...(data.responsibleId && { responsibleId: data.responsibleId }),
          },
        });
      }

      if (data.lines) {
        await tx.stockMove.deleteMany({ where: { pickingId: id } });
        const baseMove = picking.stockMoves[0];
        const moveLines = data.lines.map(line => ({
          pickingId: id,
          productId: line.productId,
          srcLocationId: baseMove?.srcLocationId ?? '',
          destLocationId: baseMove?.destLocationId ?? '',
          quantity: docType === 'ADJUSTMENT' ? (line.countedQuantity ?? line.quantity) : line.quantity,
          moveStatus: MoveStatus.DRAFT,
          note: docType === 'ADJUSTMENT' ? 'Stock adjustment' : null,
        }));
        await tx.stockMove.createMany({ data: moveLines });
      }

      return this.findById(id, docType);
    });
  },

  async validate(id: string, docType: DocType) {
    return prisma.$transaction(async (tx) => {
      const picking = await tx.stockPicking.findFirst({
        where: { id, docType },
        include: { stockMoves: { include: { product: { select: { name: true } } } } },
      });

      if (!picking) throw new Error('PICKING_NOT_FOUND');
      if (picking.docStatus === DocStatus.DONE || picking.docStatus === DocStatus.CANCELED) {
        throw new Error('ALREADY_DONE_OR_CANCELED');
      }

      const ctx = buildValidationContext(docType, picking);

      if (ctx.requiresStockCheck && ctx.srcLocationId) {
        const checkLines = ctx.lines.map(l => ({ productId: l.productId, quantity: l.quantity }));
        const shortages = await checkStockAvailability(tx, checkLines, ctx.srcLocationId);
        if (shortages.length > 0) {
          await tx.stockPicking.update({ where: { id }, data: { docStatus: DocStatus.WAITING } });
          throw { code: 'INSUFFICIENT_STOCK', shortages };
        }
      }

      await applyStockMoves(tx, ctx);

      await tx.stockMove.updateMany({
        where: { pickingId: id },
        data: { moveStatus: MoveStatus.DONE, doneAt: new Date() },
      });

      await tx.stockPicking.update({ where: { id }, data: { docStatus: DocStatus.DONE } });

      const notificationLocations = ctx.movementType === 'ADJUSTMENT'
        ? [ctx.srcLocationId!]
        : ctx.requiresStockCheck && ctx.srcLocationId
          ? [ctx.srcLocationId, ctx.destLocationId]
          : [ctx.destLocationId];

      await createLowStockNotifications(tx, ctx.lines, notificationLocations);

      return this.findById(id, docType);
    });
  },

  async cancel(id: string, docType: DocType) {
    return prisma.$transaction(async (tx) => {
      const picking = await tx.stockPicking.findFirst({ where: { id, docType } });
      if (!picking) throw new Error('PICKING_NOT_FOUND');
      if (picking.docStatus === DocStatus.DONE) throw new Error('CANNOT_CANCEL_DONE');

      await tx.stockMove.updateMany({ where: { pickingId: id }, data: { moveStatus: MoveStatus.CANCELED } });
      await tx.stockPicking.update({ where: { id }, data: { docStatus: DocStatus.CANCELED } });

      return this.findById(id, docType);
    });
  },
};