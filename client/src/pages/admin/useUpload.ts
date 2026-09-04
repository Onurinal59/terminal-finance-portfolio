/**
 * Blob'a doğrudan tarayıcıdan yükleme.
 *
 * Dosya sunucudan geçmez; /api/admin/upload yalnızca kısa ömürlü bir jeton verir.
 * İzin verilen klasör, tür ve boyut sunucuda kısıtlanır, burada sadece kullanıcıya
 * hızlı geri bildirim vermek için ön kontrol yapılır.
 */
import { useCallback, useState } from "react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";

export type UploadFolder = "reports" | "cv" | "media";

const CLIENT_HINTS: Record<UploadFolder, { accept: string; label: string }> = {
  reports: { accept: "application/pdf", label: "PDF" },
  cv: { accept: "application/pdf", label: "PDF" },
  media: { accept: "image/png,image/jpeg,image/webp,image/avif", label: "PNG, JPG, WEBP veya AVIF" },
};

export function uploadAccept(folder: UploadFolder) {
  return CLIENT_HINTS[folder].accept;
}

export function useUpload(folder: UploadFolder) {
  const [busy, setBusy] = useState(false);

  const start = useCallback(
    async (file: File, nameHint?: string): Promise<{ url: string; fileName: string } | null> => {
      const accepted = CLIENT_HINTS[folder].accept.split(",");
      if (!accepted.includes(file.type)) {
        toast.error(`Bu alana yalnızca ${CLIENT_HINTS[folder].label} yükleyebilirsiniz.`);
        return null;
      }

      setBusy(true);
      try {
        const safeName = `${nameHint ? `${nameHint}-` : ""}${file.name}`.replace(/[^\w.\-]+/g, "-");
        const blob = await upload(`${folder}/${safeName}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
        });
        toast.success("Yüklendi. Değişikliği kaydetmeyi unutmayın.");
        return { url: blob.url, fileName: file.name };
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Yükleme başarısız");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [folder]
  );

  return { start, busy };
}
