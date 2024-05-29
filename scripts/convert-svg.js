import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from "fs";
import { join, basename, extname, dirname } from "path";
import { transform } from "@svgr/core";
import { fileURLToPath } from "url";

const filedirname = dirname(fileURLToPath(import.meta.url));
// Paths to the directories containing SVG icons
const ICONS_DIR = join(filedirname, "../src/assets");
const OUT_DIR = join(filedirname, "../src/icons");
const variants = ["outlined"];

const pascalCase = (str) => {
  return str
    .replace(/(\w)(\w*)/g, function (g0, g1, g2) {
      return g1.toUpperCase() + g2.toLowerCase();
    })
    .replace(/\W/g, "");
};

// Function to read SVG files and convert them to React components
const convertSvgs = async () => {
  for (const variant of variants) {
    const variantDir = join(ICONS_DIR, variant);
    const files = readdirSync(variantDir);

    for (const file of files) {
      const svgPath = join(variantDir, file);
      const svgCode = readFileSync(svgPath, "utf8");
      const componentName =
        pascalCase(basename(file, extname(file))) +
        variant.charAt(0).toUpperCase() +
        variant.slice(1);

      const jsCode = await transform(
        svgCode,
        {
          icon: true,
          typescript: true,
          replaceAttrValues: { "#000": "currentColor" },
          svgProps: {
            width: "{props.size || 24}",
            height: "{props.size || 24}",
            viewBox: "0 0 24 24",
          },
          plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
        },
        { componentName }
      );
      const oldType = `props: SVGProps<SVGSVGElement>`;
      const type = `props: SVGProps<SVGSVGElement> & { size?: number; }`;

      // Replace the old type with the new type that includes the size prop in the generated component
      const updatedCode = jsCode.replace(oldType, type);

      const outputPath = join(OUT_DIR + `/${variant}`, `${componentName}.tsx`);
      writeFileSync(outputPath, updatedCode, "utf8");
      console.log(`🔁 ==> Converted ${file} to ${componentName}.tsx`);

      // generate index file at icons directory
      const indexFile = join(OUT_DIR, "index.ts");
      const indexContent = `export { default as ${componentName} } from "./${variant}/${componentName}";\n`;
      writeFileSync(indexFile, indexContent, { flag: "a" });
    }

    console.log(`✅ ==> Conversion for [[${variant}]] variant complete!`);
  }

  console.log(
    " ======================================",
    "\n",
    "======================================",
    "\n",
    "======== Conversion complete! ========",
    "\n",
    "======================================",
    "\n",
    "======================================"
  );
};

const deleteIconsMainFolder = () => {
  if (existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
    console.log("😳 ==> Icons directory deleted!");
  }

  if (existsSync(join(OUT_DIR, "index.ts"))) {
    writeFileSync(join(OUT_DIR, "index.ts"), "");
    console.log("😳 ==> Index file deleted!");
  }
};

// create icons directory with variants and index file
const createIconsFolder = () => {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR);
    for (const variant of variants) {
      mkdirSync(join(OUT_DIR, variant));
    }

    console.log("🤓 ==> Icons directory created!");

    // create index file
    const indexFile = join(OUT_DIR, "index.ts");
    writeFileSync(indexFile, "");
    console.log("🤓 ==> Index file created!");
  }
};

deleteIconsMainFolder();
createIconsFolder();
convertSvgs();
