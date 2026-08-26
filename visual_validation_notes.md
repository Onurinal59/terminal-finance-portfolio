# Görsel Doğrulama Notları

**26 Ağustos 2026** tarihinde yapılan masaüstü doğrulamasında profil panelinin çalışma alanının üstünde konumlandığı, profil fotoğrafının göründüğü, seçilen Türkçe fotoğraflı CV için PDF indirme çağrısının doğru etiketle sunulduğu, OHLC bilgi kutusunun gerçek grafik üzerinde göründüğü ve piyasa özetinin altı enstrüman ile günlük hareketlileri içerdiği doğrulandı.

Mobil doğrulamada terminal tek sütuna geçti. Profil, grafik, piyasa özeti ve eğitim panelleri okunur şekilde sıralandı. Mobil panel başlıklarında dokunmatik yedek sıralama için yukarı/aşağı denetimleri görünür durumdadır; masaüstü HTML5 sürükle-bırak akışı ayrıca pencere kenarında otomatik kaydırma desteği taşır.

> Veri kartları, isteğe bağlı ücretsiz Yahoo Finance sağlayıcısına bağlıdır; kısa süreli yükleme veya gecikmeli gösterim sağlayıcı yanıt süresine göre değişebilir.

## Sağlayıcı Dayanıklılığı — 26 Ağustos 2026

Masaüstü ve 390×844 mobil doğrulamalarında terminal, canlı piyasa değerleri ve THYAO OHLC grafiğiyle normal olarak yüklendi. Yahoo Finance geçici ağ başarısızlıklarında ikinci sağlayıcı alan adı denenir; her iki kaynak erişilemezse mevcut önbellekteki son başarılı grafik korunur. Böylece geçici harici veri kesintisi tüm terminalin hata ekranına düşmesine neden olmaz.

## Modül Düzeni v0.7 — 26 Ağustos 2026

Masaüstü doğrulamasında kilit simgeli izleme listesi sabit bir dock olarak kaldı; sürükleme tutamacı taşımıyor. Piyasa özeti artık oturum pusulası, risk iştahı göstergesi, altı piyasa kartı ve güçlü/zayıf hisse akışı içeriyor. `?view=RESEARCH` rapor kütüphanesini, `?view=CONTACT` ise e-posta taslak formu ile doğrudan kanalları doğru açtı. Sağ dock, seçili sembol için finansal analiz ölçüleri ve fiyat konumu sunuyor.

Mobil ikinci doğrulamada rapor listesi ile ön izleme tek sütuna alındı; bağlantı formu ve doğrudan kanallar da sırayla akıyor. Böylece dar ekranda rapor detayları ya da iletişim alanları sıkışmadan okunabiliyor.

## Gerçek PDF Raporu — 26 Ağustos 2026

Kullanıcının sağladığı `2064_sample.pdf`, kaynak etiketiyle **Microsoft Equity Research · Örnek** kartına bağlandı. Masaüstü ve mobil rapor kütüphanesinde seçili kartın ön izlemesi doğru göründü; **PDF’yi Aç** ve **İndir** eylemleri görünür durumdadır. Geliştirme sunucusu storage yoluna istek attığında dosya için imzalı yönlendirme üretiyor.
