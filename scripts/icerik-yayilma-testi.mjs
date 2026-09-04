/**
 * Icerik yayilma testi.
 *
 * Kullanim: once `npm run dev`, sonra `node scripts/icerik-yayilma-testi.mjs`
 *
 * Yayilma testi: icerikten gelen her baglanti/varlik SITENIN TAMAMINDA degisiyor mu?
 * Sahte bir icerik enjekte edip her sayfayi tarar; eski (sabit kodlu) degerlerin
 * hicbir yerde kalmadigini dogrular.
 */
import { chromium } from "playwright";
const ORIGIN = "http://127.0.0.1:3000";

const YENI = {
  linkedin: "https://www.linkedin.com/in/TEST-LINKEDIN/",
  measureMoat: "https://TEST-MOAT.example.com/yol",
  email: "test-eposta@example.com",
  photo: "https://TEST-CDN.example.com/foto.jpg",
  cv: {
    trPhoto: { url: "https://TEST-CDN.example.com/cv-tr-foto.pdf", fileName: "cv-tr-foto.pdf" },
    trPlain: { url: "https://TEST-CDN.example.com/cv-tr-ats.pdf", fileName: "cv-tr-ats.pdf" },
    enPhoto: { url: "https://TEST-CDN.example.com/cv-en-foto.pdf", fileName: "cv-en-foto.pdf" },
    enPlain: { url: "https://TEST-CDN.example.com/cv-en-ats.pdf", fileName: "cv-en-ats.pdf" },
  },
};

const CONTENT = {
  schemaVersion: 1, revision: 9, updatedAt: new Date().toISOString(),
  links: { linkedin: YENI.linkedin, measureMoat: YENI.measureMoat, email: YENI.email },
  media: { profilePhoto: YENI.photo },
  cv: YENI.cv,
};

// Sitede hicbir yerde kalmamasi gereken eski degerler
const ESKI = [
  "linkedin.com/in/onur%C4%B1nal", "linkedin.com/in/onurınal", "onur-inal-5b72182b8",
  "measure-moat.vercel.app", "onurinal815@gmail.com",
  "/media/onur-inal.jpg", "/cv/Onur_Inal_CV",
];

const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 950 } });
await c.route("**/*", async (route) => {
  const url = route.request().url();
  if (!url.startsWith(ORIGIN)) return url.startsWith("https://fonts.") ? route.fallback() : route.abort();
  if (!url.includes("/api/trpc/")) return route.continue();
  const procs = decodeURIComponent(new URL(url).pathname.split("/api/trpc/")[1] || "").split(",");
  const i = procs.indexOf("content.get");
  if (i === -1) return route.continue();
  const response = await route.fetch();
  const body = await response.json();
  body[i] = { result: { data: { json: CONTENT } } };
  return route.fulfill({ response, body: JSON.stringify(body), headers: { "content-type": "application/json" } });
});
const p = await c.newPage();

let sorun = 0;
for (const view of ["", "PROFILE", "RESEARCH", "CONTACT"]) {
  for (const lang of ["tr", "en"]) {
    await p.goto(`${ORIGIN}/?lang=${lang}${view ? `&view=${view}` : ""}`, { waitUntil: "domcontentloaded" });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(2500);

    const bulgu = await p.evaluate((eski) => {
      const html = document.documentElement.outerHTML;
      const kalanlar = eski.filter((x) => html.includes(x));
      const hrefler = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
      const gorseller = [...document.querySelectorAll("img[src]")].map((i) => i.getAttribute("src"));
      return { kalanlar, hrefler, gorseller };
    }, ESKI);

    const etiket = `${view || "PANO"}/${lang}`;
    if (bulgu.kalanlar.length) {
      console.log(`  ✗ ${etiket}: ESKI DEGER KALMIS ->`, bulgu.kalanlar);
      sorun++;
    } else {
      const yeniVar = bulgu.hrefler.some((h) => h?.includes("TEST-")) || bulgu.gorseller.some((s) => s?.includes("TEST-"));
      console.log(`  ✓ ${etiket}: temiz${yeniVar ? " (yeni degerler goruldu)" : ""}`);
    }
  }
}

// CV indirme butonlari: tiklaninca yeni adrese mi gidiyor?
await p.goto(`${ORIGIN}/?lang=tr&view=PROFILE`, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(2500);
const cvHedefleri = await p.evaluate(() => {
  const yakalanan = [];
  const orij = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { yakalanan.push(this.href); };
  document.querySelectorAll(".cv-download-center button").forEach((b) => b.click());
  HTMLAnchorElement.prototype.click = orij;
  return yakalanan;
});
console.log("  CV indirme hedefleri:", cvHedefleri.length ? cvHedefleri : "(buton bulunamadi)");
if (cvHedefleri.length && cvHedefleri.some((h) => !h.toLowerCase().includes("test-cdn"))) {
  console.log("  ✗ CV butonlarindan bazilari eski adrese gidiyor"); sorun++;
}

console.log(sorun === 0 ? "\nSONUC: TUM SITEDE YAYILIYOR" : `\nSONUC: ${sorun} YERDE YAYILMIYOR`);
await b.close();
process.exit(sorun === 0 ? 0 : 1);
