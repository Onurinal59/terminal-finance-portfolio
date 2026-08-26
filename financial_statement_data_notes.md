# Finansal Tablo Veri Notu

## Entity Card — Canlı seçili hisse

| Alan | Uygulama yaklaşımı |
| --- | --- |
| Varlık | Kullanıcının grafikte seçtiği halka açık hisse senedi |
| Sembol | Yahoo Finance sembolü; BIST hisselerinde `.IS` uzantısı kullanılır |
| Borsa | Yahoo Finance chart/meta yanıtından alınır |
| Mali yıl | Yahoo yanıtındaki her `asOfDate` alanı; yayın tarihiyle karıştırılmaz |
| Para birimi ve birim | Her mali yıl sütununda sağlayıcının `currencyCode` ve `reportedValue` değeri ayrı gösterilir |
| Veri kapsamı | Yıllık gelir tablosu, bilanço ve nakit akışı kalemleri; yalnızca Yahoo’nun döndürdüğü alanlar |

## Kaynak ve doğrulama

26 Ağustos 2026’da `THYAO.IS` için Yahoo Finance fundamentals-timeseries uç noktasında yıllık gelir, bilanço ve nakit akışı satırları doğrulandı. Sağlayıcı bazı BIST dönemlerinde farklı raporlama para birimleri döndürebilir. Bu nedenle terminal, farklı para birimindeki yılları aynı çubuk grafikte karşılaştırmaz; ilgili yılları para birimi etiketiyle tabloda gösterir. Aynı para biriminde en az iki dönem olduğunda grafik gösterilir.

Bu modül araştırma amacıyla sağlanan kamuya açık sağlayıcı verisini kullanır; yatırım tavsiyesi değildir.
