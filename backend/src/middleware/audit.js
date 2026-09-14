import { AuditLog } from '../models/AuditLog.js';

export const logAuditTrail = async ({
  actorId = null,
  actorRole = 'System',
  action,
  entityName,
  entityId,
  beforeState = null,
  afterState = null,
  ipAddress = '',
  notes = '',
}) => {
  try {
    const logEntry = await AuditLog.create({
      actorId,
      actorRole,
      action,
      entityName,
      entityId: String(entityId),
      beforeState,
      afterState,
      ipAddress,
      notes,
      timestamp: new Date(),
    });
    return logEntry;
  } catch (error) {
    console.error(`[AuditLog Error] Failed to record audit log: ${error.message}`);
    // Non-blocking in non-critical catch, but logged
  }
};
