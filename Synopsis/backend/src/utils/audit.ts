import { PrismaClient } from '@prisma/client';

interface AuditLogData {
  eventType: string;
  entityType: string;
  entityId: string;
  performedById: string;
  details: Record<string, any>;
}

export const createAuditLog = async (
  prisma: PrismaClient,
  data: AuditLogData
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        eventType: data.eventType,
        entityType: data.entityType,
        entityId: data.entityId,
        performedById: data.performedById,
        details: data.details
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking the main operation
  }
};