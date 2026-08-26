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

## Terminal v0.8 — 26 Ağustos 2026

Masaüstü kontrolünde panel başlıkları taşıma tutamacını yalnız başlık alanında gösterdi; gövdedeki grafik, seçim ve form eylemleri sürükleme başlatmıyor. Sağ dock, canlı fiyat aralığı ile Yahoo yıllık gelir kalemlerini birlikte gösterdi. Raporlar ve Bağlantı ekranlarının alt alanları yayın/iletişim akışı blokları ile doldu. Dar grafik panellerinde finansal sekmelerin ayrı satırda görünmesi için araç çubuğu düzeni iyileştirildi.

Gelir tablosu ve bilanço sekmeleri, seçili THYAO için sunucu aracısı üzerinden yıllık Yahoo Finance kalemlerini açtı. Sağlayıcının dönem para birimlerini karıştırdığı durumda grafik karşılaştırması kapatılıp tablo açıklaması gösterildi. Mali tablo ekranı masaüstünde daha çok sütun göstermek üzere ana çalışma alanının tam genişliğine alındı.

İkinci masaüstü denetiminde Income, Balance ve Cash Flow sekmeleri doğru aktif durumu aldı. Canlı veri istekleri sağlayıcı yenilemesi sırasında boş/yükleme durumuna geçebiliyor; sunucu kayıtları daha sonra THYAO OHLC yanıtının başarıyla döndüğünü gösterdi. Arayüz bu süre için veriyi bekleyen durumunu açıkça gösterir.

Mobil doğrulamada panel başlıklarında taşıma tutamacı yerine kilit göstergesi göründü; seçenek menüsü gizlenerek yanlışlıkla panel taşıma/büyütme engellendi. Gelir tablosu mobilde yatay kaydırılabilir finansal tablo olarak, Raporlar ve Bağlantı modülleri ise içerik bloklarıyla dolu tek sütun halinde göründü. Kişisel izleme listesi sayacı ve sabit varsayılan evren de mobilde erişilebilir kaldı.

## Terminal v0.9 — 26 Ağustos 2026

Masaüstü doğrulamada serbest ASML sorgusu için görünür Yahoo Quote Lookup yükleme durumu, iki sekmeli İzleme Listesi/Piyasa Keşfi yüzeyi ve ülke/varlık filtresi göründü. Piyasa Keşfi sekmesi gerçek seçili evrenden Trending Tickers, Top Gainers ve Top Losers sıralamasını fiyat/değişim ile oluşturdu. Gelir tablosu görünümünde dört mali yıl tablosu ve karışık para birimi uyarısı; sağ dock’ta fiyat, dönem aralığı, mum kapsamı ile yıllık finansal kalemler aynı anda göründü.

Mobil v0.9 denetiminde ASML araması gerçek Yahoo sonuçlarıyla (ASML, ASML.AS, ilgili ETF/listing sonuçları) görünür oldu. Piyasa Keşfi görünümünde gerçek seçili evrenin Trending Tickers, Top Gainers ve Top Losers listeleri tek sütunda taşmadan aktı. Profilin akademik/proje/araç seti kartları önceki boş alanı doldurdu; mali tablo ve sağ analiz bilgileri mobil akışta okunur kaldı. Mobilde yalnız aç/kapa denetimi ile bildirim simgesi görünür; taşıma ve seçenek menüsü kapalıdır.
