/**
 * Panel surum cakismasi testi.
 *
 * Kullanim:
 *   ADMIN_SESSION_SECRET=... npm run dev
 *   ADMIN_SESSION_SECRET=... node scripts/panel-cakisma-testi.mjs
 *
 * Senaryo: panel surum 9'u yuklemis. Bu arada baska bir yerden (telefondan)
 * kayit yapilmis; depoda surum 10 var ve izleme listesi degismis. Kullanici
 * burada LinkedIn adresini degistirip Kaydet'e basiyor.
 *
 * Beklenen: kullaniciya hata gosterilmiyor. Panel depodaki hali kendi
 * taslagiyla ucr yonlu birlestirip tekrar kaydediyor; ikinci istekte hem
 * kullanicinin degisikligi hem telefondan gelen degisiklik bulunuyor.
 */
import { chromium } from "playwright";
import { SignJWT } from "jose";

const ORIGIN = process.env.TEST_ORIGIN || "http://127.0.0.1:3000";
const SECRET = process.env.ADMIN_SESSION_SECRET;
if (!SECRET) {
  console.error("ADMIN_SESSION_SECRET tanimli degil; dev sunucusuyla ayni degeri verin.");
  process.exit(2);
}

const token = await new SignJWT({ email: "onurinal815@gmail.com", name: "Onur Inal" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuer("onurinal-admin")
  .setSubject("onurinal815@gmail.com")
  .setIssuedAt()
  .setExpirationTime("2h")
  .sign(new TextEncoder().encode(SECRET));

const YUKLENEN = {
  schemaVersion: 1,
  revision: 9,
  updatedAt: "2026-09-05T10:00:00.000Z",
  updatedBy: "onurinal815@gmail.com",
  links: { linkedin: "https://eski-linkedin/", measureMoat: "https://moat/", email: "a@b.com" },
  watchlist: ["THYAO.IS", "ASELS.IS"],
};
/** Telefondan yapilan kayit: surum ilerledi ve izleme listesi degisti. */
const DEPODAKI = { ...YUKLENEN, revision: 10, watchlist: ["TUPRS.IS", "GARAN.IS"] };

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const ctx = await browser.newContext({ viewport: { width: 1400, height: 950 } });
await ctx.addCookies([
  { name: "admin_session", value: token, domain: new URL(ORIGIN).hostname, path: "/", httpOnly: true },
]);
// Dis kaynaklari (yazi tipleri) kes: test islevsel, gorunum onemli degil.
await ctx.route("**/*", (r) => (r.request().url().startsWith(ORIGIN) ? r.continue() : r.abort()));

const page = await ctx.newPage();
const kayitlar = [];
let icerikCagrisi = 0;

await page.route("**/api/trpc/**", async (route) => {
  const url = new URL(route.request().url());
  const procs = decodeURIComponent(url.pathname.split("/api/trpc/")[1] || "").split(",");
  const govde = [];

  for (const [i, ham] of procs.entries()) {
    const proc = ham.trim();
    if (proc === "admin.status") {
      govde[i] = {
        result: {
          data: {
            json: {
              session: { email: "onurinal815@gmail.com", name: "Onur Inal" },
              missingConfig: [],
              storageReady: true,
            },
          },
        },
      };
    } else if (proc === "admin.content") {
      icerikCagrisi += 1;
      // Ilk cagri panelin acilisi (surum 9); sonrakiler cakisma sonrasi taze okuma (surum 10).
      govde[i] = { result: { data: { json: icerikCagrisi === 1 ? YUKLENEN : DEPODAKI } } };
    } else if (proc === "admin.save") {
      let girdi = {};
      try {
        girdi = JSON.parse(route.request().postData() || "{}");
      } catch {
        girdi = {};
      }
      const yuk = girdi[String(i)] ?? girdi[i] ?? girdi;
      const veri = yuk?.json ?? yuk;
      kayitlar.push(veri);
      if (kayitlar.length === 1) {
        govde[i] = {
          error: {
            json: {
              message: "Icerik baska bir yerden guncellenmis (kayitli surum 10, gonderilen 9).",
              code: -32009,
              data: { code: "CONFLICT", httpStatus: 409, path: "admin.save" },
            },
          },
        };
      } else {
        govde[i] = { result: { data: { json: { ...DEPODAKI, ...veri.draft, revision: 11 } } } };
      }
    } else {
      govde[i] = { result: { data: { json: null } } };
    }
  }
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(govde) });
});

await page.goto(`${ORIGIN}/admin`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);

await page.locator('.adm-nav-item:has-text("Baglantilar"), .adm-nav-item:has-text("Bağlantılar")').first().click();
await page.waitForTimeout(600);
await page.locator(".adm-main input").first().fill("https://yeni-linkedin/");
await page.waitForTimeout(300);
await page.locator("button:has-text('Kaydet')").first().click();
await page.waitForTimeout(2500);

const bildirimler = (await page.locator("[data-sonner-toast]").allTextContents()).map((t) =>
  t.replace(/\s+/g, " ").trim()
);

console.log("kaydetme istegi sayisi:", kayitlar.length);
console.log("1. istek surumu:", kayitlar[0]?.expectedRevision);
console.log("2. istek surumu:", kayitlar[1]?.expectedRevision);
console.log("2. istekteki linkedin:", kayitlar[1]?.draft?.links?.linkedin);
console.log("2. istekteki izleme listesi:", kayitlar[1]?.draft?.watchlist);
console.log("bildirimler:", bildirimler);

const basarili =
  kayitlar.length === 2 &&
  kayitlar[0].expectedRevision === 9 &&
  kayitlar[1].expectedRevision === 10 &&
  kayitlar[1].draft.links.linkedin === "https://yeni-linkedin/" &&
  JSON.stringify(kayitlar[1].draft.watchlist) === JSON.stringify(["TUPRS.IS", "GARAN.IS"]) &&
  bildirimler.some((t) => t.includes("Kaydedildi")) &&
  !bildirimler.some((t) => t.includes("Sayfayi yenileyip") || t.includes("Sayfayı yenileyip"));

console.log(basarili ? "\nSONUC: CAKISMA KENDILIGINDEN COZULDU" : "\nSONUC: BASARISIZ");
await browser.close();
process.exit(basarili ? 0 : 1);
