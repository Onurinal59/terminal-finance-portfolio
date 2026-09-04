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

// Ozel bir Chromium yolu gerekiyorsa CHROMIUM_PATH ile verilir; yoksa Playwright kendi indirdigini kullanir.
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
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
// Farkli kaynaktan gelen CV'ler artik once fetch ile aliniyor (bkz. lib/fileDownload),
// bu yuzden ag istegini ve indirilen dosya adini birlikte olcuyoruz.
for (const [gorunum, secici] of [["PROFILE", ".cv-download-center button"], ["CONTACT", ".cv-buttons-grid button"]]) {
  await p.goto(`${ORIGIN}/?lang=tr&view=${gorunum}`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(2500);
  await p.evaluate(() => {
    const w = window;
    w.__cvIstekleri = [];
    w.__cvDosyalari = [];
    const orijFetch = w.fetch;
    w.fetch = (girdi, ayar) => {
      const adres = typeof girdi === "string" ? girdi : girdi?.url ?? String(girdi);
      if (adres.includes(".pdf")) {
        w.__cvIstekleri.push(adres);
        return Promise.resolve(new Response(new Blob(["%PDF-1.4 test"], { type: "application/pdf" }), { status: 200 }));
      }
      return orijFetch(girdi, ayar);
    };
    const orijClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (this.download) w.__cvDosyalari.push(this.download);
      else w.__cvIstekleri.push(this.href);
    };
    w.__cvGeriAl = () => { w.fetch = orijFetch; HTMLAnchorElement.prototype.click = orijClick; };
  });
  const dugmeler = await p.locator(secici).all();
  for (const dugme of dugmeler) {
    await dugme.click({ force: true }).catch(() => {});
    // Indirme surerken butonlar kilitleniyor; ayrica biriken bildirimler bir
    // sonraki butonun ustune gelebiliyor. Ikisini de temizleyip devam ediyoruz.
    await p.waitForTimeout(500);
    await p.evaluate(() => document.querySelectorAll("[data-sonner-toast] [data-close-button]").forEach((b) => b.click()));
    await p.waitForTimeout(200);
  }
  const sonuc = await p.evaluate(() => {
    const w = window;
    w.__cvGeriAl?.();
    return { istekler: w.__cvIstekleri, dosyalar: w.__cvDosyalari };
  });
  console.log(`  ${gorunum} CV istekleri:`, sonuc.istekler.length ? sonuc.istekler : "(buton bulunamadi)");
  if (!sonuc.istekler.length) {
    console.log(`  ✗ ${gorunum}: CV butonu bulunamadi`); sorun++;
  } else if (sonuc.istekler.some((h) => !h.toLowerCase().includes("test-cdn"))) {
    console.log(`  ✗ ${gorunum}: bazi CV butonlari eski adrese gidiyor`); sorun++;
  } else if (!sonuc.dosyalar.length) {
    console.log(`  ✗ ${gorunum}: dosya indirme tetiklenmedi`); sorun++;
  } else {
    console.log(`  ✓ ${gorunum}: ${sonuc.dosyalar.length} dosya indirildi ->`, sonuc.dosyalar);
  }
}

console.log(sorun === 0 ? "\nSONUC: TUM SITEDE YAYILIYOR" : `\nSONUC: ${sorun} YERDE YAYILMIYOR`);
await b.close();
process.exit(sorun === 0 ? 0 : 1);
