/**
 * Panoya kopyalama.
 *
 * `navigator.clipboard` yalnızca güvenli bağlamda (https/localhost) ve izin
 * verildiğinde çalışır; yoksa çağrı ya hiç yoktur ya da sessizce reddedilir.
 * Site bunu kontrol etmeden "kopyalandı" diyordu — panoda hiçbir şey yokken
 * kullanıcıya yalan söyleyen bir arayüz. Burada önce modern API denenir,
 * olmazsa eski `execCommand` yoluna düşülür, ikisi de olmazsa `false` döner.
 */
export async function copyText(text: string): Promise<boolean> {
  if (!text) return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // İzin verilmedi ya da bağlam güvenli değil; aşağıdaki yedek yol denenir.
    }
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    // Ekranda görünmesin ama seçilebilir kalsın; readOnly klavye açılmasını engeller.
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
