/**
 * CV indirme akışı.
 *
 * Üç ayrı yerde (pano profil kartı, tam profil sayfası, iletişim masası) aynı
 * mantık kullanılıyordu ve üçü de kopyala-yapıştır `<a download>` çağrısıydı;
 * panelden yüklenen CV'ler farklı kaynaktan geldiği için sessizce inmiyordu.
 * Artık tek yer: indirme `downloadFile` üzerinden yapılır, sonucu — indi,
 * sekmede açıldı ya da başarısız oldu — kullanıcıya bildirilir.
 */
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { downloadFile } from "@/lib/fileDownload";

/** Bu süreden hızlı biten indirmelerde "hazırlanıyor" bildirimi hiç görünmez. */
const PENDING_TOAST_DELAY_MS = 220;

export function useCvDownload() {
  const { t } = useI18n();
  const [isDownloading, setDownloading] = useState(false);

  const download = useCallback(
    async (url: string, fileName: string) => {
      if (!url) {
        toast.error(t("toast.cvFailed"), { description: t("toast.cvFailedDesc") });
        return;
      }
      setDownloading(true);

      // Aynı kaynaktan gelen dosya anında iner; ara bildirimi göstermek bir kare
      // titremeye yol açardı. Bu yüzden yalnızca gecikme olursa gösteriliyor.
      let pendingId: string | number | undefined;
      const pendingTimer = window.setTimeout(() => {
        pendingId = toast.loading(t("toast.cvPreparing"), { description: fileName });
      }, PENDING_TOAST_DELAY_MS);

      try {
        const outcome = await downloadFile(url, fileName);
        if (outcome === "downloaded") {
          toast.success(t("toast.cvStarted"), { id: pendingId, description: fileName });
        } else {
          toast.info(t("toast.cvOpened"), { id: pendingId, description: t("toast.cvOpenedDesc") });
        }
      } catch {
        toast.error(t("toast.cvFailed"), { id: pendingId, description: t("toast.cvFailedDesc") });
      } finally {
        window.clearTimeout(pendingTimer);
        setDownloading(false);
      }
    },
    [t]
  );

  return { download, isDownloading };
}
