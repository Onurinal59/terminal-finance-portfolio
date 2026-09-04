# Yönetim Paneli Kurulumu

Panel `https://onurinal.vercel.app/admin` adresinde. Çalışması için biri Google'da,
biri Vercel'de olmak üzere iki kurulum gerekiyor. Toplam ~10 dakika.

---

## 1. Google ile giriş

### 1.1 OAuth istemcisi oluştur

Google bu ekranları yeniledi: eski "APIs & Services → OAuth consent screen" yolu artık
**Google Auth Platform** altında. Aşağısı yeni arayüze göre.

1. [Google Cloud Console](https://console.cloud.google.com/) → üstten bir proje oluştur
   veya seç (örn. `onurinal-terminal`).
2. Arama kutusuna **Google Auth Platform** yazıp aç.
3. **Overview** — ilk kez giriyorsan bir başlangıç akışı çıkar, doldur:
   - App name: `Onur İnal Yönetim Paneli`
   - User support email: kendi adresin
   - Audience: **External**
   - Contact information: kendi adresin
   - Politikayı kabul edip **Create**
4. **Audience** — Publishing status **Testing** kalsın, *Publish app'e basma*.
   Aşağıdaki **Test users** bölümüne **Add users** ile kendi Gmail adresini ekle.

   > Testing modunda yalnızca test kullanıcıları giriş yapabilir — istediğimiz tam
   > olarak bu. Üstelik bu modda Google doğrulaması (verification) gerekmez.
5. **Clients → Create client**
   - Application type: **Web application**
   - Name: `onurinal-admin`
   - **Authorized redirect URIs → ADD URI**, tam olarak şunu yapıştır:
     ```
     https://onurinal.vercel.app/api/admin/callback
     ```
     Sonda `/` olmayacak ve `https` olacak; tek karakter fark ederse Google
     `redirect_uri_mismatch` hatası verir.
     (Yerelde de denemek istersen ikinci URI olarak `http://127.0.0.1:3000/api/admin/callback`)
   - **Create** → çıkan **Client ID** ve **Client secret** değerlerini kopyala.
     Secret'ı sonra tekrar göremezsin, hemen bir yere al.
6. **Data Access** — dokunman gerekmiyor. İstediğimiz `openid`, `email`, `profile`
   kapsamları hassas olmayan kapsamlar; Google bunları zaten veriyor.
7. **Verification Center** — Testing modunda kaldığın sürece burayla işin yok.

### 1.2 Oturum anahtarı üret

Terminalde:

```bash
openssl rand -base64 48
```

Çıkan dizeyi `ADMIN_SESSION_SECRET` olarak kullanacaksın.

---

## 2. Vercel Blob deposu

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Storage** sekmesi
2. **Create Database → Blob** → bir ad ver (örn. `onurinal-content`) → oluştur
3. Açılan ekranda **Connect Project** ile `terminal-finance-portfolio` projesini seç

Bu adım `BLOB_READ_WRITE_TOKEN` değişkenini projeye otomatik ekler; elle bir şey
yazman gerekmez.

---

## 3. Ortam değişkenlerini gir

Vercel → proje → **Settings → Environment Variables**. Hepsini
**Production, Preview, Development** için ekle:

| Değişken | Değer |
| --- | --- |
| `GOOGLE_CLIENT_ID` | 1.1'den gelen Client ID |
| `GOOGLE_CLIENT_SECRET` | 1.1'den gelen Client secret |
| `ADMIN_EMAILS` | `onurinal815@gmail.com` |
| `ADMIN_SESSION_SECRET` | 1.2'de ürettiğin dize |
| `ADMIN_BASE_URL` | `https://onurinal.vercel.app` |

Kaydettikten sonra **Deployments → en üstteki dağıtım → Redeploy** ile yeniden dağıt.
Ortam değişkenleri yalnızca yeni dağıtımlarda okunur.

---

## 4. Kontrol

`https://onurinal.vercel.app/admin` adresini aç.

- Sarı "Sunucu yapılandırması eksik" uyarısı görüyorsan, orada yazan değişken
  hâlâ tanımlı değil demektir.
- "Google ile giriş yap" düğmesi aktifse kurulum tamamdır. Giriş yapınca panel açılır.
- Listede olmayan bir Google hesabıyla girmeye çalışırsan "Bu hesabın yönetim
  paneline erişimi yok" mesajını alırsın — beklenen davranış budur.

---

## Panel nasıl çalışıyor?

Panelden yapılan her değişiklik, Vercel Blob'daki **tek bir JSON belgesine**
(`content/site-content.json`) yazılır. Site açılışta bu belgeyi okur ve koddaki
varsayılanların *üzerine* uygular:

- Belge yoksa veya depo bağlı değilse site koddaki hâliyle çalışır — panel hiç
  kullanılmadan da hiçbir şey bozulmaz.
- Bir alanı panelden değiştirmediysen, o alan kodda kalır. İleride kodda bir
  düzeltme yaparsan o düzeltmeyi alırsın.
- Her kaydetmede `revision` sayacı artar. İki sekmeden aynı anda kaydetmeye
  çalışırsan ikincisi reddedilir ve sayfayı yenilemen istenir.

### Bölümler

Panel sol kenar çubuğundan dört gruba ayrılır.

**İçerik**

| Bölüm | Ne yapar |
| --- | --- |
| Raporlar | Rapor ekle/sil/kopyala, sırala, TR ve EN metinlerin tamamı, PDF yükle, taslak veya yayında yap |
| Kategoriler | Kütüphanenin filtre sekmeleri. Yeni kategori ekle, adını değiştir, sırala. Bir kategoriye bağlı rapor varsa silinemez |
| Site metinleri | Sözlükteki ~500 anahtarın tamamı. Ara, değiştir, tek tuşla varsayılana döndür |

**Profil**

| Bölüm | Ne yapar |
| --- | --- |
| Görseller | Profil fotoğrafı ve paylaşım kapağı (og:image) yükle |
| CV dosyaları | TR/EN × fotoğraflı/ATS dört yuva; her birine ayrı PDF |
| Bağlantılar | LinkedIn, e-posta, Measure Moat adresleri + proje listesi |

**Pano**

| Bölüm | Ne yapar |
| --- | --- |
| Makro göstergeler | Gösterge ekle/sil/sırala. Her gösterge bir API'ye bağlanabilir (aşağıya bak) |
| Piyasa seansları | Hangi borsalar listelensin (açık/kapalı otomatik hesaplanır) |
| İzleme listesi | Panodaki varsayılan sembol listesi ve sırası |

**Görünüm**

| Bölüm | Ne yapar |
| --- | --- |
| Görünürlük | GPA rozeti, CV indirme, LinkedIn butonu, pano modülleri gibi 11 blok |
| Uyarılar | Rapor kütüphanesindeki uyarı kutusu ve site geneli duyuru bandı |

### Makro göstergeler: hangi veri nereden gelir

Her göstergenin bir **veri kaynağı** vardır. Kaynağı seçtiğinde değer otomatik
gelir, sen bir daha elle güncellemezsin.

**Anahtarsız çalışanlar** — hiçbir kurulum gerekmez:

| Kaynak | Ne verir | Seri kimliği örneği |
| --- | --- | --- |
| Yahoo Finance | Tahvil getirisi, endeks, kur, emtia, hisse | `^TNX`, `^TYX`, `^VIX`, `DX-Y.NYB`, `USDTRY=X`, `GC=F`, `XU100.IS` |
| New York Fed | ABD federal fon faizi ve FOMC hedef aralığı | `effr-target`, `effr` |
| ECB Data Portal | Euro bölgesi politika faizleri ve enflasyon | `FM.D.U2.EUR.4F.KR.DFR.LEV`, `ICP.M.U2.N.000000.4.ANR` |

**API anahtarı isteyenler** — ikisi de ücretsiz, kayıt birkaç dakika:

| Kaynak | Ne verir | Anahtar |
| --- | --- | --- |
| FRED | ABD makro serileri (TÜFE, tahvil, işsizlik…) | `FRED_API_KEY` — [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html) |
| TCMB EVDS | Türkiye serileri (politika faizi, TÜFE, tahvil) | `EVDS_API_KEY` — [evds2.tcmb.gov.tr](https://evds2.tcmb.gov.tr/) → üye ol → Profil → API Anahtarı |

Anahtarı aldıktan sonra Vercel → Settings → Environment Variables'a ekleyip
yeniden dağıt. Panelin Makro sekmesinde her kaynağın "Hazır" mı yoksa
"API anahtarı gerekiyor" mu olduğunu gösteren bir durum kutusu var.

**Kaynağı olmayanlar.** Türkiye 5 yıllık CDS priminin ücretsiz ve açık bir API'si
yok; o gösterge elle güncellenmeye devam eder. Panelde "Manuel göstergelerin
tarihi" alanını da tazelemeyi unutma — sitenin altında "Manuel anlık görüntü · …"
satırında görünür.

**Rozetler.** Piyasa verilerinde (Yahoo) rozet günlük yüzde değişimi gösterir ve
rengi yönüne göre belirlenir. Politika faizi, enflasyon gibi yavaş serilerde
günlük değişim anlamsız olduğu için rozet verinin **tarihini** gösterir; renk
bir önceki gözleme göre yön alır. Bir kaynak geçici olarak yanıt vermezse
gösterge "VERİ YOK" der, site çökmez.

**Yenileme.** Piyasa verileri dakikada bir, makro seriler yarım saatte bir
tazelenir. Sunucu sonuçları önbelleklediği için her ziyaretçi dış API'ye
ayrı istek atmaz.

### Dosya yükleme

Rapor PDF'i, CV ve görseller doğrudan tarayıcıdan Blob'a gider (sunucudan geçmez, bu
yüzden büyük dosyalar sorun olmaz). Sunucu izin verilen klasörü, türü ve boyutu kısıtlar:

| Klasör | Tür | En fazla |
| --- | --- | --- |
| `reports/` | PDF | 25 MB |
| `cv/` | PDF | 10 MB |
| `media/` | PNG, JPG, WEBP, AVIF | 8 MB |

Yüklediğin her dosyanın yanında "Varsayılana dön" düğmesi vardır; basınca kodla gelen
dosyaya geri döner.

### Güvenlik notları

- Oturum, `ADMIN_SESSION_SECRET` ile imzalı bir `httpOnly` çerezde tutulur; 14 gün geçerli.
- Her istekte e-posta yeniden `ADMIN_EMAILS` listesine karşı kontrol edilir. Bir
  adresi listeden çıkarırsan o kişinin mevcut çerezi de anında geçersiz olur.
- Giriş akışı PKCE kullanır ve `state` çerezi ile CSRF'e karşı korunur.
- `/admin` `robots.txt` ile dizinlemeye kapalıdır ve sayfa `noindex` etiketi koyar.
