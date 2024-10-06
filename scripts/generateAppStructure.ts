
import metadata from '../src/lib/hooks/__model_meta';
import { z } from 'zod';
import { writeFileIfChanged } from './fileUtils';
async function generateAppStructure() {
  try {
    if (!metadata || !metadata.models) {
      throw new Error('Invalid metadata structure');
    }

    const appStructure = {
      models: Object.entries(metadata.models).map(([key, model]: [string, any]) => ({
        name: model.name,
        fields: Object.entries(model.fields).map(([fieldKey, field]: [string, any]) => ({
          name: field.name,
          type: field.type,
          isRequired: !field.isOptional,
          isUnique: model.uniqueConstraints[fieldKey],
          isRelation: field.isRelationOwner || false,
          isId: field.isId || false,
          isList: field.isArray || false,
          isOmit: field.name === "createdAt" || field.name === "updatedAt" || field.name === "password",
          isEnum: field.type === "enum",
          isPassword: field.name === "password",
          isJson: field.type === "Json",
          isJsonb: field.type === "Jsonb",
          isDate: field.type === "Date",
          isDateTime: field.type === "DateTime",
          isTime: field.type === "Time",
          isTimestamp: field.type === "Timestamp",
          isBoolean: field.type === "Boolean",
          isNumber: field.type === "Float" || field.type === "Int",
          isString: field.type === "String",
          isText: field.type === "String",
          isEmail: field.type === "String",
          isUrl: field.type === "String",
          isUuid: field.type === "String",
          isObjectId: field.type === "String",
          isObjectIdHexString: field.type === "String"
        })),
      })),
      enums: Object.entries(z).map(([key, enumValues]: [string, any]) => ({
        name: key,
        values: Object.keys(enumValues),
      })),
    };

    await writeFileIfChanged('./src/lib/appStructure.json', JSON.stringify(appStructure, null, 2));
    console.log('App structure generated successfully!');
  } catch (error) {
    console.error('Error generating app structure:', error);
    throw error;
  }
}

generateAppStructure().catch(error => {
  console.error('Unhandled error in generateAppStructure:', error);
  process.exit(1);
});