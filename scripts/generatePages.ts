#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileIfChanged } from './fileUtils';

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
  writeFileIfChanged(filePath, content);
}

// Read the page config from a JSON file
const appConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/app-structure-control.json'), 'utf-8'));
const pageConfig = appConfig.pages;

if (!Array.isArray(pageConfig)) {
  console.error('pageConfig is not an array:', pageConfig);
  process.exit(1);
}

interface PageConfig {
  path: string;
  component: string;
  allowedRoles: string[];
  sections: {
    ui: string;
    type: string;
    component: string;
    actions?: string[];
    filters?: string[];
    sorting?: string[];
  }[];
}

const generatePage = async (config: PageConfig) => {
  const { path: route, component: name, allowedRoles, sections } = config;
  const [{ ui, type, component, actions, filters, sorting }] = sections;

  let imports = `
'use client'
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AppShell } from "@/components/appShell";
import { db } from "@/server/db";
import { navigateTo } from "@/lib/navigation-util";
${ui === "Tab" ? `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"` : ""}
${sections.map(section => `import { ${section.component} } from "@/components/${section.type.toLowerCase()}/${section.component}";`).join('\n')}
${sections.map(section => `import { useFindMany${section.type} } from "@/lib/hooks/${section.type.split(/(?=[A-Z])/).join('-').toLowerCase()}";`).join('\n')}
`;

  let content = `
const ${name}: React.FC = () => {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  ${sections.map(section => `
  const { data: ${section.type.toLowerCase()}s, isLoading: ${section.type.toLowerCase()}Loading, error: ${section.type.toLowerCase()}Error, refetch: refetch${section.type} } = useFindMany${section.type}();`).join('')}
  
  useEffect(() => {
    if (status === "unauthenticated") {
      signOut({ callbackUrl: "/login" });
    } else if (status === "authenticated" && ${sections.map(section => `!${section.type.toLowerCase()}Loading`).join(' && ')}) {
      toast({
        title: "Data loaded",
        description: "Data has been loaded from the database",
      });
    }
  }, [status, ${sections.map(section => `${section.type.toLowerCase()}Loading`).join(', ')}]);

    if (${sections.map(section => `${section.type.toLowerCase()}Error`).join(' || ')}) {
    return <div>Error loading data from the database ${sections.map(section => `${section.type.toLowerCase()}Error?.message`).join(' ')} </div>
  }

  if (!session) {
    return null;
  }

  return (
    <AppShell>
      <main className="flex w-full " id="primitiveTabs" >
        ${ui === "Tab" ? `
        <Tabs defaultValue="${sections[0].type.toLowerCase()}">
          <TabsList>
            ${sections.map(section => `
              <TabsTrigger value="${section.type.toLowerCase()}">${section.type}</TabsTrigger>
            `).join('\n          ')}
          </TabsList>
        ` : ""}
        ${ui === "Tab" ? `
        ${sections.map(section => `
        <TabsContent value="${section.type.toLowerCase()}">
          
          <${section.component} ${section.type.toLowerCase()}s={${section.type.toLowerCase()}s ?? []} />
        </TabsContent>
        `).join('\n        ')}
        </Tabs>
        ` : `
        ${sections.map(section => `
        <${section.component} ${section.type.toLowerCase()}s={${section.type.toLowerCase()}s ?? []} />
        `).join('\n        ')}
        `}
      </main>
    </AppShell>
  );
};

export default ${name};
`;

  const fullContent = imports + content;

  const filePath = path.join(__dirname, `../src/app/${route}/page.tsx`);
  await writeFileIfChanged(filePath, fullContent);

  console.log(`Generated ${name} page at ${filePath}`);
};

// Generate pages based on the config
pageConfig.forEach((config: PageConfig) => generatePage(config));