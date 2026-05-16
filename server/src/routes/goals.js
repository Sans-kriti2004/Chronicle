import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { computeArcHealth } from '../services/arcHealth.js';
import { computeScore } from '../services/scoreEngine.js';
import {
  ensureDraftSheet,
  ensureGoalLimit,
  ensureQuarterWindow,
  validateGoalPayload,
  validateSheetWeightage
} from '../services/validation.js';

export const goalsRouter = Router();

const includeSheet = {
  goals: { include: { achievements: true }, orderBy: { createdAt: 'asc' } },
  checkIns: { orderBy: { createdAt: 'desc' } }
};

async function getOrCreateSheet(userId) {
  const cycleYear = new Date().getFullYear();
  return prisma.goalSheet.upsert({
    where: { userId_cycleYear: { userId, cycleYear } },
    update: {},
    create: { userId, cycleYear },
    include: includeSheet
  });
}

goalsRouter.get('/my-sheet', async (req, res, next) => {
  try {
    const sheet = await getOrCreateSheet(req.user.id);
    const cycle = await prisma.cycle.findUnique({ where: { year: sheet.cycleYear } });
    res.json({ sheet, cycle, arcHealth: computeArcHealth(sheet, cycle) });
  } catch (err) {
    next(err);
  }
});

goalsRouter.post('/', async (req, res, next) => {
  try {
    validateGoalPayload(req.body);
    const sheet = await getOrCreateSheet(req.user.id);
    ensureDraftSheet(sheet);
    ensureGoalLimit(sheet.goals);

    const goal = await prisma.goal.create({
      data: {
        goalSheetId: sheet.id,
        thrustArea: req.body.thrustArea,
        title: req.body.title,
        description: req.body.description,
        uomType: req.body.uomType,
        target: Number(req.body.target),
        deadline: req.body.deadline ? new Date(req.body.deadline) : null,
        weightage: Number(req.body.weightage)
      }
    });

    res.status(201).json({ goal });
  } catch (err) {
    next(err);
  }
});

goalsRouter.put('/:id', async (req, res, next) => {
  try {
    validateGoalPayload(req.body, { partial: true });
    const existing = await prisma.goal.findUnique({ where: { id: req.params.id }, include: { goalSheet: true } });
    if (!existing || existing.goalSheet.userId !== req.user.id) return res.status(404).json({ message: 'Chapter not found' });
    ensureDraftSheet(existing.goalSheet);

    if (existing.isShared) {
      const keys = Object.keys(req.body).filter((key) => key !== 'weightage');
      if (keys.length) return res.status(403).json({ message: 'Shared chapters only allow weightage edits' });
    }

    const goal = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        ...('thrustArea' in req.body ? { thrustArea: req.body.thrustArea } : {}),
        ...('title' in req.body ? { title: req.body.title } : {}),
        ...('description' in req.body ? { description: req.body.description } : {}),
        ...('uomType' in req.body ? { uomType: req.body.uomType } : {}),
        ...('target' in req.body ? { target: Number(req.body.target) } : {}),
        ...('deadline' in req.body ? { deadline: req.body.deadline ? new Date(req.body.deadline) : null } : {}),
        ...('weightage' in req.body ? { weightage: Number(req.body.weightage) } : {})
      }
    });

    res.json({ goal });
  } catch (err) {
    next(err);
  }
});

goalsRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.goal.findUnique({ where: { id: req.params.id }, include: { goalSheet: true } });
    if (!existing || existing.goalSheet.userId !== req.user.id) return res.status(404).json({ message: 'Chapter not found' });
    ensureDraftSheet(existing.goalSheet);
    await prisma.goal.delete({ where: { id: req.params.id } });
    res.json({ message: 'Chapter removed from draft' });
  } catch (err) {
    next(err);
  }
});

goalsRouter.post('/submit', async (req, res, next) => {
  try {
    const sheet = await getOrCreateSheet(req.user.id);
    ensureDraftSheet(sheet);
    validateSheetWeightage(sheet.goals);
    const updated = await prisma.goalSheet.update({
      where: { id: sheet.id },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
      include: includeSheet
    });
    res.json({ sheet: updated });
  } catch (err) {
    next(err);
  }
});

goalsRouter.post('/:id/achievement', async (req, res, next) => {
  try {
    const { quarter, actual, notes } = req.body;
    const goal = await prisma.goal.findUnique({ where: { id: req.params.id }, include: { goalSheet: true } });
    if (!goal || goal.goalSheet.userId !== req.user.id) return res.status(404).json({ message: 'Chapter not found' });
    const cycle = await prisma.cycle.findUnique({ where: { year: goal.goalSheet.cycleYear } });
    ensureQuarterWindow(cycle, quarter);

    const score = computeScore(goal.uomType, goal.target, actual, goal.deadline);
    const achievement = await prisma.achievement.create({
      data: { goalId: goal.id, quarter, actual: Number(actual), score, notes }
    });

    res.status(201).json({ achievement });
  } catch (err) {
    next(err);
  }
});
