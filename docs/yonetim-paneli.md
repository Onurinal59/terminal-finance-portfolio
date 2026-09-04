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

### Sekmeler

| Sekme | Ne yapar |
| --- | --- |
| **Raporlar** | Rapor ekle/sil/kopyala, sırala, TR ve EN metinlerini yaz, PDF yükle, taslak veya yayında yap |
| **Metinler** | Sitedeki ~500 yazının tamamı. Ara, değiştir, tek tuşla varsayılana döndür |
| **Görünürlük** | GPA rozeti, CV indirme, panolardaki modüller gibi blokları aç/kapat |
| **Uyarılar** | Rapor kütüphanesindeki "örnek çalışma" kutusu ve site geneli duyuru bandı |
| **Makro** | Gösterge ekle/sil, değerleri ve anlık görüntü tarihini güncelle |
| **Seanslar** | Hangi borsaların listeleneceği (açık/kapalı durumu otomatik hesaplanır) |
| **İzleme listesi** | Panodaki varsayılan sembol listesi ve sırası |

### PDF yükleme

Rapor düzenleyicideki **PDF yükle** düğmesi dosyayı doğrudan tarayıcıdan Blob'a
gönderir (sunucudan geçmez, bu yüzden büyük dosyalar da sorun olmaz). Yalnızca
`application/pdf` ve en fazla 25 MB kabul edilir. Yükleme bittiğinde raporda bir
"PDF" düğmesi belirir; yüklemezsen o düğme hiç çıkmaz.

### Güvenlik notları

- Oturum, `ADMIN_SESSION_SECRET` ile imzalı bir `httpOnly` çerezde tutulur; 14 gün geçerli.
- Her istekte e-posta yeniden `ADMIN_EMAILS` listesine karşı kontrol edilir. Bir
  adresi listeden çıkarırsan o kişinin mevcut çerezi de anında geçersiz olur.
- Giriş akışı PKCE kullanır ve `state` çerezi ile CSRF'e karşı korunur.
- `/admin` `robots.txt` ile dizinlemeye kapalıdır ve sayfa `noindex` etiketi koyar.
