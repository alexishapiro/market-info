#!/usr/bin/env ts-node

import { PrismaClient, UserRole } from '@prisma/client';
import fs, { readFileSync } from 'fs';
import path from 'path';
import { writeFileIfChanged } from './fileUtils';
import metadata from '../src/lib/hooks/__model_meta';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  try {
    fs.accessSync(dirname);
  } catch (error) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

async function writeFile(filePath: string, content: string) {
  await ensureDirectoryExists(filePath);
  await writeFileIfChanged(filePath, content);
}

const prisma = new PrismaClient();

async function generateAppNav() {
  const pagesDir = path.join(process.cwd(), 'src', 'app');
  const outputPath = path.join(process.cwd(), 'src', 'data', 'appnav.json');

  const navItems: any[] = [];
  const profileMenu = [
    { name: "Profile", path: "/profile" },
    { name: "Logout", path: "/login" }
  ];

  // Helper function to get roles from permissions
  const getRolesFromPermissions = (permissions: string[]): string[] => {
    const roles = new Set<string>();
    permissions.forEach(permission => {
      if (permission.includes('ADMIN')) roles.add('ADMIN');
      
      if (permission.includes('ALL')) {
        Object.values(['USER', 'ADMIN']).forEach(role => roles.add(role));
      }
    });
    return Array.from(roles);
  };

  // Analyze schema and pages
  const operationsChildren: any[] = [];
  for (const model of Object.values(metadata.models)) {
    const modelName = model.name.toLowerCase();
    const pagePath = path.join(pagesDir, `${modelName}`, 'page.tsx');

    if (fs.existsSync(pagePath)) {
      const permissions = Object.values(model.fields).reduce((acc: string[], field: any) => {
        const docs = field.documentation?.split('\n') || [];
        const filteredDocs = docs.filter((doc: string) => doc.startsWith('@allow'));
        return acc.concat(filteredDocs);
      }, [] as string[]);

      if (permissions.length > 0) {
        const roles = getRolesFromPermissions(permissions);
        const navItem = {
          name: model.name,
          icon: `${model.name}Icon`, // You may want to adjust this
          path: `/${modelName}`,
          roles: roles
        };

        if (['Venue', 'Transaction', 'Package', 'MembershipTier', 'RequestLog'].includes(model.name)) {
          operationsChildren.push(navItem);
        } else {
          navItems.push(navItem);
        }
      }
    }
  }

  // Add default items
  navItems.push({
    name: "Dashboard",
    icon: "DashboardIcon",
    path: "/dashboard",
    roles: ["ALL"],
    children: [
      { name: "Analytics", path: "/dashboard/analytics" },
      { name: "Appointment List", path: "/dashboard/appointment-list" },
      { name: "Calendar", path: "/dashboard/calendar" },
      { name: "Upcoming Schedule", path: "/dashboard/upcoming-schedule" }
    ]
  });
  navItems.push({
    name: "Scraping",
    icon: "DashboardIcon",
    path: "/scraping",
    roles: ["ALL"],
    children: [
      { name: "Scraping Jobs", path: "/scraping/jobs" },
      { name: "Scraped Products", path: "/scraping/products" },
      { name: "Scraping Schedules", path: "/scraping/schedules" },
      { name: "Scraping Configurations", path: "/scraping/configurations" }
    ]
  });
  navItems.push({
    name: "Logout",
    icon: "LogoutIcon",
    path: "/login",
    roles: ["ALL"],
    children: [
    ]
  });

  // Generate JSON
  const appNav = {
    navItems,
    profileMenu
  };

  await writeFileIfChanged('./src/data/appnav.json', JSON.stringify(appNav, null, 2));
  console.log(`App navigation generated at ./src/data/appnav.json`);
}

generateAppNav()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();  
  });