/**
 * Bildirim (toast) kabı.
 *
 * Görünüm terminalin diline uydurulmuştur: koyu yüzey, sola yaslı durum
 * şeridi ve mono tipografi. Konumlandırma önemli — mobilde alt gezinme çubuğu,
 * tablette yüzen dock sabit duruyor; bildirim onların üstünde kalmalı, bu
 * yüzden alt boşluk `index.css` içinde kırılım başına ayarlanır.
 */
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => (
  <Sonner
    className="terminal-toaster"
    position="bottom-right"
    // Terminalde bildirimler yığılmaz; üst üste binmek yerine alt alta dizilir.
    expand
    visibleToasts={3}
    duration={4200}
    closeButton
    gap={8}
    {...props}
  />
);

export { Toaster };
