# Yönetim Paneli Kurulumu

Panel `https://onurinal.vercel.app/admin` adresinde. Çalışması için biri Google'da,
biri Vercel'de olmak üzere iki kurulum gerekiyor. Toplam ~10 dakika.

---

## 1. Google ile giriş

### 1.1 OAuth istemcisi oluştur

1. [Google Cloud Console](https://console.cloud.google.com/) → sağ üstten yeni bir proje
   oluştur (örn. `onurinal-portfolio`).
2. Sol menü → **APIs & Services → OAuth consent screen**
   - User Type: **External**
   - Uygulama adı: `Onur İnal Yönetim Paneli`, destek e-postası: kendi adresin
   - Kaydet. **Test users** bölümüne kendi Gmail adresini ekle.
   - Uygulamayı yayımlamana gerek yok; test modunda kendi hesabınla girebilirsin.
3. Sol menü → **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `onurinal-admin`
   - **Authorized redirect URIs** kısmına tam olarak şunu ekle:
     ```
     https://onurinal.vercel.app/api/admin/callback
     ```
     (Yerelde de denemek istersen ikinci satır olarak `http://127.0.0.1:3000/api/admin/callback`)
   - Oluştur. Çıkan **Client ID** ve **Client secret** değerlerini kopyala.

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
