import { z } from 'zod';

export function generateZodSchema(models: any) {
  const schemas: Record<string, z.ZodType<any>> = {};

  for (const [modelName, model] of Object.entries(models)) {
    const fields: Record<string, z.ZodType<any>> = {};

    for (const [fieldName, field] of Object.entries((model as any).fields as Record<string, any>)) {
      let fieldSchema: z.ZodType<any>;

      switch (field.type) {
        case 'String':
          fieldSchema = z.string();
          break;
        case 'Int':
        case 'Float':
          fieldSchema = z.number();
          break;
        case 'Boolean':
          fieldSchema = z.boolean();
          break;
        case 'DateTime':
          fieldSchema = z.date();
          break;
        default:
          fieldSchema = z.any();
      }

      if (!field.isOptional) {
        fieldSchema = fieldSchema.nullable();
      }

      if ((model as any).uniqueConstraints && (model as any).uniqueConstraints[fieldName]) {
        fieldSchema = fieldSchema.refine(
          async (value) => {
            // Implement uniqueness check here
            return true;
          },
          { message: `${fieldName} must be unique` }
        );
      }

      fields[fieldName] = fieldSchema;
    }

    schemas[modelName] = z.object(fields);
  }

  return schemas;
}