import puppeteer from "puppeteer";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const template = join(root, "scripts/og-template.html");
const output = join(root, "assets/images/og.png");

const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(template).href, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  const surface = await page.$("body");
  await surface.screenshot({ path: output, type: "png" });
  console.log("Wrote assets/images/og.png");
} finally {
  await browser.close();
}