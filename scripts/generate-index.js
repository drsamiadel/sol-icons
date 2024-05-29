// scripts/generate-index.js
import { existsSync, readdirSync, writeFileSync } from "fs";
import { join, basename, extname, dirname } from "path";
import { fileURLToPath } from "url";

const filedirname = dirname(fileURLToPath(import.meta.url));
// Paths to the directories containing SVG icons
const ICONS_DIR = join(filedirname, "../src/icons");

const variants = ["outlined"];

const generateIndexFile = () => {
  const indexFile = join(ICONS_DIR, "index.tsx");
  const files = readdirSync(ICONS_DIR);

  const imports = files
    .map((file) => {
      const name = basename(file, extname(file));
      return `import { default as ${name} } from "./${name}";`;
    })
    .join("\n");

  const exports = files
    .map((file) => {
      const name = basename(file, extname(file));
      return `export { ${name} };`;
    })
    .join("\n");

  const content = `${imports}\n\n${exports}`;

  writeFileSync(indexFile, content);
};
