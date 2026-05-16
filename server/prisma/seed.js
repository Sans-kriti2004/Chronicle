import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { computeScore } from '../src/services/scoreEngine.js';

const prisma = new PrismaClient();
const year = new Date().getFullYear();

async function upsertUser({ name, email, password, role, managerId = null }) {
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, password: hashed, role, managerId },
    create: { name, email, password: hashed, role, managerId }
  });
}

async function seedGoalSheet(userId, goals) {
  const sheet = await prisma.goalSheet.upsert({
    where: { userId_cycleYear: { userId, cycleYear: year } },
    update: { status: 'APPROVED', submittedAt: new Date(), approvedAt: new Date() },
    create: { userId, cycleYear: year, status: 'APPROVED', submittedAt: new Date(), approvedAt: new Date() }
  });

  await prisma.goal.deleteMany({ where: { goalSheetId: sheet.id } });
  for (const goal of goals) {
    const { sampleActual, ...goalData } = goal;
    const created = await prisma.goal.create({ data: { ...goalData, goalSheetId: sheet.id, isLocked: true } });
    await prisma.achievement.create({
      data: {
        goalId: created.id,
        quarter: 'Q1',
        actual: sampleActual,
        score: computeScore(goal.uomType, goal.target, sampleActual, goal.deadline),
        notes: 'First plot update captured for demo momentum.'
      }
    });
  }
}

async function main() {
  await prisma.cycle.upsert({
    where: { year },
    update: { goalSettingOpen: true, q1Open: true },
    create: { year, goalSettingOpen: true, q1Open: true }
  });

  const admin = await upsertUser({ name: 'Arjun Mehta', email: 'admin@chronicle.app', password: 'admin123', role: 'ADMIN' });
  const manager = await upsertUser({ name: 'Priya Sharma', email: 'manager@chronicle.app', password: 'manager123', role: 'MANAGER' });
  const rohan = await upsertUser({ name: 'Rohan Verma', email: 'employee1@chronicle.app', password: 'emp123', role: 'EMPLOYEE', managerId: manager.id });
  const sanskriti = await upsertUser({ name: 'Sanskriti Dixit', email: 'employee2@chronicle.app', password: 'emp123', role: 'EMPLOYEE', managerId: manager.id });
  const karan = await upsertUser({ name: 'Karan Nair', email: 'employee3@chronicle.app', password: 'emp123', role: 'EMPLOYEE', managerId: manager.id });

  await seedGoalSheet(rohan.id, [
    { thrustArea: 'Revenue Growth', title: 'Open new channel revenue', description: 'Build a repeatable dealer growth motion.', uomType: 'MIN', target: 120, weightage: 35, sampleActual: 88 },
    { thrustArea: 'Operational Excellence', title: 'Reduce fulfillment delays', uomType: 'MAX', target: 4, weightage: 25, sampleActual: 5 },
    { thrustArea: 'Customer Love', title: 'Lift installation NPS', uomType: 'MIN', target: 70, weightage: 20, sampleActual: 64 },
    { thrustArea: 'Reliability', title: 'Keep critical misses at zero', uomType: 'ZERO', target: 0, weightage: 20, sampleActual: 0 }
  ]);

  await seedGoalSheet(sanskriti.id, [
    { thrustArea: 'Product Velocity', title: 'Launch BLDC fan refresh', uomType: 'TIMELINE', target: 1, deadline: new Date(`${year}-06-30`), weightage: 30, sampleActual: new Date(`${year}-06-20`).getTime() },
    { thrustArea: 'Quality', title: 'Lower warranty claims', uomType: 'MAX', target: 2, weightage: 30, sampleActual: 2.4 },
    { thrustArea: 'Capability', title: 'Train service partners', uomType: 'MIN', target: 150, weightage: 20, sampleActual: 110 },
    { thrustArea: 'Customer Love', title: 'Improve response SLAs', uomType: 'MAX', target: 8, weightage: 20, sampleActual: 7 }
  ]);

  await seedGoalSheet(karan.id, [
    { thrustArea: 'Supply Chain', title: 'Improve supplier OTIF', uomType: 'MIN', target: 95, weightage: 35, sampleActual: 91 },
    { thrustArea: 'Cost Discipline', title: 'Reduce expedite freight cost', uomType: 'MAX', target: 10, weightage: 25, sampleActual: 12 },
    { thrustArea: 'Reliability', title: 'Zero line stoppage incidents', uomType: 'ZERO', target: 0, weightage: 20, sampleActual: 1 },
    { thrustArea: 'People', title: 'Cross-train planners', uomType: 'MIN', target: 12, weightage: 20, sampleActual: 8 }
  ]);

  await prisma.auditLog.create({
    data: { userId: admin.id, action: 'SEED_PUBLISHED_DEMO', newValue: 'Demo Chronicles seeded for Priya Sharma team' }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Chronicle demo data seeded.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
