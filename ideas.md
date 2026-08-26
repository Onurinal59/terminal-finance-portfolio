# Terminal Finance Portfolio — Tasarım Yönü

## Yaklaşım Seçenekleri

### 1. Piyasa Odası
**Çok Kısa Tanım:** Koyu yüzeyler, canlı piyasa renkleri ve yoğun veri kartlarıyla canlı bir finans terminalinin disiplinini taşır. Kullanıcıya analize hazır, odaklı ve profesyonel bir çalışma alanı hissi verir.

**Olasılık:** 0.06

### 2. Editoryal Araştırma Defteri
**Çok Kısa Tanım:** Açık krem zemin, arşiv etiketleri ve serif başlıklarla akademik finans araştırmalarını dergi estetiğinde sergiler. Düşünerek okuma ve uzun vadeli perspektif hissi yaratır.

**Olasılık:** 0.02

### 3. Bloomberg Sonrası
**Çok Kısa Tanım:** Brutalist tipografi, portakal vurgular ve katı modüler panellerle finans haber odası enerjisini taşır. Hızlı, iddialı ve yüksek kontrastlı bir ifade sunar.

**Olasılık:** 0.08

---

## Seçilen Yaklaşım: Piyasa Odası

### Tasarım Hareketi
Klasik finans terminali arayüzleri ile **Swiss International Style**’ın bilgi hiyerarşisini birleştiren çağdaş veri minimalizmi. Matriks Data’dan alınan ilham, onun kurumsal web düzenini kopyalamak değil; piyasa bandı, derinlik hissi, canlı metrik ritmi ve finans odaklı güven duygusunu kişisel portfolio anlatısına uyarlamaktır.

### Temel İlkeler
1. **Veri anlatının parçasıdır:** Metinler, oranlar, modül etiketleri ve bölüm kimlikleriyle desteklenir.
2. **Asimetrik yoğunluk:** Ana anlatı solda sakin kalırken sağdaki terminal modülleri hareket ve bağlam sunar.
3. **İşlevsel kontrast:** Koyu kömür yüzeylerde kırık beyaz yazı; değişim göstergelerinde yeşil, mercan ve buz mavisi kullanılır.
4. **Mimarî sınırlar:** Yuvarlak kart bolluğu yerine ince çizgiler, keskin köşeler ve kontrollü boşluk kullanılır.

### Renk Felsefesi
Ana zemin gece seansı hissi veren siyaha yakın laciverttir; bu yüzey veriyi merkeze alır ve uzun okumada göz yormaz. **Terminal Yeşili** yalnızca olumlu hareket, navigasyon odağı ve eylem çağrılarında kullanılarak markaya ait sinyal rolü üstlenir. Mercan kırmızı kayıp/risk, buz mavisi ise nötr veri ve bağlantı katmanı olarak davranır. Böylece renk, dekor değil anlam katmanı olur.

### Yerleşim Paradigması
Sayfa, ortalanmış pazarlama landing page yapısından kaçınarak bir **terminal çalışma alanı** gibi kurgulanır: sabit piyasa bandı, solda dikey bölüm indisi, içerikte değişken genişlikli analiz blokları ve sağda bağlama göre sabitlenen mini veri paneli. Mobilde bu modüller sırayla açılan okunabilir bir akışa dönüşür.

### İmza Öğeler
1. Üstte yatay kayan piyasa bandı ve hassas fiyat/puan değişim göstergeleri.
2. Bölümleri tanımlayan `01/05` terminal indeksleri ve ince köşe kılavuzları.
3. Başlıkların arkasında çok hafif, canlı yeşil sayı/ızgara dokusu ve tarama çizgileri.

### Etkileşim Felsefesi
Etkileşimler piyasadaki sinyaller gibi kısa, açıklayıcı ve amaçlıdır. Rapor kartı üzerine gelindiğinde kartın veri satırları açılır; navigasyon tıklamaları sayfayı ilgili modüle taşır; e-posta eylemi doğrudan kullanıcının e-posta istemcisini açar. Boş veya göstermelik bir özellik yerine, her hareket bilgi erişimini hızlandırmalıdır.

### Animasyon
Sayfa açılışında piyasa bandı ve hero metni 80 ms aralıklarla belirir. Rakamlar bir kez kısa sayım animasyonu yapar; parıltı efektleri kullanılmaz. Hover durumlarında yalnızca opaklık, ince çizgi ve 2–4 px dönüşüm değişir; süreler 140–220 ms aralığında kalır. `prefers-reduced-motion` durumunda tüm anlamsız hareketler kapatılır.

### Tipografi Sistemi
Başlıklarda **Space Grotesk** kullanılır: geniş, teknik ve kendinden emin. Gövde metni için **Manrope**, terminal değerleri ve etiketlerde **IBM Plex Mono** seçilir. Başlıklar büyük/keskin; açıklamalar daha dar satır genişliğinde; veri sütunları daima monospace hizayla gösterilir.

### Marka Özü
**Veriyi, kendi yatırım tezini ve yayınlarını piyasa terminallerinin açıklığıyla paylaşan finans öğrencileri için kişisel araştırma arayüzü.**

Kişilik sıfatları: **analitik, bağımsız, kontrollü.**

### Marka Dili
Başlıklar kısa, tez odaklı ve kesin olur; eylem çağrıları bir araştırma sürecindeki sonraki adımı önerir. Genel geçer pazarlama cümleleri kullanılmaz.

Örnek satırlar:

> “Veriyi izlemek değil, savunulabilir bir tez kurmak.”

> “Raporu aç — varsayımları incele.”

### Sözcük Markası ve Logo
Metinsiz logo, üç yükselen sütun ve aralarından geçen ince bir fiyat çizgisinden oluşan geometrik bir **sinyal işareti** olacaktır. Sözcük markasında monospaced terminal etiketi yaklaşımı kullanılır: `ANALİZ // PORTFOLIO`.

### İmza Marka Rengi
**Sinyal Yeşili — #78F27B.** Koyu ekran üzerinde yalnızca anlamlı odak, büyüme ve eylem noktalarında görünür.

## Stil Kararları

- **Sinyal Yeşili #78F27B** yalnızca eylemler, olumlu hareket, aktif durum, tez vurguları ve seçilmiş veri noktaları için kullanılır; tam bölüm zemini ancak açıkça tekil bir “aktif sinyal” anı olarak gerekçelendirildiğinde tercih edilir.
- Marka dili yalnızca koyu terminal yüzeyi, Sinyal Yeşili, kırık beyaz, mercan risk ve buz mavisi nötr veri renklerini kullanır; plansız ikincil vurgu renkleri kullanılmaz.
- Her ana bölümde en az bir terminal yerel öğesi bulunur: modül numarası, durum satırı, varsayım etiketi, rapor durumu, metrik şeridi veya monospace meta veri.

## Uygulama İçeriği ve Yer Tutucu Politikası

Kullanıcının gerçek adı, e-posta adresi, CV’si ve rapor PDF’leri henüz paylaşılmadığı için ilk sürümde bu unsurlar açıkça değiştirilebilir portföy alanları olarak işaretlenecektir. İletişim bölümü `mailto:` akışıyla çalışacak; e-posta adresi daha sonra tek bir içerik değişkeninden güncellenebilecektir. Rapor kartlarında yalnızca örnek başlıklar ve gerçek dosya bağlanması gerektiğini belirten durum etiketleri bulunacaktır.
