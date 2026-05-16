import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const adminRouter = Router();

adminRouter.get('/org', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, managerId: true, createdAt: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }]
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/completion', async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const [totalEmployees, sheets] = await Promise.all([
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.goalSheet.groupBy({ by: ['status'], where: { cycleYear: year }, _count: true })
    ]);

    const counts = { DRAFT: 0, SUBMITTED: 0, APPROVED: 0, RETURNED: 0 };
    sheets.forEach((item) => {
      counts[item.status] = item._count;
    });

    res.json({
      year,
      totalEmployees,
      sheets: Object.entries(counts).map(([status, count]) => ({ status, count }))
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/audit', async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } }, goal: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200
    });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/goal/:id/unlock', async (req, res, next) => {
  try {
    const goal = await prisma.goal.findUnique({ where: { id: req.params.id } });
    if (!goal) return res.status(404).json({ message: 'Chapter not found' });

    const unlocked = await prisma.goal.update({ where: { id: goal.id }, data: { isLocked: false } });
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        goalId: goal.id,
        action: 'ADMIN_UNLOCKED_GOAL',
        oldValue: JSON.stringify({ isLocked: goal.isLocked }),
        newValue: JSON.stringify({ isLocked: false })
      }
    });
    res.json({ goal: unlocked });
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/cycle', async (req, res, next) => {
  try {
    const year = Number(req.body.year) || new Date().getFullYear();
    const cycle = await prisma.cycle.upsert({
      where: { year },
      update: {
        goalSettingOpen: Boolean(req.body.goalSettingOpen),
        q1Open: Boolean(req.body.q1Open),
        q2Open: Boolean(req.body.q2Open),
        q3Open: Boolean(req.body.q3Open),
        q4Open: Boolean(req.body.q4Open)
      },
      create: {
        year,
        goalSettingOpen: Boolean(req.body.goalSettingOpen),
        q1Open: Boolean(req.body.q1Open),
        q2Open: Boolean(req.body.q2Open),
        q3Open: Boolean(req.body.q3Open),
        q4Open: Boolean(req.body.q4Open)
      }
    });
    res.json({ cycle });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/export', async (req, res, next) => {
  try {
    const achievements = await prisma.achievement.findMany({
      include: {
        goal: {
          include: {
            goalSheet: { include: { user: { select: { name: true, email: true } } } }
          }
        }
      }
    });

    const header = ['employee,email,chapter,thrustArea,quarter,actual,score,capturedAt'];
    const rows = achievements.map((item) => [
      item.goal.goalSheet.user.name,
      item.goal.goalSheet.user.email,
      item.goal.title,
      item.goal.thrustArea,
      item.quarter,
      item.actual,
      item.score,
      item.capturedAt.toISOString()
    ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','));

    res.header('Content-Type', 'text/csv');
    res.attachment('chronicle-achievements.csv');
    res.send([...header, ...rows].join('\n'));
  } catch (err) {
    next(err);
  }
});
