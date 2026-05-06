import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Enum values as constants
const Role = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  INVENTORY_CLERK: 'INVENTORY_CLERK',
  TECHNICIAN: 'TECHNICIAN',
  AUDITOR: 'AUDITOR'
};

const LocationType = {
  WAREHOUSE: 'WAREHOUSE',
  FLOOR: 'FLOOR',
  DEPARTMENT: 'DEPARTMENT'
};

const AssetStatus = {
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  DISPOSED: 'DISPOSED'
};

const TransactionType = {
  INWARD: 'INWARD',
  OUTWARD: 'OUTWARD',
  TRANSFER: 'TRANSFER'
};

const MaintenanceType = {
  PREVENTIVE: 'PREVENTIVE',
  CORRECTIVE: 'CORRECTIVE'
};

const MaintenanceStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password for all users
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Engineering',
        description: 'Engineering and Development Department'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Operations',
        description: 'Operations and Logistics Department'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Finance',
        description: 'Finance and Accounting Department'
      }
    }),
    prisma.department.create({
      data: {
        name: 'IT',
        description: 'Information Technology Department'
      }
    })
  ]);

  console.log('✅ Created departments');

  // Create locations
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Main Warehouse',
        type: LocationType.WAREHOUSE,
        description: 'Primary storage facility'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Engineering Floor',
        type: LocationType.FLOOR,
        description: 'Engineering department floor'
      }
    }),
    prisma.location.create({
      data: {
        name: 'IT Department',
        type: LocationType.DEPARTMENT,
        description: 'IT department office space'
      }
    })
  ]);

  console.log('✅ Created locations');

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Vidushi Tripathi',
        email: 'vidushi@synopsis.com',
        passwordHash,
        role: Role.ADMIN,
        departmentId: departments[3].id // IT
      }
    }),
    prisma.user.create({
      data: {
        name: 'Rajesh Kumar',
        email: 'rajesh@synopsis.com',
        passwordHash,
        role: Role.MANAGER,
        departmentId: departments[1].id // Operations
      }
    }),
    prisma.user.create({
      data: {
        name: 'Priya Sharma',
        email: 'priya@synopsis.com',
        passwordHash,
        role: Role.INVENTORY_CLERK,
        departmentId: departments[1].id // Operations
      }
    }),
    prisma.user.create({
      data: {
        name: 'Amit Patel',
        email: 'amit@synopsis.com',
        passwordHash,
        role: Role.TECHNICIAN,
        departmentId: departments[0].id // Engineering
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sneha Reddy',
        email: 'sneha@synopsis.com',
        passwordHash,
        role: Role.AUDITOR,
        departmentId: departments[2].id // Finance
      }
    })
  ]);

  console.log('✅ Created users');

  // Create assets with warranty expiry within 25 days for 3 assets
  const now = new Date();
  const warrantyExpirySoon = new Date(now.getTime() + (20 * 24 * 60 * 60 * 1000)); // 20 days from now

  const assets = await Promise.all([
    // Assets with warranty expiring soon
    prisma.asset.create({
      data: {
        serialNo: 'LAP001',
        name: 'Dell Laptop XPS 13',
        description: 'Development laptop',
        assetType: 'Laptop',
        locationId: locations[1].id,
        status: AssetStatus.ASSIGNED,
        purchaseDate: new Date('2023-01-15'),
        cost: 1200.00,
        warrantyExpiry: warrantyExpirySoon,
        assignedToId: users[3].id,
        departmentId: departments[0].id
      }
    }),
    prisma.asset.create({
      data: {
        serialNo: 'SRV001',
        name: 'HP ProLiant Server',
        description: 'Main application server',
        assetType: 'Server',
        locationId: locations[2].id,
        status: AssetStatus.AVAILABLE,
        purchaseDate: new Date('2023-02-01'),
        cost: 3500.00,
        warrantyExpiry: warrantyExpirySoon,
        departmentId: departments[3].id
      }
    }),
    prisma.asset.create({
      data: {
        serialNo: 'PRN001',
        name: 'Canon Laser Printer',
        description: 'Office printer',
        assetType: 'Printer',
        locationId: locations[0].id,
        status: AssetStatus.UNDER_MAINTENANCE,
        purchaseDate: new Date('2023-03-01'),
        cost: 450.00,
        warrantyExpiry: warrantyExpirySoon,
        departmentId: departments[1].id
      }
    }),
    // Other assets
    prisma.asset.create({
      data: {
        serialNo: 'VEH001',
        name: 'Toyota Forklift',
        description: 'Warehouse forklift',
        assetType: 'Vehicle',
        locationId: locations[0].id,
        status: AssetStatus.AVAILABLE,
        purchaseDate: new Date('2022-06-15'),
        cost: 25000.00,
        warrantyExpiry: new Date('2025-06-15'),
        departmentId: departments[1].id
      }
    }),
    prisma.asset.create({
      data: {
        serialNo: 'GEN001',
        name: 'Caterpillar Generator',
        description: 'Backup power generator',
        assetType: 'Generator',
        locationId: locations[0].id,
        status: AssetStatus.AVAILABLE,
        purchaseDate: new Date('2022-08-20'),
        cost: 15000.00,
        warrantyExpiry: new Date('2025-08-20'),
        departmentId: departments[1].id
      }
    }),
    // More assets to reach 15 total
    ...Array.from({ length: 10 }, (_, i) => {
      const statuses = [AssetStatus.AVAILABLE, AssetStatus.ASSIGNED, AssetStatus.DISPOSED];
      const types = ['Laptop', 'Monitor', 'Projector', 'Tablet', 'Phone', 'Camera', 'Scanner', 'Router', 'Switch', 'UPS'];
      
      return prisma.asset.create({
        data: {
          serialNo: `AST${String(i + 6).padStart(3, '0')}`,
          name: `${types[i]} ${i + 6}`,
          description: `Asset ${i + 6} description`,
          assetType: types[i],
          locationId: locations[i % 3].id,
          status: statuses[i % 3],
          purchaseDate: new Date(2023, i % 12, 1),
          cost: Math.random() * 2000 + 100,
          warrantyExpiry: new Date(2025, (i + 6) % 12, 1),
          assignedToId: i % 2 === 0 ? users[i % users.length].id : undefined,
          departmentId: departments[i % departments.length].id
        }
      });
    })
  ]);

  console.log('✅ Created assets');

  // Create inventory items with low stock and out of stock items
  const inventoryItems = await Promise.all([
    // Low stock items (quantityOnHand < reorderLevel)
    prisma.inventoryItem.create({
      data: {
        name: 'A4 Paper',
        category: 'Office Supplies',
        unit: 'Ream',
        quantityOnHand: 5,
        reorderLevel: 20,
        locationId: locations[0].id,
        description: 'White A4 printing paper'
      }
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Toner Cartridge HP',
        category: 'Office Supplies',
        unit: 'Piece',
        quantityOnHand: 2,
        reorderLevel: 5,
        locationId: locations[0].id,
        description: 'HP LaserJet toner cartridge'
      }
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Safety Helmets',
        category: 'Safety Equipment',
        unit: 'Piece',
        quantityOnHand: 3,
        reorderLevel: 10,
        locationId: locations[0].id,
        description: 'Industrial safety helmets'
      }
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Ethernet Cables',
        category: 'Spare Parts',
        unit: 'Meter',
        quantityOnHand: 15,
        reorderLevel: 50,
        locationId: locations[2].id,
        description: 'Cat6 ethernet cables'
      }
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Cleaning Supplies',
        category: 'Consumables',
        unit: 'Bottle',
        quantityOnHand: 1,
        reorderLevel: 5,
        locationId: locations[0].id,
        description: 'Multi-purpose cleaning solution'
      }
    }),
    // Out of stock items (quantityOnHand = 0)
    prisma.inventoryItem.create({
      data: {
        name: 'Printer Ink Black',
        category: 'Office Supplies',
        unit: 'Cartridge',
        quantityOnHand: 0,
        reorderLevel: 3,
        locationId: locations[0].id,
        description: 'Black ink cartridge for inkjet printers'
      }
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Fire Extinguisher',
        category: 'Safety Equipment',
        unit: 'Piece',
        quantityOnHand: 0,
        reorderLevel: 2,
        locationId: locations[0].id,
        description: 'Portable fire extinguisher'
      }
    }),
    // Normal stock items
    ...Array.from({ length: 13 }, (_, i) => {
      const categories = ['Office Supplies', 'Spare Parts', 'Consumables', 'Safety Equipment'];
      const units = ['Piece', 'Box', 'Meter', 'Liter', 'Kilogram'];
      
      return prisma.inventoryItem.create({
        data: {
          name: `Item ${i + 8}`,
          category: categories[i % categories.length],
          unit: units[i % units.length],
          quantityOnHand: Math.floor(Math.random() * 100) + 20,
          reorderLevel: Math.floor(Math.random() * 20) + 5,
          locationId: locations[i % locations.length].id,
          description: `Description for item ${i + 8}`
        }
      });
    })
  ]);

  console.log('✅ Created inventory items');

  // Create inventory transactions over the last 60 days
  const transactions = [];
  for (let i = 0; i < 30; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 60);
    const transactionDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
    const types = [TransactionType.INWARD, TransactionType.OUTWARD, TransactionType.TRANSFER];
    const type = types[i % types.length];
    
    transactions.push(
      prisma.inventoryTransaction.create({
        data: {
          itemId: inventoryItems[i % inventoryItems.length].id,
          quantity: Math.floor(Math.random() * 20) + 1,
          type,
          date: transactionDate,
          fromLocationId: type === TransactionType.TRANSFER ? locations[0].id : undefined,
          toLocationId: type === TransactionType.TRANSFER ? locations[1].id : undefined,
          performedById: users[i % users.length].id,
          notes: `Transaction ${i + 1} notes`
        }
      })
    );
  }

  await Promise.all(transactions);
  console.log('✅ Created inventory transactions');

  // Create maintenance records with upcoming alerts
  const upcomingDate1 = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)); // 2 days from now
  const upcomingDate2 = new Date(now.getTime() + (4 * 24 * 60 * 60 * 1000)); // 4 days from now

  const maintenanceRecords = await Promise.all([
    // Upcoming maintenance (within 5 days)
    prisma.maintenanceRecord.create({
      data: {
        assetId: assets[0].id,
        maintenanceType: MaintenanceType.PREVENTIVE,
        scheduledDate: upcomingDate1,
        technicianId: users[3].id,
        status: MaintenanceStatus.SCHEDULED,
        remarks: 'Routine laptop maintenance'
      }
    }),
    prisma.maintenanceRecord.create({
      data: {
        assetId: assets[1].id,
        maintenanceType: MaintenanceType.CORRECTIVE,
        scheduledDate: upcomingDate2,
        technicianId: users[3].id,
        status: MaintenanceStatus.SCHEDULED,
        remarks: 'Server hardware check'
      }
    }),
    // Other maintenance records
    ...Array.from({ length: 8 }, (_, i) => {
      const statuses = [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.COMPLETED];
      const types = [MaintenanceType.PREVENTIVE, MaintenanceType.CORRECTIVE];
      const status = statuses[i % statuses.length];
      
      return prisma.maintenanceRecord.create({
        data: {
          assetId: assets[(i + 2) % assets.length].id,
          maintenanceType: types[i % types.length],
          scheduledDate: new Date(now.getTime() + ((i + 10) * 24 * 60 * 60 * 1000)),
          completedDate: status === MaintenanceStatus.COMPLETED ? new Date() : undefined,
          technicianId: users[3].id,
          cost: status === MaintenanceStatus.COMPLETED ? Math.random() * 500 + 50 : undefined,
          status,
          remarks: `Maintenance record ${i + 3}`
        }
      });
    })
  ]);

  console.log('✅ Created maintenance records');

  // Create audit log entries
  const auditLogs = [];
  for (let i = 0; i < 20; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const logDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
    const eventTypes = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
    const entityTypes = ['Asset', 'InventoryItem', 'User', 'MaintenanceRecord'];
    
    auditLogs.push(
      prisma.auditLog.create({
        data: {
          eventType: eventTypes[i % eventTypes.length],
          entityType: entityTypes[i % entityTypes.length],
          entityId: `entity_${i + 1}`,
          performedById: users[i % users.length].id,
          details: JSON.stringify({
            action: `Action ${i + 1}`,
            changes: { field: 'value' }
          }),
          timestamp: logDate
        }
      })
    );
  }

  await Promise.all(auditLogs);
  console.log('✅ Created audit logs');

  // Create notifications for admin user (5 unread)
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id, // Alice Admin
        message: 'Low stock alert: A4 Paper is running low',
        type: 'warning',
        isRead: false,
        link: '/inventory'
      }
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        message: 'Warranty expiring soon for Dell Laptop XPS 13',
        type: 'warning',
        isRead: false,
        link: '/assets/LAP001'
      }
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        message: 'Maintenance scheduled for HP ProLiant Server',
        type: 'info',
        isRead: false,
        link: '/maintenance'
      }
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        message: 'Out of stock: Printer Ink Black',
        type: 'error',
        isRead: false,
        link: '/inventory'
      }
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        message: 'New user registered: Tom Technician',
        type: 'info',
        isRead: false,
        link: '/users'
      }
    })
  ]);

  console.log('✅ Created notifications');

  console.log('🎉 Seed completed successfully!');
  console.log(`
📊 Summary:
- ${departments.length} departments
- ${locations.length} locations  
- ${users.length} users
- ${assets.length} assets (3 with warranty expiring soon)
- ${inventoryItems.length} inventory items (5 low stock, 2 out of stock)
- 30 inventory transactions
- ${maintenanceRecords.length} maintenance records (2 upcoming)
- 20 audit log entries
- ${notifications.length} unread notifications for admin

🔐 Login credentials (password: password123):
- vidushi@synopsis.com (Admin)
- rajesh@synopsis.com (Manager)  
- priya@synopsis.com (Inventory Clerk)
- amit@synopsis.com (Technician)
- sneha@synopsis.com (Auditor)
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });