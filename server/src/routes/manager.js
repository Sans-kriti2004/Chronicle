import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { computeArcHealth } from '../services/arcHealth.js';
import { ensureGoalLimit, validateGoalPayload } from '../services/validation.js';

export const managerRouter = Router();

const sheetInclude = {
  goals: { include: { achievements: true }, orderBy: { createdAt: 'asc' } },
  checkIns: { orderBy: { createdAt: 'desc' } }
};

managerRouter.get('/team', async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    const cycle = await prisma.cycle.findUnique({ where: { year } });
    const reports = await prisma.user.findMany({
      where: { managerId: req.user.id },
      include: { goalSheets: { where: { cycleYear: year }, include: sheetInclude } },
      orderBy: { name: 'asc' }
    });

    const team = reports.map((report) => {
      const sheet = report.goalSheets[0] || null;
      return { ...report, password: undefined, arcHealth: computeArcHealth(sheet, cycle), sheet };
    });

    res.json({ team, cycle });
  } catch (err) {
    next(err);
  }
});

managerRouter.put('/sheet/:id/approve', async (req, res, next) => {
  try {
    const sheet = await prisma.goalSheet.findUnique({ where: { id: req.params.id }, include: { user: true, goals: true } });
    if (!sheet || sheet.user.managerId !== req.user.id) return res.status(404).json({ message: 'Chronicle not found on your desk' });

    const updated = await prisma.$transaction(async (tx) => {
      await tx.goal.updateMany({ where: { goalSheetId: sheet.id }, data: { isLocked: true } });
      const approved = await tx.goalSheet.update({
        where: { id: sheet.id },
        data: { status: 'APPROVED', approvedAt: new Date() },
        include: sheetInclude
      });
      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'PUBLISHED_CHRONICLE',
          oldValue: sheet.status,
          newValue: `${sheet.user.name}'s Chronicle was published`
        }
      });
      return approved;
    });

    res.json({ sheet: updated });
  } catch (err) {
    next(err);
  }
});

managerRouter.put('/sheet/:id/return', async (req, res, next) => {
  try {
    const sheet = await prisma.goalSheet.findUnique({ where: { id: req.params.id }, include: { user: true } });
    if (!sheet || sheet.user.managerId !== req.user.id) return res.status(404).json({ message: 'Chronicle not found on your desk' });

    const updated = await prisma.$transaction(async (tx) => {
      const returned = await tx.goalSheet.update({ where: { id: sheet.id }, data: { status: 'RETURNED' }, include: sheetInclude });
      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'RETURNED_CHRONICLE',
          oldValue: sheet.status,
          newValue: `${sheet.user.name}'s Chronicle was sent back: ${req.body.reason || 'Sent back for revision'}`
        }
      });
      return returned;
    });
    res.json({ sheet: updated });
  } catch (err) {
    next(err);
  }
});

managerRouter.put('/goal/:id', async (req, res, next) => {
  try {
    validateGoalPayload(req.body, { partial: true });
    const existing = await prisma.goal.findUnique({ where: { id: req.params.id }, include: { goalSheet: { include: { user: true } } } });
    if (!existing || existing.goalSheet.user.managerId !== req.user.id) return res.status(404).json({ message: 'Chapter not found on your desk' });
    if (existing.goalSheet.status === 'APPROVED') return res.status(403).json({ message: 'Published chapters need an admin unlock' });

    const goal = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        target: req.body.target === undefined ? undefined : Number(req.body.target),
        weightage: req.body.weightage === undefined ? undefined : Number(req.body.weightage)
      }
    });

    res.json({ goal });
  } catch (err) {
    next(err);
  }
});

managerRouter.post('/checkin', async (req, res, next) => {
  try {
    const { goalSheetId, quarter, comment } = req.body;
    if (!comment?.trim()) return res.status(400).json({ message: 'Plot Notes need a comment before saving' });
    const sheet = await prisma.goalSheet.findUnique({ where: { id: goalSheetId }, include: { user: true } });
    if (!sheet || sheet.user.managerId !== req.user.id) return res.status(404).json({ message: 'Chronicle not found on your desk' });

    const checkIn = await prisma.checkIn.create({ data: { goalSheetId, quarter, comment: comment.trim(), managerId: req.user.id } });
    res.status(201).json({ checkIn });
  } catch (err) {
    next(err);
  }
});

managerRouter.post('/shared-goal', async (req, res, next) => {
  try {
    validateGoalPayload(req.body);
    const { employeeIds = [] } = req.body;
    const reports = await prisma.user.findMany({ where: { id: { in: employeeIds }, managerId: req.user.id } });
    const year = new Date().getFullYear();
    const created = [];

    for (const report of reports) {
      const sheet = await prisma.goalSheet.upsert({
        where: { userId_cycleYear: { userId: report.id, cycleYear: year } },
        update: {},
        create: { userId: report.id, cycleYear: year },
        include: { goals: true }
      });
      ensureGoalLimit(sheet.goals);
      created.push(await prisma.goal.create({
        data: {
          goalSheetId: sheet.id,
          thrustArea: req.body.thrustArea,
          title: req.body.title,
          description: req.body.description,
          uomType: req.body.uomType,
          target: Number(req.body.target),
          deadline: req.body.deadline ? new Date(req.body.deadline) : null,
          weightage: Number(req.body.weightage),
          isShared: true,
          sharedOwnerId: req.user.id
        }
      }));
    }

    res.status(201).json({ goals: created });
  } catch (err) {
    next(err);
  }
});
