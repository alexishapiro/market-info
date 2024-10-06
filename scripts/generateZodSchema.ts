import { z } from 'zod';

export function generateZodSchema(model: any): string {
  console.log("Model : " + JSON.stringify(model.name));
  const schema: any = {};

  for (const [name, field] of Object.entries(model.fields)) {
    console.log("Name : " + name);
    let zodType: string;

    switch ((field as any).type) {
        case 'Cuid':
            zodType = 'z.string().cuid()';
            break;
        case 'Uuid':
            zodType = 'z.string().uuid()';
            break;
        case 'String':
            zodType = 'z.string()';
            break;
        case 'Int':
            zodType = 'z.number()';
            break;
        case 'Float':
            zodType = 'z.number()';
            break;
        case 'Decimal':
            zodType = 'z.number()';
            break;
        case 'Boolean':
            zodType = 'z.boolean()';
            break;
        case 'DateTime':
            zodType = 'z.date()';
            break;
        case 'Json':
            zodType = 'z.object({})';
            break;
        case 'Array':
            zodType = 'z.array(z.object({}))';
            break;
        case 'Object':
            zodType = 'z.object({})';
            break;
        case 'Cuid':
            zodType = 'z.string().cuid()';
            break;
        case 'Uuid':
            zodType = 'z.string().uuid()';
            break;
        default:
        if ((field as any).kind === 'enum') {
          zodType = `z.nativeEnum(${(field as any).type})`;
        } else if ((field as any).isPassword) {
          zodType = 'z.string().min(8).max(20)';
        } else {
          zodType = 'z.object({})';
        }
    }

    if (!(field as any).isRequired) {
      zodType += '.nullable()';
    }

    if ((field as any).hasDefaultValue) {
      zodType += `.default(${(field as any).defaultValue})`;
    }
    const fieldNameStr = (model.fields as any)[name].name;
    console.log("Field : " + fieldNameStr);
    schema[fieldNameStr] = zodType;
  }

  return `z.object({${Object.entries(schema).map(([name, value]) => `${name}: ${value}`).join(',\n')}})`;
}