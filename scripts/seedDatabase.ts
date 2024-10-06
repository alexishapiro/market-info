import { PrismaClient, UserRole, ScrapedProduct, ScheduleConfig, ScrapingJob, MarketplaceConfiguration, ScrapingSchedule, JobLog, Notification, NotificationType, RequestLog, User} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    // Clear existing data
    // await prisma.$transaction([
    //   prisma.user.deleteMany(),
    // ]);

    // Create users first
    const roles = await createRoles();
    const users = await createUsers();


    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}
async function createRoles() {
  const roles = [
    { id: 'clw1234567890123456789012', name: 'ADMIN' },
    { id: 'clw2345678901234567890123', name: 'USER' },
  ];

  const createdRoles = [];

  for (const role of roles) {
    const createdRole = await prisma.userRole.upsert({
      where: { id: role.id },
      update: {},
      create: {
        name: role.name,
      },
    });
    createdRoles.push(createdRole);
  }

  console.log('Roles created successfully');
  return createdRoles;
}

async function createUsers() {
  const users = [
    { email: 'admin@prima.com', name: 'Admin User', roleId: 'clw1234567890123456789012' },
    { email: 'doctor1@prima.com', name: 'Dr. Jane Smith', roleId: 'clw1234567890123456789012' },
    { email: 'doctor2@prima.com', name: 'Dr. Michael Johnson', roleId: 'clw1234567890123456789012' },
    { email: 'doctor3@prima.com', name: 'Dr. Emily Brown', roleId: 'clw1234567890123456789012' },
    { email: 'nurse1@prima.com', name: 'Nurse John Doe', roleId: 'clw1234567890123456789012' },
    { email: 'nurse2@prima.com', name: 'Nurse Sarah Wilson', roleId: 'clw1234567890123456789012' },
  ];

  // Generate 50 patient users
  for (let i = 1; i <= 50; i++) {
    users.push({
      email: `patient${i}@example.com`,
      name: faker.person.fullName(),
      roleId: 'clw1234567890123456789012'
    });
  }

  const password = bcrypt.hashSync('password123', 10);
  const createdUsers = [];

  for (const user of users) {
    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        password: password,
      },
    });
    createdUsers.push(createdUser);
  }

  return createdUsers;
}

seedDatabase();