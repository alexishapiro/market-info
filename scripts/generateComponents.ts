import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { writeFileIfChanged } from './fileUtils';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { Field } from '../src/lib/utils'

async function generateComponents() {
  const appStructure = JSON.parse(readFileSync('./src/lib/appStructure.json', 'utf-8'));

appStructure.models.forEach((model: any) => {
  const componentDir = join('./src/components', model.name.toLowerCase());
  mkdirSync(componentDir, { recursive: true });

  // Generate List component
const listComponentContent = `
'use client'
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EyeIcon } from '@/app/assets/icons/icons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { ${model.name} } from '@prisma/client';
import appStructure from '@/lib/appStructure.json';
import { ${model.name}Form } from '@/components/${model.name.toLowerCase()}/${model.name}Form';
import { Card } from '@/components/ui/card';
import { getMandatoryFields,isNonDesktopDevice } from '@/lib/utils';
 
interface ${model.name}ListProps {    
  ${model.name.toLowerCase()}s: ${model.name}[];
}
export const ${model.name}List: React.FC<${model.name}ListProps> = ({ ${model.name.toLowerCase()}s}) => {

  const [isCreating, setIsCreating] = useState(false);
  const [selected${model.name}, setSelected${model.name}] = useState<${model.name} | null>(null);



  const renderTableHead = (fields: any[]) => {
    return fields.map((field: any) => (
      <TableHead key={field.name}>{field.name}</TableHead>
    ));
  };

  const renderTableCells = (item: ${model.name}, fields: any[]) => {
    return fields.map((field: any) => {
      const value: any = item[field.name as keyof ${model.name}];  
      return (
        <TableCell key={field.name}>
          {value instanceof Date ? value.toLocaleDateString() : value}
        </TableCell>
      );
    });
  };

  const fields = getMandatoryFields('${model.name}');

  // Render list
  const renderList = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Actions</TableHead>
          {renderTableHead(fields)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {${model.name.toLowerCase()}s.map((item: ${model.name}) => (
          <TableRow key={item.id}>
            <TableCell>
              <Button variant="default" size="sm" onClick={() => {setIsCreating(true); setSelected${model.name}(item)}}>
                <EyeIcon className="h-4 w-4" />
              </Button>
            </TableCell>
            {renderTableCells(item, fields)}
          </TableRow>
        ))}
       <TableRow style={{position:"fixed", bottom:"0px", width: isNonDesktopDevice() ? "100%":"calc(100% - 300px)" }}>
          <TableCell style={{position:"fixed", bottom:"0px", width:"inherit", padding:"0px"}}> 
            <Button style={{position:"fixed", bottom:"0px", width:"inherit" , borderRadius:"0px"}} variant="default" onClick={() => {setIsCreating(true)}}>Create New ${model.name}</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );

  return (
    <Card className="w-fit h-full w-full">
    {isCreating ? <${model.name}Form new${model.name.toLowerCase()}={selected${model.name} as ${model.name}} onClose={() => {setIsCreating(false); setSelected${model.name}(null);}} onSuccess={() => {setIsCreating(false); setSelected${model.name}(null);}} /> :
      renderList()}
    </Card>
  );
};
`;

writeFileIfChanged(join(componentDir, `${model.name}List.tsx`), listComponentContent);

  // Generate Form component
  
const formComponentContent = `
import React, { useState } from 'react';
import { useCreate${model.name} } from '@/lib/hooks/${model.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}';
import { useUpdate${model.name} } from '@/lib/hooks/${model.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ${model.name}, Prisma } from '@prisma/client';
import { Label } from '@/components/ui/label';
import { useSession } from "next-auth/react";
import { handleApiError } from '@/lib/api';
import { ${model.name.charAt(0).toLowerCase() + model.name.slice(1)}Schema} from '@/lib/generatedSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { getMandatoryFields } from '@/lib/utils';
import { generateDynamicFields, Field } from '@/lib/utils';
import {z} from 'zod';
import { InputJsonValue, JsonValue } from '@prisma/client/runtime/library';
interface ${model.name}FormProps {
  new${model.name.toLowerCase()}: ${model.name};
  onClose: () => void;
  onSuccess: () => void;
}

export const ${model.name}Form: React.FC<${model.name}FormProps> = ({ new${model.name.toLowerCase()}, onClose, onSuccess }) => {
  const { data: session } = useSession();

  const [formData, setFormData] = useState<${model.name}>({
    ${model.fields.filter((field: Field) => (!field.isList && !field.isIgnore) && field.name !== 'user' && !field.isRelation && !field.isRelationOwner).map((field: Field) => 
      `${field.name}: new${model.name.toLowerCase()}?.${field.name} || 
      ${field.type === 'number' || field.type === 'integer' || field.type === 'Decimal' || field.type === 'Int' || field.type === 'Float' ? 
       '0' 
       : 
       (field.type === 'DateTime' || field.type === 'Date'
       ? 
       'new Date()' 
      : 
       (field.type === 'enum'
       ? 
       `${field.type.indexOf('enum') > -1 ? field.type.split('enum')[1].split('|')[0].trim() : '""'}` 
      : 
       '""'))}`).join(',\n      ')}
  });
  const [isCreating, setIsCreating] = useState(false);
  
  const form = useForm<${model.name}>({
    resolver: zodResolver(${model.name.charAt(0).toLowerCase() + model.name.slice(1)}Schema),
    defaultValues: new${model.name.toLowerCase()} || formData,
  });

  const create${model.name} = useCreate${model.name}();
  const update${model.name} = useUpdate${model.name}();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const onSubmit = async (${model.name.toLowerCase()}: ${model.name}) => {
    try {
      if (new${model.name.toLowerCase()}?.id) {
        await update${model.name}?.mutateAsync({
          data: {
            ...generateDynamicFields(formData, ${model.name.toLowerCase()} as unknown as z.ZodTypeAny, 'update')
          },
          where: { id: new${model.name.toLowerCase()}?.id }
        });
      }
      else {
        await create${model.name}?.mutateAsync({
          data: {
            ...formData,
            ...generateDynamicFields(formData, ${model.name.toLowerCase()} as unknown as z.ZodTypeAny, 'create'),
            ${model.fields
              .filter((field: Field) => field.isRelation && field.isRelationOwner)
              .map((field: Field) => `${field.name}: { connect: { id: formData.${field.name}Id } }`)
              .join(',\n            ')}
          }
        });
      }
      onSuccess();
      onClose();
      setIsCreating(false);
    } catch (error) {
      handleApiError(error);
      setIsCreating(false);
    } 
  };
  const mandatoryFields = getMandatoryFields('${model.name}');
  return (
    <>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
      {mandatoryFields && mandatoryFields.map((field) => (
        <div key={field.name}>
          <Label htmlFor={field.name}>{field.name.charAt(0).toUpperCase() + field.name.slice(1)}</Label>
          <Input
            id={field.name}
            name={field.name}
            value={(() => {
              const inputType = field.type;
              if (inputType === 'DateTime') {
                return formData[field?.name as keyof ${model.name}]?.toLocaleString() || "";
              } else if (inputType === 'number') {
                return formData[field?.name as keyof ${model.name}]?.toString() || 0;
              } else {
                return formData[field?.name as keyof ${model.name}]?.toString() || "";
              }
            })()}
            onChange={(e) => handleChange(e, field.name.toLowerCase())}
            type={field.type}
            //required={!field.isOptional}
          />
        </div>
        ))}
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">{new${model.name.toLowerCase()} ? 'Update' : 'Create'}</Button>
      
    </form>
    </>
  );
};
`;

writeFileIfChanged(join(componentDir, `${model.name}Form.tsx`), formComponentContent);

})
}
generateComponents(); 

// const cardComponentContent = `
// "use client";
// import React, { useState } from "react";
// import { useSession } from "next-auth/react";
// import { useToast } from "@/components/ui/use-toast";
// import { useCreate${model.name} } from "@/lib/hooks/${model.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}";
// import { useUpdate${model.name} } from "@/lib/hooks/${model.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}";
// import { ${model.name} } from "@prisma/client";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// //import { LoadingAnimation } from "@/components/loading";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { getMandatoryFields } from '@/lib/utils';

// interface Create${model.name}CardProps {
//   new${model.name}: ${model.name} | null;
//   onClose: () => void;
// }
  

// export function Create${model.name}Card({ new${model.name}, onClose }: Create${model.name}CardProps) {
//   const [isCreating, setIsCreating] = useState(true);
//   const { toast } = useToast();
//   const { data: session, status } = useSession();

//   const [${model.name.toLowerCase()}Data, set${model.name}Data] = useState({
//     ${model.fields.map((field: any) => `${field.name}: (${field.type === 'number' || field.type === 'integer' || field.type === 'Decimal' ? '0' : '""'})`).join(',\n    ')}
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
//     const { value } = e.target;
//     set${model.name}Data(prev => ({ ...prev, [fieldName]: value }));
//   };

//   const { mutateAsync: create${model.name} } = useCreate${model.name}();
//   const { mutateAsync: update${model.name} } = useUpdate${model.name}();

//   const handle${model.name}Action = async () => {
//     try {
//       if (new${model.name}?.id) {
//         await update${model.name}(
//           { data: ${model.name.toLowerCase()}Data as unknown as ${model.name}, where: { id: new${model.name}?.id } },
//           {
//             onSuccess: () => {
//               toast({
//                 title: "Success",
//                 description: "${model.name} updated successfully",
//                 variant: "default",
//               });
//               setIsCreating(false);
//               onClose();
//             },
//             onError: () => {
//               toast({
//                 title: "Error",
//                 description: "Failed to update ${model.name}. Please try again.",
//                 variant: "destructive",
//               });
//             }
//           }
//         );
//       }
//       else {
//         await create${model.name}(
//           { data: ${model.name.toLowerCase()}Data as unknown as ${model.name} },
//           {
//             onSuccess: () => {
//               toast({
//                 title: "Success",
//                 description: "${model.name} created successfully",
//                 variant: "default",
//               });
//               setIsCreating(false);
//               onClose();
//             },
//             onError: () => {
//               toast({
//                 title: "Error",
//                 description: "Failed to create ${model.name}. Please try again.",
//                 variant: "destructive",
//               });
//             }
//           }
//         );
//         setIsCreating(false);
//         onClose();
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: \`Failed to create ${model.name}. Please try again. ERROR: \${error}\`,
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <span className="flex items-center gap-2">
//           <span>
//             <CardTitle>Create ${model.name}</CardTitle>
//             <CardDescription>Create a new ${model.name.toLowerCase()}.</CardDescription>
//           </span>
//         </span>
//       </CardHeader>
//       <CardContent>
//         <div className="flex flex-col gap-4">
//           ${model.fields.map((field: any) => `
//           <div className="grid gap-2">
//             <Label htmlFor="${field.name}">${field.name.charAt(0).toUpperCase() + field.name.slice(1)}</Label>
//             <Input
//               id="${field.name}"
//               name="${field.name}"
//               value={${model.name.toLowerCase()}Data.${field.name} || ""}
//               onChange={(e) => handleChange(e, "${field.name}")}
//               placeholder="Enter ${field.name}"
//               type="${field.type === 'number' ? 'number' : 'text'}"
//               required
//             />
//           </div>`).join('\n          ')}
//           <span className="flex items-center gap-2">
//             <Button variant="secondary" onClick={() => {setIsCreating(false); onClose()}}>Cancel</Button>
//             <Button variant="default" onClick={() => {setIsCreating(true); handle${model.name}Action();}}>Create ${model.name}</Button>
//           </span>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }`; 

//   writeFileIfChanged(join(componentDir, `${model.name}Card.tsx`), cardComponentContent);
// });