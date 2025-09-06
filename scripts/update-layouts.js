const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(__dirname, '../app');
const layoutFiles = [
  'surveys/layout.tsx',
  'promotions/layout.tsx',
  'reports/layout.tsx',
  'birthdays/layout.tsx',
  'robots/layout.tsx',
  'users/layout.tsx',
];

const newLayoutContent = `import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { GlassHeader } from "@/components/glass-header"

export default function PageLayout({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <>\n      <AppSidebar />\n      <SidebarInset>\n        <GlassHeader />\n        <div className="pt-16 pl-4">\n          <div className="w-full max-w-[calc(100%-1rem)]">\n            <div className="flex-1 flex flex-col gap-4 p-4">\n              {children}\n            </div>\n          </div>\n        </div>\n      </SidebarInset>\n    </>\n  )\n}`;

layoutFiles.forEach(layoutFile => {
  const filePath = path.join(layoutsDir, layoutFile);
  fs.writeFileSync(filePath, newLayoutContent);
  console.log(`Updated ${layoutFile}`);
});

console.log('All layouts have been updated with the new glass header!');
