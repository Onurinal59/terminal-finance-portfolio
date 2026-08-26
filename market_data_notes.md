# Canlı Piyasa Verisi Doğrulama Notları

**Referans zamanı:** 26 Ağustos 2026, GMT+3.

Yahoo Finance üzerinde `XU100.IS` sayfası BIST 100 için TRY cinsinden gecikmeli fiyat etiketini gösterdi. Tarayıcıda `https://query1.finance.yahoo.com/v8/finance/chart/THYAO.IS?range=5d&interval=1h` isteği HTTP 200 ile `chart` verisini döndürdü. Aynı ortamda `https://query1.finance.yahoo.com/v1/finance/search?q=asels&quotesCount=6&newsCount=0` isteği HTTP 200 ile `ASELS.IS` / `IST` / `EQUITY` sonucunu verdi.

Uygulama bu uç noktaları **Yahoo Finance’in herkese açık ancak resmî olarak garantilenmeyen veri yüzeyi** olarak kullanacak; terminalde veri zamanı, piyasa durumu ve “gecikmeli / sağlayıcı verisi” etiketleri açıkça gösterilecek. Bu uygulama yatırım tavsiyesi vermeyecek; fiyat bilgisi araştırma ekranı içindir.

**Tarayıcı bağımlılığı notu:** Terminalin kendi geliştirme alan adından aynı grafik uç noktasına yapılan doğrudan istek `TypeError: Failed to fetch` ile başarısız oldu. Bu nedenle kullanıcı tarayıcısından doğrudan Yahoo çağrısı yapılmayacak; uygulamanın sunucu tarafındaki bir aracı uç noktası üzerinden veri çekilecek ve veri bu ara katmandan terminale aktarılacak.

**Canlı terminal doğrulaması:** Sunucu aracısı üzerinden izleme listesinde `XU100.IS`, `XU030.IS`, `THYAO.IS`, `ASELS.IS`, `TUPRS.IS`, `AKBNK.IS`, `^GSPC`, `^NDX`, `^VIX`, `AAPL`, `MSFT`, `BRK-B`, `TRY=X`, `EURTRY=X`, `GC=F`, `CL=F` ve `^TNX` için fiyat/değişim verileri terminale yüklendi. Seçili `THYAO.IS` için 5 günlük, 30 dakikalık gerçek OHLC noktaları mum grafikte göründü. Veri çekim zamanı kullanıcı arayüzünde sağlayıcı etiketiyle belirtildi.

**Arama dayanıklılığı:** Yahoo’nun genel arama uç noktası `KOZAL` gibi bazı BIST aramalarında boş sonuç döndürebiliyor. Bu durumda sunucu, yalnızca sağlanan sembolün `.IS` ve yalın biçimlerini gerçek 1 günlük grafik isteği ile doğrulayarak geçerli sonuçları arama listesine ekliyor; doğrulanmayan bir sembol kullanıcıya ekleme sonucu olarak sunulmuyor.

**İstemci araması:** Terminalde `ASELS` sorgusu izleme listesini gerçek `ASELS.IS` satırına filtreledi; canlı fiyat, değişim ve yüzde alanları korunarak görünür oldu. Sorgu sonrasında seçilen satır, gerçek grafik verisi için sunucu aracısına bağlanır.

**Panel düzeni:** Tarayıcıdaki gerçek sürükle-bırak olayıyla `context-panel`, `chart-panel` önüne taşındı. Ana çalışma alanı çocuk sırası `context-panel → chart-panel → depth-panel → summary-panel` olarak değişti ve düzen anahtarları tarayıcı yerel deposuna yazıldı.

**Yeniden dene doğrulaması:** Grafik hata penceresinin tetiklediği `analiz-chart-retry` olayı test edildi. Ağ kaydı, seçili `THYAO.IS` / `5G` için `market.chart` tRPC isteği sayısının 2’den 3’e çıktığını gösterdi; düğme sayfayı yenilemeden doğrudan grafik sorgusunu yeniden başlatıyor.
