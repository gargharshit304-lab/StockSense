import { PrismaClient, UserRole, PartnerType, DocType, DocStatus, NotificationType, OtpPurpose } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stocksense.com' },
    update: {},
    create: {
      email: 'admin@stocksense.com',
      passwordHash,
      fullName: 'Admin User',
      role: UserRole.ADMIN,
      isTwoFactorEnabled: true,
    },
  })

  const warehouse1 = await prisma.warehouse.upsert({
    where: { shortCode: 'WH001' },
    update: {},
    create: {
      name: 'Main Warehouse',
      shortCode: 'WH001',
      address: '123 Main St, City, Country',
    },
  })

  const warehouse2 = await prisma.warehouse.upsert({
    where: { shortCode: 'WH002' },
    update: {},
    create: {
      name: 'Secondary Warehouse',
      shortCode: 'WH002',
      address: '456 Secondary Ave, City, Country',
    },
  })

  const location1a = await prisma.location.upsert({
    where: { location_warehouse_short_code_unique: { warehouseId: warehouse1.id, shortCode: 'A01' } },
    update: {},
    create: {
      warehouseId: warehouse1.id,
      name: 'Aisle A',
      shortCode: 'A01',
    },
  })

  const location1b = await prisma.location.upsert({
    where: { location_warehouse_short_code_unique: { warehouseId: warehouse1.id, shortCode: 'B01' } },
    update: {},
    create: {
      warehouseId: warehouse1.id,
      name: 'Aisle B',
      shortCode: 'B01',
    },
  })

  const location2a = await prisma.location.upsert({
    where: { location_warehouse_short_code_unique: { warehouseId: warehouse2.id, shortCode: 'A01' } },
    update: {},
    create: {
      warehouseId: warehouse2.id,
      name: 'Aisle A',
      shortCode: 'A01',
    },
  })

  const location2b = await prisma.location.upsert({
    where: { location_warehouse_short_code_unique: { warehouseId: warehouse2.id, shortCode: 'B01' } },
    update: {},
    create: {
      warehouseId: warehouse2.id,
      name: 'Aisle B',
      shortCode: 'B01',
    },
  })

  const category1 = await prisma.productCategory.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' },
  })

  const category2 = await prisma.productCategory.upsert({
    where: { name: 'Office Supplies' },
    update: {},
    create: { name: 'Office Supplies' },
  })

  const uom = await prisma.uom.upsert({
    where: { name: 'unit' },
    update: {},
    create: { name: 'unit' },
  })

  const product1 = await prisma.product.upsert({
    where: { sku: 'PROD-001' },
    update: {},
    create: {
      sku: 'PROD-001',
      name: 'Wireless Mouse',
      categoryId: category1.id,
      uomId: uom.id,
      unitCost: 25.99,
    },
  })

  const product2 = await prisma.product.upsert({
    where: { sku: 'PROD-002' },
    update: {},
    create: {
      sku: 'PROD-002',
      name: 'Mechanical Keyboard',
      categoryId: category1.id,
      uomId: uom.id,
      unitCost: 89.99,
    },
  })

  const product3 = await prisma.product.upsert({
    where: { sku: 'PROD-003' },
    update: {},
    create: {
      sku: 'PROD-003',
      name: 'A4 Paper Pack',
      categoryId: category2.id,
      uomId: uom.id,
      unitCost: 5.99,
    },
  })

  await prisma.stockQuant.upsert({
    where: { stock_quant_product_location_unique: { productId: product1.id, locationId: location1a.id } },
    update: {},
    create: {
      productId: product1.id,
      locationId: location1a.id,
      onHand: 100,
      reservedQty: 10,
      freeToUse: 90,
    },
  })

  await prisma.stockQuant.upsert({
    where: { stock_quant_product_location_unique: { productId: product2.id, locationId: location1a.id } },
    update: {},
    create: {
      productId: product2.id,
      locationId: location1a.id,
      onHand: 50,
      reservedQty: 5,
      freeToUse: 45,
    },
  })

  await prisma.stockQuant.upsert({
    where: { stock_quant_product_location_unique: { productId: product3.id, locationId: location1b.id } },
    update: {},
    create: {
      productId: product3.id,
      locationId: location1b.id,
      onHand: 5,
      reservedQty: 0,
      freeToUse: 5,
    },
  })

  const vendor = await prisma.partner.upsert({
    where: { id: 'vendor-1' },
    update: {},
    create: {
      id: 'vendor-1',
      name: 'Tech Supplies Inc.',
      partnerType: PartnerType.VENDOR,
      contactInfo: 'contact@techsupplies.com | +1-555-0100',
    },
  })

  const customer = await prisma.partner.upsert({
    where: { id: 'customer-1' },
    update: {},
    create: {
      id: 'customer-1',
      name: 'Acme Corporation',
      partnerType: PartnerType.CUSTOMER,
      contactInfo: 'orders@acme.com | +1-555-0200',
    },
  })

  await prisma.notification.create({
    data: {
      userId: admin.id,
      notifType: NotificationType.LOW_STOCK,
      title: 'Low Stock Alert',
      message: 'Product A4 Paper Pack (PROD-003) is running low with only 5 units remaining.',
      productId: product3.id,
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })