import { AuditLog } from '../models/AuditLog.js';

let memAuditLogs = [];

export const getMemAuditLogs = () => memAuditLogs;
export const resetMemAuditLogs = () => {
  memAuditLogs = [];
};

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
  const entry = {
    _id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
  };

  memAuditLogs.push(entry);

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
    // Non-blocking in test or disconnected DB
    return entry;
  }
};
