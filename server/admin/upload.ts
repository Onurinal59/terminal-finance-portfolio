/**
 * Rapor PDF yüklemesi.
 *
 * Dosya sunucudan geçmez: tarayıcı doğrudan Vercel Blob'a yükler, bu uç yalnızca
 * kısa ömürlü bir yükleme jetonu verir. Böylece sunucusuz fonksiyonun gövde
 * sınırına (~4.5 MB) takılmadan büyük PDF'ler yüklenebilir.
 */
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { Express, Request, Response } from "express";
import { ADMIN_ENV } from "./env.js";
import { readAdminSession } from "./session.js";

/** Yükleme yolu → izin verilen tür ve boyut. Sunucu kısıtlar, istemci seçemez. */
const UPLOAD_RULES = [
  { prefix: "reports/", types: ["application/pdf"], maxBytes: 25 * 1024 * 1024 },
  { prefix: "cv/", types: ["application/pdf"], maxBytes: 10 * 1024 * 1024 },
  {
    prefix: "media/",
    types: ["image/png", "image/jpeg", "image/webp", "image/avif"],
    maxBytes: 8 * 1024 * 1024,
  },
] as const;

export function registerAdminUploadRoute(app: Express) {
  app.post("/api/admin/upload", async (req: Request, res: Response) => {
    const session = await readAdminSession(req);
    if (!session) {
      res.status(401).json({ error: "Yönetici oturumu bulunamadı" });
      return;
    }
    if (!ADMIN_ENV.blobToken) {
      res.status(412).json({ error: "BLOB_READ_WRITE_TOKEN tanımlı değil" });
      return;
    }

    try {
      const result = await handleUpload({
        body: req.body as HandleUploadBody,
        request: req,
        token: ADMIN_ENV.blobToken,
        onBeforeGenerateToken: async (pathname) => {
          // Yükleme yolunu sunucu kısıtlar; istemci rastgele bir yere yazamaz.
          const rule = UPLOAD_RULES.find((candidate) => pathname.startsWith(candidate.prefix));
          if (!rule) {
            throw new Error(
              `Yükleme yolu izinli değil. İzinli klasörler: ${UPLOAD_RULES.map((r) => r.prefix).join(", ")}`
            );
          }
          return {
            allowedContentTypes: [...rule.types],
            maximumSizeInBytes: rule.maxBytes,
            addRandomSuffix: true,
            tokenPayload: JSON.stringify({ email: session.email }),
          };
        },
        onUploadCompleted: async ({ blob }) => {
          console.log("[Admin] PDF yüklendi:", blob.pathname);
        },
      });

      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Yükleme başarısız";
      console.error("[Admin] Yükleme hatası:", error);
      res.status(400).json({ error: message });
    }
  });
}
