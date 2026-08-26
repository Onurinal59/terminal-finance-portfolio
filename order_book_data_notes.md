# Emir Derinliği Veri Notları

## Referans tarihi

Araştırma tarihi: **26 Ağustos 2026**.

## Doğrulanmış bulgu

ICE’nin Borsa İstanbul veri kataloğu, BIST için gerçek zamanlı ve gecikmeli **Level-1**, **Level-2**, tam piyasa derinliği ve Market By Price kapsamı sunduğunu doğrular. Erişim; ICE Connect, ICE Consolidated Feed, ICE Data API ve ilgili kurumsal ürünler üzerinden sağlanır. Sayfa, erişim için kayıt/iletişim kanalı gösterir; herkese açık ücretsiz bir Level-2 uç noktası belirtmez. Kaynak: [ICE Borsa Istanbul katalog sayfası](https://developer.ice.com/fixed-income-data-services/catalog/borsa-istanbul).

## Uygulama sonucu

Yahoo Finance fiyat/OHLC verisi, gerçek emir defteri/Level-2 kapsamı sağlamaz. Bu nedenle BIST için ücretsiz, yayınlanabilir gerçek kademe verisi bağlamak güvenilir ve lisanslı bir yöntem değildir. Terminal, mevcut model bantlarını gerçek emir defteri olarak göstermeyecek; kullanıcı bir lisanslı sağlayıcı hesabı bağladığında gerçek Market By Price entegrasyonuna hazır bir veri durumu gösterecek.

## Kaynaklar

1. ICE Developer Portal, “Borsa Istanbul”, erişim 26 Ağustos 2026.
2. Yahoo Finance Chart API, fiyat/OHLC kapsamı; Level-2/emir defteri sağlamaz.
