

import { Prisma, UserRole } from '@prisma/client';
import { z } from 'zod';
import appStructure from './appStructure.json';
import appStructureControl from '@/data/app-structure-control.json';
import { twMerge } from 'tailwind-merge';
import { ClassValue, clsx } from 'clsx';
import { signOut } from 'next-auth/react';
export interface Field {
  name: string;
  type: string;
  isArray?: boolean;
  isOptional?: boolean;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  isList: boolean;
  isIgnore: boolean;
  isOmit: boolean;
  isEnum: boolean;
  isRelation: boolean;
  isRelationOwner: boolean;
  isRelationMany: boolean;
  relationType: string;
  relatedModel: string;
  relationFields: string[];
  relationReferences: string[];   
}

interface Model {
  name: string;
  fields: Field[];
}

interface AppStructure {
  models: Model[];
}


export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function capitalize(str: string): string {
return str.charAt(0).toUpperCase() + str.slice(1);
}
export const isNonDesktopDevice = () => {
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent;
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(userAgent);
  }
  return false;
};

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
  
export const isAuthorized = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole);
};


export function getRequiredFields(schema: z.ZodObject<any>) {
  const shape = schema.shape;
  const requiredFields: string[] = [];

  for (const [key, value] of Object.entries(shape)) {
    if (value instanceof z.ZodString || value instanceof z.ZodNumber) {
      if (!value.isOptional()) {
        requiredFields.push(key);
      }
    }
  }
  return requiredFields;
}

export const getMandatoryFields = (modelName: string): any[] => {
  const forms = appStructureControl.components.forms.find((comp: any) => comp.model === modelName);
  if (!forms) return [];
  const fieldsIncluded = forms.fields;
  const model = appStructure.models.find((model: any) => model.name === modelName);
  if (!model) return [];
  const fields = model.fields.filter((field: any) => fieldsIncluded.includes(field.name));
  return fields;
};

export function generateDynamicFields<T extends z.ZodTypeAny>(
  form: Record<string, any>,
  schema: T,
  operation: 'create' | 'update'
): Record<string, Prisma.InputJsonValue | typeof Prisma.JsonNull> {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => {
      if (typeof schema === 'object' && 'shape' in schema && schema.shape) {
        const field = schema.shape[key as keyof typeof schema.shape];
        if (field && typeof field === 'object' && 'typeName' in field) {
          switch ((field as z.ZodTypeAny)._def.typeName) {
            case 'ZodDate':
            case 'ZodDateTime':
              return [key, value ? new Date(value as string) : null];
            case 'ZodString':
            case 'ZodCuid':
            case 'ZodUuid':
              return [key, String(value)];
            case 'ZodNumber':
            case 'ZodInt':
            case 'ZodFloat':
              return [key, Number(value)];
            case 'ZodBoolean':
              return [key, Boolean(value)];
            case 'ZodEnum':
              return [key, value];
            case 'ZodObject':
              if (operation === 'create') {
                return [key, { create: value }];
              } else {
                return [key, { connect: { id: value } }];
              }
            case 'ZodArray':
              if (Array.isArray(value)) {
                return [key, { set: value }];
              } else {
                return [key, { set: [value] }];
              }
            case 'ZodOptional':
              if (value === undefined || value === null) {
                return [key, null];
              }
              return generateDynamicFields({ [key]: value }, (field as z.ZodOptional<z.ZodTypeAny>)._def.innerType, operation);
            default:
              return [key, value as Prisma.InputJsonValue];
          }
        }
      }
      return [key, value];
    }).filter((entry): entry is [string, Prisma.InputJsonValue] => entry !== undefined)
  );
}

function generateDynamicFormDataSubmission(formData: any, modelName: string): { [key: string]: Prisma.InputJsonValue | typeof Prisma.JsonNull } {
  const submissionObject: { [key: string]: Prisma.InputJsonValue | typeof Prisma.JsonNull } = {};
  console.log(formData);  
  // Iterate through all fields in the formData
  for (const [key, value] of Object.entries(formData)) {
    submissionObject[key] = value as Prisma.InputJsonValue | typeof Prisma.JsonNull;
  }
  return submissionObject;
  } 
export const navigateTo = (path: string, userId?: string) => {

  if (path.startsWith("/login")) {
    signOut({ callbackUrl: '/login' });
  } else if (path.startsWith("/profile")) {
    if (userId) {
      window.location.href = path + "/" + userId;
    } else {
      window.location.href = path;
    }
  } else {
    window.location.href = path;
  }
}
function getInputType(field: Field): string {
  switch (field.type.toLowerCase()) {
    case 'string':
      return 'text';
    case 'number':
    case 'integer':
    case 'decimal':
    case 'int':
      return 'number';
    case 'boolean':
      return 'checkbox';
    case 'date':
      return 'date';
    case 'datetime':
      return 'datetime-local';
    case 'time':
      return 'time';
    case 'email':
      return 'email';
    case 'url':
      return 'url';
    case 'enum':
      return 'select';
    case 'AppointmentStatus':
      return 'select';
    case 'MedicalCondition':
      return 'select';
    case 'VitalSigns':
      return 'select';
    case 'SOAPNote':
      return 'select';
    case 'Drug':
      return 'select';
    case 'Inventory':
      return 'select';
    case 'Prescription':
      return 'select';
    case 'UserRole':
      return 'select';
    case 'User':
      return 'select';
    case 'Doctor':
      return 'select';
    case 'Nurse':
      return 'select';
    case 'Pharmacist':
      return 'select';
    case 'Patient':
      return 'select';
    case 'Bill':
      return 'select';
    case 'BillStatus':
      return 'select';
    case 'Appointment':
      return 'select';
    default:
      return 'text';
  }
}

