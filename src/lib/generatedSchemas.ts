import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const userRoleSchema = z.object({id: z.string(),
name: z.string(),
createdAt: z.date(),
updatedAt: z.date(),
users: z.object({})});
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({id: z.string(),
email: z.string(),
name: z.string().nullable(),
password: z.string(),
createdAt: z.date(),
updatedAt: z.date(),
role: z.object({}),
roleId: z.string(),
scrapingJobs: z.object({}),
marketplaceConfigurations: z.object({}),
notifications: z.object({}),
scrapingSchedule: z.object({})});
export type User = z.infer<typeof userSchema>;

export const marketplaceConfigurationSchema = z.object({id: z.string(),
name: z.string(),
url: z.string(),
selectors: z.string(),
createdAt: z.date(),
updatedAt: z.date(),
user: z.object({}),
userId: z.string(),
scrapingJobs: z.object({}),
scrapingSchedule: z.object({})});
export type MarketplaceConfiguration = z.infer<typeof marketplaceConfigurationSchema>;

export const scrapingJobSchema = z.object({id: z.string(),
status: z.string(),
category: z.string().nullable(),
productList: z.string().nullable(),
results: z.string().nullable(),
createdAt: z.date(),
updatedAt: z.date(),
user: z.object({}),
userId: z.string(),
marketplaceConfiguration: z.object({}),
marketplaceConfigId: z.string(),
errorMessage: z.string().nullable(),
lastRunAt: z.date().nullable(),
scrapedProduct: z.object({}),
jobLog: z.object({})});
export type ScrapingJob = z.infer<typeof scrapingJobSchema>;

export const jobLogSchema = z.object({id: z.string(),
scrapingJobId: z.string(),
scrapingJob: z.object({}),
status: z.string().nullable(),
message: z.string().nullable(),
createdAt: z.date()});
export type JobLog = z.infer<typeof jobLogSchema>;

export const scrapedProductSchema = z.object({id: z.string(),
scrapingJobId: z.string(),
scrapingJob: z.object({}),
name: z.string(),
price: z.number().nullable(),
currency: z.string().nullable(),
code: z.string().nullable(),
description: z.string().nullable(),
imageUrl: z.string().nullable(),
productUrl: z.string().nullable(),
availability: z.string().nullable(),
rating: z.number().nullable(),
reviewCount: z.number().nullable(),
brand: z.string().nullable(),
attributes: z.string().nullable(),
link: z.string().nullable(),
createdAt: z.date(),
updatedAt: z.date()});
export type ScrapedProduct = z.infer<typeof scrapedProductSchema>;

export const scrapingScheduleSchema = z.object({id: z.string(),
userId: z.string(),
user: z.object({}),
configurationId: z.string(),
configuration: z.object({}),
frequency: z.object({}),
frequencyId: z.string(),
lastRunAt: z.date().nullable(),
nextRunAt: z.date().nullable(),
isActive: z.boolean(),
createdAt: z.date(),
updatedAt: z.date()});
export type ScrapingSchedule = z.infer<typeof scrapingScheduleSchema>;

export const scheduleConfigSchema = z.object({id: z.string(),
frequency: z.number().nullable(),
dayOfWeek: z.number().nullable(),
dayOfMonth: z.number().nullable(),
hourOfDay: z.number().nullable(),
minuteOfHour: z.number().nullable(),
scrapingSchedule: z.object({}),
createdAt: z.date(),
updatedAt: z.date()});
export type ScheduleConfig = z.infer<typeof scheduleConfigSchema>;

export const notificationTypeSchema = z.object({id: z.string(),
name: z.string(),
description: z.string().nullable(),
notifications: z.object({}),
createdAt: z.date(),
updatedAt: z.date()});
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({id: z.string(),
userId: z.string(),
user: z.object({}),
message: z.string().nullable(),
type: z.object({}),
notificationTypeId: z.string(),
isRead: z.boolean(),
createdAt: z.date()});
export type Notification = z.infer<typeof notificationSchema>;

export const requestLogSchema = z.object({id: z.string(),
activityType: z.string(),
activityStatus: z.string(),
activityMessage: z.string().nullable(),
createdAt: z.date(),
updatedAt: z.date()});
export type RequestLog = z.infer<typeof requestLogSchema>;

export const schemas = {
userRole: userRoleSchema,
user: userSchema,
marketplaceConfiguration: marketplaceConfigurationSchema,
scrapingJob: scrapingJobSchema,
jobLog: jobLogSchema,
scrapedProduct: scrapedProductSchema,
scrapingSchedule: scrapingScheduleSchema,
scheduleConfig: scheduleConfigSchema,
notificationType: notificationTypeSchema,
notification: notificationSchema,
requestLog: requestLogSchema,
};

export type ModelName = 'userRole'| 'user'| 'marketplaceConfiguration'| 'scrapingJob'| 'jobLog'| 'scrapedProduct'| 'scrapingSchedule'| 'scheduleConfig'| 'notificationType'| 'notification'| 'requestLog'| "underfined";

export function getSchemaForModel(modelName: ModelName) {
  return schemas[modelName as keyof typeof schemas];
}
