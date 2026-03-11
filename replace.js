const fs = require("fs");
const files = [
  "app/login/page.tsx",
  "app/input/page.tsx",
  "app/history/page.tsx",
  "app/(admin)/user-management/page.tsx",
  "app/(admin)/unit-management/page.tsx",
  "app/(admin)/super-admin/page.tsx",
];
files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(
    /import\s+\{\s*toast\s*,\s*Toaster\s*\}\s*from\s*"sonner";?[^\n]*\n?/g,
    'import toast from "react-hot-toast";\n',
  );
  content = content.replace(
    /import\s+\{\s*toast\s*\}\s*from\s*"sonner";?[^\n]*\n?/g,
    'import toast from "react-hot-toast";\n',
  );
  content = content.replace(/toast\.info\(/g, "toast(");
  content = content.replace(/toast\.warning\(/g, "toast(");
  content = content.replace(
    /<Toaster position="top-center" richColors \/>\n?/g,
    "",
  );
  fs.writeFileSync(file, content);
  console.log("Processed", file);
});
