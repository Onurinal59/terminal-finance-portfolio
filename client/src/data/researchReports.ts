import type { Language } from "@/i18n";

/** "ALL" sanal filtre; diğerleri panelde tanımlı kategori kimlikleridir. */
export type ReportCategory = string;

export interface ValuationMetric {
  label: string;
  value: string;
  benchmark?: string;
  isPositive?: boolean;
}

/** Dilden bağımsız alanlar: kimlik, dosya yolu, fiyat hedefleri ve bağlantılar. */
interface ReportBase {
  id: string;
  ticker: string;
  category: ReportCategory;
  recommendationTone: "bullish" | "moat" | "neutral" | "highlight";
  targetPrice?: string;
  currentPrice?: string;
  upsidePotential?: string;
  author: string;
  link: string;
  /** Yönetim panelinden gerçek bir PDF yüklendiğinde dolar; statik verilerde boştur. */
  pdfUrl?: string;
}

/** Dile göre değişen metinler. */
interface ReportCopy {
  title: string;
  subtitle: string;
  categoryLabel: string;
  recommendation: string;
  period: string;
  readTime: string;
  authorTitle: string;
  focus: string;
  executiveSummary: string;
  keyCatalysts: string[];
  valuationMetrics: ValuationMetric[];
  financialDrivers: string[];
  risks: string[];
  analystNote: string;
  methodology: string;
  source: string;
}

export type ResearchReport = ReportBase & ReportCopy;

/**
 * Onur İnal Araştırma Masası - Rapor Veritabanı
 * Yeni rapor eklemek için REPORT_BASE listesine bir kayıt, ardından REPORT_COPY içindeki
 * her dile aynı id ile metin bloğu ekleyin. Raporlar site içinde okunur; ayrı PDF dosyası tutulmaz.
 */
export const REPORT_BASE: ReportBase[] = [
  {
    id: "R-01",
    ticker: "THYAO",
    category: "EQUITY",
    recommendationTone: "bullish",
    targetPrice: "₺465.00",
    currentPrice: "₺312.50",
    upsidePotential: "+48.8%",
    author: "Onur İnal",
    link: "https://measure-moat.vercel.app/#roadmap",
  },
  {
    id: "R-02B",
    ticker: "BIMAS",
    category: "EQUITY",
    recommendationTone: "bullish",
    targetPrice: "₺680.00",
    currentPrice: "₺477.00",
    upsidePotential: "+42.6%",
    author: "Onur İnal",
    link: "https://measure-moat.vercel.app/#roadmap",
  },
  {
    id: "R-02C",
    ticker: "TUPRS",
    category: "EQUITY",
    recommendationTone: "bullish",
    targetPrice: "₺235.00",
    currentPrice: "₺172.00",
    upsidePotential: "+36.6%",
    author: "Onur İnal",
    link: "https://measure-moat.vercel.app/#roadmap",
  },
  {
    id: "R-02",
    ticker: "MOAT-BIST",
    category: "MOAT",
    recommendationTone: "moat",
    author: "Onur İnal",
    link: "https://measure-moat.vercel.app/#roadmap",
  },
  {
    id: "R-03",
    ticker: "FROTO",
    category: "EQUITY",
    recommendationTone: "bullish",
    targetPrice: "₺1,420.00",
    currentPrice: "₺1,010.00",
    upsidePotential: "+40.6%",
    author: "Onur İnal",
    link: "https://measure-moat.vercel.app/#roadmap",
  },
  {
    id: "R-04",
    ticker: "TMS-29",
    category: "MACRO",
    recommendationTone: "highlight",
    author: "Onur İnal",
    link: "https://measure-moat.vercel.app/#roadmap",
  },
  {
    id: "R-05",
    ticker: "PGSUS",
    category: "SECTOR",
    recommendationTone: "bullish",
    targetPrice: "₺340.00",
    currentPrice: "₺242.00",
    upsidePotential: "+40.5%",
    author: "Onur İnal",
    link: "https://measure-moat.vercel.app/#roadmap",
  },
];

export const REPORT_COPY: Record<Language, Record<string, ReportCopy>> = {
  tr: {
    "R-01": {
      title: "Türk Hava Yolları (THYAO): Küresel Filo Hamlesi, Kargo Katkısı ve CASK/RASK Dinamikleri",
      subtitle:
        "Küresel rakiplere kıyasla birim maliyet avantajı, genişleyen transit koridoru ve filonun nakit yaratma kabiliyeti.",
      categoryLabel: "HİSSE DEĞERLEME",
      recommendation: "AL / ENDEKS ÜSTÜ GETİRİ",
      period: "2025 / 2026 PROJEKSİYON",
      readTime: "8 dk detaylı okuma",
      authorTitle: "Finansal Analist",
      focus:
        "THYAO'nun 800+ uçaklık 2033 filo vizyonu, İstanbul Havalimanı hub gücü, kargo gelirlerinin (Turkish Cargo) marj katkısı ve küresel havayollarına kıyasla belirgin F/K ve FD/FAVÖK iskontosu.",
      executiveSummary:
        "Türk Hava Yolları, coğrafi aktarma üstünlüğü ve yeni nesil yakıt tasarruflu filo yatırımlarıyla küresel network taşıyıcıları (Lufthansa, Air France-KLM, IAG) arasında en düşük birim maliyet (CASK ex-fuel) yapısına sahip şirketlerden biri olmaya devam etmektedir. 2024 ve 2025 projeksiyonlarımızda, yolcu doluluk oranlarının %83 üzerinde dengelenmesi ve yüksek katma değerli kargo hacminin devamı ile operasyonel nakit akışının güçlü kalacağını hesaplıyoruz. Şirketin mevcut çarpanları (F/K ~4.5x, FD/FAVÖK ~3.8x) tarihsel ortalamalarına ve küresel emsallerine göre %35+ iskontoludur.",
      keyCatalysts: [
        "Yeni Nesil Geniş Gövde Teslimatları: A350 ve 787 filosuyla birim koltuk başına yakıt tüketiminde %15-18 operasyonel tasarruf.",
        "Turkish Cargo Pazar Payı: Dünyanın en büyük ilk 3 hava kargo taşıyıcısından biri olma hedefi doğrultusunda yüksek FAVÖK marjı desteği.",
        "AJet Bağımsız Yapılanması: Düşük maliyetli taşıyıcı (LCC) pazarında maliyet optimizasyonu ve yan gelir penetrasyonunun artması.",
        "Turizm & Transit Yolcu Çarpanı: Türkiye gelen yabancı ziyaretçi ivmesi ve doğu-batı transit transfer trafiğinde pazar payı kazanımı.",
      ],
      valuationMetrics: [
        { label: "Hedef Fiyat", value: "₺465.00", benchmark: "Konsensüs: ₺430", isPositive: true },
        { label: "Potansiyel Getiri", value: "+48.8%", benchmark: "12 Aylık", isPositive: true },
        { label: "Tahmini F/K (2025T)", value: "4.6x", benchmark: "Global Emsal: 7.8x", isPositive: true },
        { label: "FD / FAVÖK", value: "3.9x", benchmark: "Sektör: 5.5x", isPositive: true },
        { label: "Serbest Nakit Akımı Verimi", value: "%14.2", benchmark: "Güçlü Nakit Girişi", isPositive: true },
        { label: "ROIC vs. WACC", value: "%18.4 / %13.5", benchmark: "+4.9% Net Spread", isPositive: true },
      ],
      financialDrivers: [
        "Koltuk Kilometre Başına Gelir (RASK) seyrinin güçlü kurlarla döviz bazlı gelir koruması sağlaması.",
        "Jet yakıtı crack spread risklerine karşı uygulanan türev koruma (hedging) stratejisinin maliyet oynaklığını sınırlaması.",
        "Net Borç / FAVÖK oranının 1.2x seviyesinde muhafaza edilerek güçlü bilanço esnekliğinin korunması.",
      ],
      risks: [
        "Küresel jeopolitik gerilimler ve hava sahası kısıtlamalarının rotalarda ek uçuş süresi ve yakıt maliyeti oluşturması.",
        "Uçak üreticilerinde (Boeing/Airbus) yaşanan teslimat gecikmeleri ve motor bakım (GTF) bekleme süreleri.",
        "Küresel tüketici harcamalarında olası daralma ve havacılık talebinde mevsimsel baskı.",
      ],
      analystNote:
        "Değerlememizde %60 ağırlıklı İndirgenmiş Nakit Akımları (DCF) ve %40 ağırlıklı Uluslararası Çarpan Analizi hibrit modeli kullanılmıştır. THYAO hisseleri, bilanço dayanıklılığı ve nakit akım gücü dikkate alındığında mevcut fiyat seviyelerinde cazip bir risk/getiri profili sunmaktadır.",
      methodology: "DCF (%60 Ağırlık) + Emsal Çarpanlar (%40 Ağırlık), WACC: %13.5 (USD Bazlı), Uç Değer Büyüme: %2.5",
      source: "Onur İnal Araştırma Masası & Measure Moat",
    },
    "R-02B": {
      title: "BİM Mağazalar (BIMAS): Enflasyon Kalkanı, Negatif İşletme Sermayesi ve File Formatı",
      subtitle:
        "Yüksek nakit dönüşüm hızı, özel markalı (private label) ürün penetrasyonu ve süpermarket segmentinde File büyümesi.",
      categoryLabel: "HİSSE DEĞERLEME",
      recommendation: "AL / ENDEKS ÜSTÜ GETİRİ",
      period: "2025 / 2026 PROJEKSİYON",
      readTime: "8 dk detaylı okuma",
      authorTitle: "Finansal Analist",
      focus:
        "BİM'in 12.000+ mağazalık lojistik ağı, negatif net işletme sermayesi ile tedarikçi finansmanı gücü, yüksek serbest nakit akımı (FCF) ve enflasyona karşı defansif nakit yaratma kabiliyeti.",
      executiveSummary:
        "BİM Birleşik Mağazalar, Türkiye gıda perakende pazarında pazar payı liderliğini korurken, enflasyonist baskılara karşı en dayanıklı perakende iş modelini temsil etmektedir. Tedarikçilerden ortalama 60-70 gün vade alırken envanterini ortalama 22 günde nakde çeviren şirket, negatif net işletme sermayesi sayesinde operasyonel büyümesini dış finansmana ihtiyaç duymadan özkaynak ve tedarikçi kredisiyle finanse etmektedir. Yeni nesil süpermarket konsepti 'File' mağazalarının metrekare başına cirosunun klasik formata göre %60 daha yüksek olması, şirketin marj genişlemesini desteklemektedir.",
      keyCatalysts: [
        "Negatif İşletme Sermayesi Avantajı: Yüksek faiz ortamında sıfır kısa vadeli finansal borç ile faiz gideri yükünden tamamen muafiyet.",
        "File Formatı Büyümesi: Yüksek gelir grubu segmentine hitap eden File mağazalarında taze gıda ve unlu mamul katkısıyla %26+ brüt marj.",
        "Private Label (Özel Marka) Gücü: Cironun %65'inden fazlasını oluşturan özel markalı ürünlerle fiyat esnekliği ve tüketici sadakati.",
        "Fas ve Mısır İştirakleri: Yurt dışı mağaza ağında operasyonel başabaş noktasının aşılması ve döviz bazlı ciro çeşitliliği.",
      ],
      valuationMetrics: [
        { label: "Hedef Fiyat", value: "₺680.00", benchmark: "Konsensüs: ₺620.00", isPositive: true },
        { label: "Potansiyel Getiri", value: "+42.6%", benchmark: "12 Aylık Hedef", isPositive: true },
        { label: "Tahmini F/K (2025T)", value: "11.2x", benchmark: "Gelişmekte Olan Perakende: 14.8x", isPositive: true },
        { label: "FD / FAVÖK", value: "6.8x", benchmark: "Sektör: 8.4x", isPositive: true },
        { label: "Yatırılan Sermaye Getirisi (ROIC)", value: "%34.2", benchmark: "WACC: %16.0 (Spread +18.2%)", isPositive: true },
        { label: "Yıllık Net Mağaza Açılışı", value: "+750 Adet", benchmark: "Pazar Hakimiyeti", isPositive: true },
      ],
      financialDrivers: [
        "Gıda enflasyonunun üzerinde seyreden sepet büyüklüğü (basket size) ve müşteri trafiği (footfall) artışı.",
        "Merkezi satın alma ve 80+ bölgesel depo ağıyla lojistik maliyetlerin ciroya oranının %4.5 altında tutulması.",
        "Güçlü serbest nakit akımı sayesinde düzenli temettü dağıtımı ve hisse geri alım programı esnekliği.",
      ],
      risks: [
        "Asgari ücret ve personel giderlerindeki artışın faaliyet giderleri (OPEX) üzerinde yaratabileceği baskı.",
        "Rekabet Kurumu ve perakende düzenlemelerinden kaynaklanabilecek idari para cezası ve denetim riskleri.",
        "Tüketici alım gücündeki sert daralmanın harcama kompozisyonunu daha düşük marjlı temel gıdaya kaydırması.",
      ],
      analystNote:
        "BİM, yüksek enflasyon ve dalgalı makroekonomik döngülerde defansif büyüme arayan portföyler için güvenli liman niteliğindedir. %34+ ROIC ve güçlü serbest nakit üretimiyle hedef fiyatımız 680.00 TL olup AL önerimizi yineliyoruz.",
      methodology: "İndirgenmiş Nakit Akımları (DCF) %70 + Emsal Çarpanlar %30, WACC: %16.0, Uç Değer Büyüme: %4.0",
      source: "Onur İnal Araştırma Masası & Perakende Sektör Notu",
    },
    "R-02C": {
      title: "Tüpraş (TUPRS): Akdeniz Rafineri Marjları, ROP2 Yatırımları ve Sıfır Karbon Dönüşümü",
      subtitle:
        "Dizel ve jet yakıtı crack spread gücü, İzmit/İzmir kompleksite katsayısı ve yeşil hidrojen/biyoyakıt yol haritası.",
      categoryLabel: "HİSSE DEĞERLEME",
      recommendation: "AL / ENDEKS ÜSTÜ GETİRİ",
      period: "2025 / 2026 DEĞERLEME",
      readTime: "9 dk detaylı okuma",
      authorTitle: "Finansal Analist",
      focus:
        "Tüpraş'ın Nelson Kompleksite Endeksi (14.5) sayesinde ağır ve yüksek kükürtlü ham petrolleri yüksek marjlı beyaz ürünlere çevirme kabiliyeti, stratejik dönüşüm planı ve temettü verimi.",
      executiveSummary:
        "Tüpraş, 30 milyon tonluk yıllık ham petrol işleme kapasitesi ve yüksek Nelson Kompleksite katsayısı ile Akdeniz havzasının en verimli rafinerilerinden biridir. Küresel enerji piyasalarında dizel ve jet yakıtı crack spread'lerinin tarihsel ortalamaların üzerinde seyretmesi rafineri karlılığını desteklemektedir. Şirketin '2050 Karbon Nötr' stratejisi çerçevesinde başlattığı sürdürülebilir havacılık yakıtı (SAF), yeşil hidrojen ve sıfır karbonlu elektrik yatırımları, uzun vadeli fosil yakıt risklerini dengelemektedir.",
      keyCatalysts: [
        "Ağır Ham Petrol Fiyat Makası: Ağır-hafif ham petrol fiyat farkının Tüpraş lehine açılarak ham petrol tedarik maliyetinde iskonto yaratması.",
        "Entek Elektrik Entegrasyonu: Yenilenebilir enerji portföyünün (rüzgar & güneş) rafinerinin kendi elektrik tüketimini karşılaması ve yeşil hidrojen üretimine zemin hazırlaması.",
        "Sürdürülebilir Havacılık Yakıtı (SAF): 2026 itibariyle devreye girecek biyoyakıt tesisleriyle AB havacılık emisyon kotalarına uyum.",
        "Güçlü Temettü Verimi Geleneği: Yılda iki taksit halinde serbest nakit akımının büyük kısmını temettü olarak dağıtma politikası.",
      ],
      valuationMetrics: [
        { label: "Hedef Fiyat", value: "₺235.00", benchmark: "Cari: ₺172.00", isPositive: true },
        { label: "Potansiyel Getiri", value: "+36.6%", benchmark: "12 Aylık", isPositive: true },
        { label: "Tahmini Net Rafineri Marjı", value: "$8.5 / bbl", benchmark: "Akdeniz Medyanı: $5.8", isPositive: true },
        { label: "Tahmini F/K", value: "5.8x", benchmark: "Global Emsaller: 7.5x", isPositive: true },
        { label: "FD / FAVÖK", value: "4.2x", benchmark: "Sektör: 5.8x", isPositive: true },
        { label: "Tahmini Temettü Verimi", value: "%9.4", benchmark: "BIST Lideri", isPositive: true },
      ],
      financialDrivers: [
        "Beyaz ürün veriminin %82 seviyesinde tutularak yüksek katma değerli ürün kompozisyonunun korunması.",
        "Döviz bazlı ürün fiyatlaması sayesinde kurlardaki hareketlere karşı doğal enflasyon ve devalüasyon koruması.",
        "Net Nakit Pozisyonu: Güçlü bilanço yapısı ile negatif net borç / FAVÖK çarpanı.",
      ],
      risks: [
        "Küresel petrol talebinde yavaşlama veya OPEC+ üretim kotalarının rafineri ham petrol maliyetini yükseltmesi.",
        "Planlı periyodik rafineri bakımları sırasında yaşanabilecek kapasite kullanım kaybı.",
        "Gelecek regülasyonların karbon vergisi maliyetlerini artırması riski.",
      ],
      analystNote:
        "Tüpraş hem anlık yüksek temettü verimi arayan hem de yeşil hidrojen dönüşümü ile geleceğe hazırlanan sanayi devidir. Hedef fiyatımız 235.00 TL olup Endeks Üstü Getiri önerimizi sürdürüyoruz.",
      methodology: "DCF (%60) + Rafineri Emsal Çarpanları (%40), Brent Referans: $78, WACC: %15.2",
      source: "Onur İnal Enerji Araştırma Masası",
    },
    "R-02": {
      title: "BIST Şirketlerinde Ekonomik Hendek (Moat) ve Sermaye Getirisi (ROIC) Analizi",
      subtitle:
        "Sürdürülebilir rekabet avantajına sahip şirketlerin sermaye maliyeti üzerindeki getirileri ve FCF kalitesi.",
      categoryLabel: "EKONOMİK HENDEK",
      recommendation: "GÜÇLÜ HENDEK (WIDE MOAT)",
      period: "2025 / GÜNCEL",
      readTime: "10 dk metodolojik inceleme",
      authorTitle: "Finansal Analist",
      focus:
        "Maddi olmayan duran varlıklar, geçiş maliyetleri (switching costs), ağ etkisi ve maliyet avantajı ekseninde BIST şirketlerinin ayrıştırılması ve Dupont analizi.",
      executiveSummary:
        "Bir şirketin yüksek kar marjlarına sahip olması tek başına değer yaratmaz; asıl kriter, bu karlılığın sermaye maliyetinin (WACC) üzerinde sürdürülebilir bir getiri (ROIC > WACC) üretip üretmediğidir. Türkiye gibi sermaye maliyetinin volatil olduğu gelişmekte olan piyasalarda, güçlü fiyatlama gücüne (pricing power) ve düşük sermaye yoğunluğuna sahip hendekli şirketler, uzun vadede endeksin getirisini katlayarak bileşik getiri makinesine dönüşmektedir.",
      keyCatalysts: [
        "Fiyatlama Gücü (Pricing Power): Enflasyonist dönemde girdi maliyetlerindeki artışı marj kaybı yaşamadan nihai fiyata yansıtabilme gücü.",
        "Yüksek Sermaye Getirisi (ROIC): Yatırılan sermaye üzerinden en az 5 yıllık dönemde düzenli olarak %20+ ROIC üretilmesi.",
        "Dönüşüm Maliyetleri (Switching Costs): Kurumsal yazılım, entegre lojistik veya kritik ara malı tedarikinde müşteri kopuşunun imkansıza yakın olması.",
        "Ölçek Ekonomisi: Dağıtım kanalı hakimiyeti ve satınalma gücü sayesinde rakiplerin erişemeyeceği marj tavanı.",
      ],
      valuationMetrics: [
        { label: "Ortalama ROIC Spread", value: "+8.6%", benchmark: "ROIC - WACC Farkı", isPositive: true },
        { label: "Nakit Dönüşüm Süresi", value: "-14 Gün", benchmark: "Negatif İşletme Sermayesi", isPositive: true },
        { label: "FCF / Net Kar Oranı", value: "> %95", benchmark: "Yüksek Kazanç Kalitesi", isPositive: true },
        { label: "Bileşik Yıllık Getiri (5Y)", value: "%42.8", benchmark: "BIST 100: %28.4", isPositive: true },
      ],
      financialDrivers: [
        "Dupont 5 faktörlü ayrıştırma modeli ile faaliyet marjı ve aktif devir hızının net kara katkısının ölçülmesi.",
        "Yeniden yatırım oranı (Reinvestment Rate) ile içsel büyüme oranının (Fundamental Growth) doğrulanması.",
        "Maddi olmayan varlık amortismanlarının ve Ar-Ge harcamalarının sermayeleştirilerek gerçek ekonomik karın (EVA) bulunması.",
      ],
      risks: [
        "Sektöre giriş bariyerlerini yıkan yıkıcı teknolojik yenilikler veya regülatif tavan fiyat uygulamaları.",
        "Aşırı sermaye birikimi sonrası yapılan verimsiz ve değer yok edici satın alma (M&A) kararları.",
      ],
      analystNote:
        "Measure Moat çerçevesinde geliştirdiğimiz puanlama matrisi ile BIST 100 şirketleri düzenli olarak taranmakta, hendek skoru 80 ve üzeri olan şirketler portföy stratejimizin çekirdeğini oluşturmaktadır.",
      methodology: "ROIC/WACC Farkı, Dupont 5-Way Decomposition, EVA (Ekonomik Katma Değer), 10 Yıllık Marj Stabilitesi",
      source: "Measure Moat Platformu & Akademik Finans Analizi",
    },
    "R-03": {
      title: "Ford Otosan (FROTO): Craiova Entegrasyonu, Elektrikli Ticari Araç Hamlesi ve İhracat Çarpanı",
      subtitle:
        "Romanya tesisinin tam kapasiteye ulaşması, Courier ve Puma üretiminin ciroya etkisi ve yüksek temettü geleneği.",
      categoryLabel: "HİSSE DEĞERLEME",
      recommendation: "AL / ENDEKS ÜSTÜ GETİRİ",
      period: "2025 / 2026 DEĞERLEME",
      readTime: "7 dk detaylı okuma",
      authorTitle: "Finansal Analist",
      focus:
        "Ford Otosan'ın Avrupa hafif ticari araç liderliği, maliyet artı (cost-plus) ihracat sözleşmeleri koruması ve Craiova fabrikasında üretilen elektrikli Puma/Courier modellerinin birim karlılığı.",
      executiveSummary:
        "Ford Otosan, 'maliyet artı sabit kar' formülüyle çalışan ihracat anlaşmaları sayesinde kur ve hammadde risklerine karşı en korunaklı BIST sanayi devlerinden biridir. Romanya Craiova tesisinin satın alınmasıyla yıllık üretim kapasitesinin 900 bin adede yaklaşması, şirketi Ford'un küresel çapta en büyük ticari araç üretim üssü haline getirmiştir. Elektrikli Courier ve yeni nesil Transit modellerinin devreye girmesiyle 2025 yılı marjlarının tarihi yüksek seviyelerde korunmasını bekliyoruz.",
      keyCatalysts: [
        "Craiova Fabrikası Tam Kapasite: Yeni Courier ve Puma modelleriyle Romanya operasyonunun brüt karlılık artışı.",
        "Cost-Plus İhracat Kalkanı: İhracat kontratlarında hammadde ve enerji enflasyonunun Ford Motor Company tarafından kompanse edilmesi.",
        "Avrupa Elektrikli Ticari Araç Dönüşümü: E-Transit ve hibrit modellerin AB emisyon standartları kapsamında yüksek talep görmesi.",
        "İstikrarlı Temettü Geleneği: Yılda çift temettü politikası ile güçlü nakit temettü verimi.",
      ],
      valuationMetrics: [
        { label: "Hedef Fiyat", value: "₺1,420.00", benchmark: "Cari: ₺1,010.00", isPositive: true },
        { label: "Potansiyel Getiri", value: "+40.6%", benchmark: "12 Aylık", isPositive: true },
        { label: "Tahmini F/K", value: "8.1x", benchmark: "Tarihsel Medyan: 9.8x", isPositive: true },
        { label: "FD / FAVÖK", value: "7.2x", benchmark: "Otomotiv Emsalleri: 8.5x", isPositive: true },
        { label: "Tahmini Temettü Verimi", value: "%6.8", benchmark: "Yüksek Nakit Getirisi", isPositive: true },
        { label: "Özkaynak Karlılığı (ROE)", value: "%42.5", benchmark: "TMS 29 Düzeltilmiş", isPositive: true },
      ],
      financialDrivers: [
        "İhracat payının cironun %80'ini aşmasıyla doğal döviz hedge mekanizması.",
        "Kapasite kullanım oranının %88 üzerinde kalması ve batarya montaj hattı yatırımlarının geri dönüşü.",
        "Yüksek işletme sermayesi yönetimi sayesinde negatif net işletme sermayesi ile çalışma kabiliyeti.",
      ],
      risks: [
        "Avrupa ana ihracat pazarlarında (İngiltere, Almanya, İtalya) ekonomik durgunluk ve hafif ticari araç talebinde yavaşlama.",
        "Batarya teknolojisi tedarik zincirinde hammadde fiyat dalgalanmaları.",
      ],
      analystNote:
        "FROTO için geliştirdiğimiz DCF modelinde risksiz faiz oranı %28 ve uç değer büyüme %4 alınmıştır. Güçlü ihracat teminatı ve yüksek temettü verimi, hisseyi defansif büyüme arayan kurumsal portföyler için birinci tercih yapmaktadır.",
      methodology: "İndirgenmiş Nakit Akımları (DCF) + Temettü İndirgeme Modeli (DDM), WACC: %16.8",
      source: "Onur İnal Değerleme Masası",
    },
    "R-04": {
      title: "Enflasyon Muhasebesi (TMS 29) Çerçevesinde Bilanço ve Karlılık Düzeltmeleri",
      subtitle:
        "Parasal kazanç/kayıp ayrıştırması, vergi etkisi ve düzeltilmiş özkaynak karlılığının (Real ROE) hesaplanması.",
      categoryLabel: "MAKRO & MUHASEBE",
      recommendation: "TEMATİK MAKRO RAPORU",
      period: "2024 / 2025 REHBER",
      readTime: "9 dk metodolojik analiz",
      authorTitle: "Finansal Analist",
      focus:
        "Yüksek enflasyon döneminde şirketlerin finansal tablolarının enflasyondan arındırılması, parasal net pozisyon zararlarının net kara etkisi ve gerçek FCF hesaplama metodolojisi.",
      executiveSummary:
        "TMS 29 uygulaması ile birlikte BIST şirketlerinin raporlanan net kar rakamlarında büyük ayrışmalar yaşanmaktadır. Borçlu ve parasal yükümlülüğü fazla olan şirketler parasal kazanç yazarken; yüksek nakitte kalan ve parasal varlığı yüksek olan şirketler parasal pozisyon kaybı nedeniyle muhasebesel zarar kaydedebilmektedir. Analistler için kritik olan, raporlanan net kara aldanmayıp amortisman düzeltmeleri, ertelenmiş vergi etkileri ve operasyonel nakit akımını izlemektir.",
      keyCatalysts: [
        "Gerçek ROE Hesaplaması: Nominal özkaynak karlılığı yerine enflasyondan arındırılmış reel sermaye getirisinin ölçülmesi.",
        "Duran Varlık Yeniden Değerleme Etkisi: Amortisman giderlerinin artmasıyla vergi matrahının korunması.",
        "İşletme Sermayesi Erozyonu: Parasal varlıkların alım gücünün korunması için gereken ek borçlanma ihtiyacı.",
        "Sektörel Ayrışma: Perakende ve sanayi şirketleri ile holdinglerin TMS 29 duyarlılık karşılaştırması.",
      ],
      valuationMetrics: [
        { label: "BIST Sanayi Net Kar Düzeltmesi", value: "-%22.4", benchmark: "TMS 29 Etkisi", isPositive: false },
        { label: "Duran Varlık Değerleme Katsayısı", value: "3.4x", benchmark: "Tarihi Maliyet Düzeltmesi", isPositive: true },
        { label: "Operasyonel Nakit Akımı / Net Kar", value: "1.45x", benchmark: "Nakit Odaklı Yaklaşım", isPositive: true },
      ],
      financialDrivers: [
        "Parasal net varlık pozisyonunun negatifte tutulması stratejisinin enflasyon kalkanı sağlaması.",
        "Stok değerleme yöntemlerinde FIFO vs. Ağırlıklı Ortalama etkisinin satılan malın maliyetine (SMM) yansıması.",
      ],
      risks: [
        "Muhasebesel karın erimesi sonucu temettü dağıtılabilir kar matrahında olası yasal kısıtlar.",
        "Vergi kanunları (VUK enflasyon düzeltmesi) ile SPK/TMS 29 arasındaki farkların yarattığı vergi yükleri.",
      ],
      analystNote:
        "Yatırımcılara tavsiyemiz; TMS 29 döneminde hisse seçimini F/K çarpanı yerine FD/FAVÖK ve Serbest Nakit Akımı (FCF) üzerinden yapmalarıdır. Nakit akımı asla yalan söylemez.",
      methodology: "TMS 29 Muhasebe Standartları, Reel Özkaynak Modellemesi, Nakit Akım Normalizasyonu",
      source: "Onur İnal Makro Analiz Masası",
    },
    "R-05": {
      title: "Pegasus Hava Taşımacılığı (PGSUS): Düşük Maliyetli İş Modeli ve Yan Gelir Büyümesi",
      subtitle: "Yeni nesil A321neo filo dönüşümü, yan gelir penetrasyonu ve uluslararası hat açılışları.",
      categoryLabel: "SEKTÖR RAPORU",
      recommendation: "AL / ENDEKS ÜSTÜ GETİRİ",
      period: "2025 / 2026 DEĞERLEME",
      readTime: "7 dk detaylı okuma",
      authorTitle: "Finansal Analist",
      focus:
        "Pegasus'un yolcu başına yan gelir (ancillary revenue) liderliği, filo gençliği sayesinde yakıt ve bakım maliyeti avantajı, Sabiha Gökçen 2. pistinin kapasiteye katkısı.",
      executiveSummary:
        "Pegasus, ultra düşük maliyetli taşıyıcı (ULCC) disiplinini koruyarak Avrupa'nın en yüksek yan gelir oranına sahip havayollarından biri haline gelmiştir. Koltuk başına 239 yolcu kapasiteli A321neo uçaklarının filodaki payının %80'i aşması, şirkete rakipsiz bir koltuk-kilometre maliyet üstünlüğü kazandırmaktadır. Sabiha Gökçen Havalimanı ikinci pistinin devreye girmesiyle artan slot kapasitesi, uluslararası uçuş büyümesini hızlandırmaktadır.",
      keyCatalysts: [
        "A321neo Filo Verimliliği: Eski nesil uçaklara göre %15 daha düşük yakıt tüketimi ve koltuk başına %20 daha düşük birim maliyet.",
        "Yan Gelir Monetizasyonu: Koltuk seçimi, ekstra bagaj ve uçak içi satışlarla yolcu başına 28+ EUR yan gelir başarısı.",
        "Sabiha Gökçen Slot Kapasitesi: 2. pist ile birlikte saatlik iniş-kalkış kapasitesinde %40 genişleme imkanı.",
        "Döviz Bazlı Gelir Koruması: Uluslararası hatların toplam gelir içerisindeki payının %78'e yükselmesi.",
      ],
      valuationMetrics: [
        { label: "Hedef Fiyat", value: "₺340.00", benchmark: "Cari: ₺242.00", isPositive: true },
        { label: "Potansiyel Getiri", value: "+40.5%", benchmark: "12 Aylık", isPositive: true },
        { label: "Tahmini F/K", value: "5.4x", benchmark: "Avrupa LCC: 8.2x", isPositive: true },
        { label: "FD / FAVÖK", value: "4.8x", benchmark: "Ryanair/Wizz: 6.5x", isPositive: true },
        { label: "Yolcu Başına Yan Gelir", value: "€28.4", benchmark: "Yıllık +%14 Artış", isPositive: true },
      ],
      financialDrivers: [
        "Düşük yakıt dışı CASK sayesinde bilet fiyatlarında esneklik ve yüksek doluluk oranı (%86+).",
        "Güçlü nakit yaratımıyla filonun finansal kiralama borçlarının rahatlıkla itfa edilmesi.",
      ],
      risks: [
        "Bölgemizdeki hava sahası kapanışları ve Orta Doğu transit talebinde dönemsel çekilmeler.",
        "Pratt & Whitney motor muayenelerinin bazı uçaklarda operasyonel kısıt yaratma riski.",
      ],
      analystNote:
        "Pegasus'un maliyet disiplini ve çevik filo yönetimi, döngüsel havacılık sektöründe onu en dirençli oyunculardan biri yapmaktadır. Hisse için hedef fiyatımız 340.00 TL olup Endeks Üstü Getiri önerimizi koruyoruz.",
      methodology: "İndirgenmiş Nakit Akımları (DCF) %65 + Çarpan Analizi %35",
      source: "Onur İnal Araştırma Masası",
    },
  },
  en: {
    "R-01": {
      title: "Turkish Airlines (THYAO): Global Fleet Push, Cargo Contribution and CASK/RASK Dynamics",
      subtitle:
        "Unit cost advantage versus global peers, an expanding transit corridor and the fleet's cash generation capacity.",
      categoryLabel: "EQUITY VALUATION",
      recommendation: "BUY / OUTPERFORM",
      period: "2025 / 2026 PROJECTION",
      readTime: "8 min detailed read",
      authorTitle: "Financial Analyst",
      focus:
        "THYAO's 800+ aircraft 2033 fleet vision, the Istanbul Airport hub advantage, the margin contribution of cargo revenue (Turkish Cargo) and a clear P/E and EV/EBITDA discount versus global airlines.",
      executiveSummary:
        "Turkish Airlines remains one of the lowest unit cost (CASK ex-fuel) carriers among global network airlines (Lufthansa, Air France-KLM, IAG), thanks to its geographic transfer advantage and investment in a new generation of fuel-efficient aircraft. In our 2024 and 2025 projections we expect operating cash flow to stay strong, with load factors settling above 83% and high value-added cargo volumes continuing. Current multiples (P/E ~4.5x, EV/EBITDA ~3.8x) trade at a 35%+ discount to both historical averages and global peers.",
      keyCatalysts: [
        "Next-generation widebody deliveries: 15-18% operational fuel savings per seat with the A350 and 787 fleet.",
        "Turkish Cargo market share: strong EBITDA margin support as it targets a place among the world's three largest air cargo carriers.",
        "AJet standalone structure: cost optimisation and rising ancillary revenue penetration in the low-cost carrier market.",
        "Tourism & transit passenger multiplier: momentum in inbound visitors to Türkiye and market share gains in east-west transfer traffic.",
      ],
      valuationMetrics: [
        { label: "Target price", value: "₺465.00", benchmark: "Consensus: ₺430", isPositive: true },
        { label: "Upside potential", value: "+48.8%", benchmark: "12 months", isPositive: true },
        { label: "Estimated P/E (2025E)", value: "4.6x", benchmark: "Global peers: 7.8x", isPositive: true },
        { label: "EV / EBITDA", value: "3.9x", benchmark: "Sector: 5.5x", isPositive: true },
        { label: "Free cash flow yield", value: "14.2%", benchmark: "Strong cash inflow", isPositive: true },
        { label: "ROIC vs. WACC", value: "18.4% / 13.5%", benchmark: "+4.9% net spread", isPositive: true },
      ],
      financialDrivers: [
        "Revenue per available seat kilometre (RASK) benefiting from FX-based revenue protection in a strong currency environment.",
        "A derivative hedging strategy against jet fuel crack spread risk that limits cost volatility.",
        "Net debt / EBITDA held around 1.2x, preserving strong balance sheet flexibility.",
      ],
      risks: [
        "Global geopolitical tension and airspace restrictions adding flight time and fuel cost on key routes.",
        "Delivery delays at aircraft manufacturers (Boeing/Airbus) and GTF engine maintenance waiting times.",
        "A possible contraction in global consumer spending and seasonal pressure on air travel demand.",
      ],
      analystNote:
        "Our valuation uses a hybrid model of 60% discounted cash flow (DCF) and 40% international multiples analysis. Given balance sheet resilience and cash flow strength, THYAO offers an attractive risk/reward profile at current price levels.",
      methodology: "DCF (60% weight) + peer multiples (40% weight), WACC: 13.5% (USD based), terminal growth: 2.5%",
      source: "Onur İnal Research Desk & Measure Moat",
    },
    "R-02B": {
      title: "BİM Stores (BIMAS): Inflation Shield, Negative Working Capital and the File Format",
      subtitle:
        "Fast cash conversion, private label penetration and File growth in the supermarket segment.",
      categoryLabel: "EQUITY VALUATION",
      recommendation: "BUY / OUTPERFORM",
      period: "2025 / 2026 PROJECTION",
      readTime: "8 min detailed read",
      authorTitle: "Financial Analyst",
      focus:
        "BİM's 12,000+ store logistics network, supplier financing strength from negative net working capital, high free cash flow and defensive cash generation against inflation.",
      executiveSummary:
        "BİM keeps its market share leadership in Turkish food retail while running the most resilient retail model against inflationary pressure. Taking an average of 60-70 days of payment terms from suppliers while converting inventory to cash in about 22 days, negative net working capital lets the company fund operational growth from equity and supplier credit rather than external financing. Revenue per square metre at the new-generation 'File' supermarket format is around 60% higher than the classic format, supporting margin expansion.",
      keyCatalysts: [
        "Negative working capital advantage: zero short-term financial debt means no interest expense burden in a high rate environment.",
        "File format growth: 26%+ gross margin at File stores serving higher income segments, helped by fresh food and bakery.",
        "Private label strength: pricing flexibility and consumer loyalty from own-brand products making up over 65% of revenue.",
        "Morocco and Egypt subsidiaries: passing operational break-even abroad and adding FX-based revenue diversity.",
      ],
      valuationMetrics: [
        { label: "Target price", value: "₺680.00", benchmark: "Consensus: ₺620.00", isPositive: true },
        { label: "Upside potential", value: "+42.6%", benchmark: "12-month target", isPositive: true },
        { label: "Estimated P/E (2025E)", value: "11.2x", benchmark: "EM retail: 14.8x", isPositive: true },
        { label: "EV / EBITDA", value: "6.8x", benchmark: "Sector: 8.4x", isPositive: true },
        { label: "Return on invested capital (ROIC)", value: "34.2%", benchmark: "WACC: 16.0% (spread +18.2%)", isPositive: true },
        { label: "Annual net store openings", value: "+750 stores", benchmark: "Market dominance", isPositive: true },
      ],
      financialDrivers: [
        "Basket size and footfall growth running above food inflation.",
        "Central purchasing and an 80+ regional warehouse network keeping logistics costs below 4.5% of revenue.",
        "Strong free cash flow supporting regular dividends and share buyback flexibility.",
      ],
      risks: [
        "Pressure on operating expenses (OPEX) from minimum wage and personnel cost increases.",
        "Administrative fines and audit risk from the Competition Authority and retail regulation.",
        "A sharp fall in consumer purchasing power shifting the basket toward lower margin staples.",
      ],
      analystNote:
        "BİM is a safe haven for portfolios seeking defensive growth through high inflation and volatile macro cycles. With 34%+ ROIC and strong free cash generation our target price is ₺680.00 and we reiterate our BUY rating.",
      methodology: "Discounted cash flow (DCF) 70% + peer multiples 30%, WACC: 16.0%, terminal growth: 4.0%",
      source: "Onur İnal Research Desk & Retail Sector Note",
    },
    "R-02C": {
      title: "Tüpraş (TUPRS): Mediterranean Refining Margins, ROP2 Investments and Net Zero Transition",
      subtitle:
        "Diesel and jet fuel crack spread strength, İzmit/İzmir complexity factor and the green hydrogen / biofuel roadmap.",
      categoryLabel: "EQUITY VALUATION",
      recommendation: "BUY / OUTPERFORM",
      period: "2025 / 2026 VALUATION",
      readTime: "9 min detailed read",
      authorTitle: "Financial Analyst",
      focus:
        "Tüpraş's ability to convert heavy, high-sulphur crude into high margin white products thanks to a Nelson Complexity Index of 14.5, its strategic transition plan and dividend yield.",
      executiveSummary:
        "With 30 million tonnes of annual crude processing capacity and a high Nelson complexity factor, Tüpraş is one of the most efficient refineries in the Mediterranean basin. Diesel and jet fuel crack spreads running above historical averages in global energy markets continue to support refining profitability. Sustainable aviation fuel (SAF), green hydrogen and zero-carbon electricity investments launched under the company's '2050 Carbon Neutral' strategy balance long-term fossil fuel risk.",
      keyCatalysts: [
        "Heavy crude price spread: a widening heavy-light crude differential in Tüpraş's favour creates a discount on crude supply cost.",
        "Entek electricity integration: a renewable portfolio (wind & solar) covering the refinery's own power use and laying the ground for green hydrogen.",
        "Sustainable aviation fuel (SAF): compliance with EU aviation emission quotas via biofuel facilities coming online from 2026.",
        "Strong dividend tradition: a policy of distributing most free cash flow as dividends in two instalments a year.",
      ],
      valuationMetrics: [
        { label: "Target price", value: "₺235.00", benchmark: "Current: ₺172.00", isPositive: true },
        { label: "Upside potential", value: "+36.6%", benchmark: "12 months", isPositive: true },
        { label: "Estimated net refining margin", value: "$8.5 / bbl", benchmark: "Mediterranean median: $5.8", isPositive: true },
        { label: "Estimated P/E", value: "5.8x", benchmark: "Global peers: 7.5x", isPositive: true },
        { label: "EV / EBITDA", value: "4.2x", benchmark: "Sector: 5.8x", isPositive: true },
        { label: "Estimated dividend yield", value: "9.4%", benchmark: "BIST leader", isPositive: true },
      ],
      financialDrivers: [
        "White product yield held around 82%, preserving a high value-added product mix.",
        "FX-based product pricing providing a natural hedge against inflation and devaluation.",
        "Net cash position: a strong balance sheet with a negative net debt / EBITDA multiple.",
      ],
      risks: [
        "A slowdown in global oil demand, or OPEC+ production quotas raising refinery crude costs.",
        "Capacity utilisation loss during scheduled periodic refinery maintenance.",
        "The risk that future regulation raises carbon tax costs.",
      ],
      analystNote:
        "Tüpraş is an industrial heavyweight offering both an immediate high dividend yield and a future-facing green hydrogen transition. Our target price is ₺235.00 and we maintain our Outperform rating.",
      methodology: "DCF (60%) + refining peer multiples (40%), Brent reference: $78, WACC: 15.2%",
      source: "Onur İnal Energy Research Desk",
    },
    "R-02": {
      title: "Economic Moat and Return on Invested Capital (ROIC) Analysis of BIST Companies",
      subtitle:
        "Returns above the cost of capital and free cash flow quality for companies with a sustainable competitive advantage.",
      categoryLabel: "ECONOMIC MOAT",
      recommendation: "WIDE MOAT",
      period: "2025 / CURRENT",
      readTime: "10 min methodology review",
      authorTitle: "Financial Analyst",
      focus:
        "Separating BIST companies along intangible assets, switching costs, network effects and cost advantage, together with DuPont analysis.",
      executiveSummary:
        "High profit margins alone do not create value; what matters is whether that profitability produces a sustainable return above the cost of capital (ROIC > WACC). In emerging markets like Türkiye, where the cost of capital is volatile, moat companies with strong pricing power and low capital intensity compound returns well above the index over the long run.",
      keyCatalysts: [
        "Pricing power: the ability to pass rising input costs through to final prices without losing margin during inflationary periods.",
        "High return on invested capital (ROIC): consistently producing 20%+ ROIC over at least a five-year period.",
        "Switching costs: customer churn being close to impossible in enterprise software, integrated logistics or critical intermediate goods supply.",
        "Economies of scale: a margin ceiling rivals cannot reach thanks to distribution channel dominance and purchasing power.",
      ],
      valuationMetrics: [
        { label: "Average ROIC spread", value: "+8.6%", benchmark: "ROIC - WACC difference", isPositive: true },
        { label: "Cash conversion cycle", value: "-14 days", benchmark: "Negative working capital", isPositive: true },
        { label: "FCF / net income ratio", value: "> 95%", benchmark: "High earnings quality", isPositive: true },
        { label: "Compound annual return (5Y)", value: "42.8%", benchmark: "BIST 100: 28.4%", isPositive: true },
      ],
      financialDrivers: [
        "Measuring the contribution of operating margin and asset turnover to net income with a five-factor DuPont decomposition.",
        "Validating fundamental growth through the reinvestment rate.",
        "Finding true economic profit (EVA) by capitalising intangible amortisation and R&D spending.",
      ],
      risks: [
        "Disruptive technology that tears down entry barriers, or regulatory price caps.",
        "Inefficient, value-destroying M&A decisions after excessive capital accumulation.",
      ],
      analystNote:
        "The scoring matrix we developed within the Measure Moat framework screens BIST 100 companies regularly; companies with a moat score of 80 or above form the core of our portfolio strategy.",
      methodology: "ROIC/WACC spread, DuPont 5-way decomposition, EVA (economic value added), 10-year margin stability",
      source: "Measure Moat Platform & Academic Finance Analysis",
    },
    "R-03": {
      title: "Ford Otosan (FROTO): Craiova Integration, the Electric LCV Push and the Export Multiplier",
      subtitle:
        "The Romanian plant reaching full capacity, the revenue impact of Courier and Puma production, and a strong dividend tradition.",
      categoryLabel: "EQUITY VALUATION",
      recommendation: "BUY / OUTPERFORM",
      period: "2025 / 2026 VALUATION",
      readTime: "7 min detailed read",
      authorTitle: "Financial Analyst",
      focus:
        "Ford Otosan's leadership in European light commercial vehicles, the protection of cost-plus export contracts and the unit profitability of electric Puma/Courier models built in Craiova.",
      executiveSummary:
        "Thanks to export agreements based on a 'cost plus fixed profit' formula, Ford Otosan is one of the BIST industrial heavyweights best insulated from currency and raw material risk. The acquisition of the Craiova plant in Romania lifted annual production capacity toward 900 thousand units, making the company Ford's largest commercial vehicle production base globally. With the electric Courier and next-generation Transit ramping up, we expect 2025 margins to hold near historical highs.",
      keyCatalysts: [
        "Craiova plant at full capacity: gross profitability gains in the Romanian operation from the new Courier and Puma models.",
        "Cost-plus export shield: raw material and energy inflation compensated by Ford Motor Company under export contracts.",
        "European electric LCV transition: strong demand for E-Transit and hybrid models under EU emission standards.",
        "Consistent dividend tradition: a twice-yearly dividend policy delivering a strong cash yield.",
      ],
      valuationMetrics: [
        { label: "Target price", value: "₺1,420.00", benchmark: "Current: ₺1,010.00", isPositive: true },
        { label: "Upside potential", value: "+40.6%", benchmark: "12 months", isPositive: true },
        { label: "Estimated P/E", value: "8.1x", benchmark: "Historical median: 9.8x", isPositive: true },
        { label: "EV / EBITDA", value: "7.2x", benchmark: "Auto peers: 8.5x", isPositive: true },
        { label: "Estimated dividend yield", value: "6.8%", benchmark: "High cash return", isPositive: true },
        { label: "Return on equity (ROE)", value: "42.5%", benchmark: "IAS 29 adjusted", isPositive: true },
      ],
      financialDrivers: [
        "A natural FX hedge as exports exceed 80% of revenue.",
        "Capacity utilisation staying above 88% and the payback on battery assembly line investment.",
        "The ability to operate with negative net working capital thanks to strong working capital management.",
      ],
      risks: [
        "Economic slowdown in core European export markets (UK, Germany, Italy) and softer light commercial vehicle demand.",
        "Raw material price swings in the battery technology supply chain.",
      ],
      analystNote:
        "Our FROTO DCF model assumes a 28% risk-free rate and 4% terminal growth. Secure export contracts and a high dividend yield make the stock a first choice for institutional portfolios seeking defensive growth.",
      methodology: "Discounted cash flow (DCF) + dividend discount model (DDM), WACC: 16.8%",
      source: "Onur İnal Valuation Desk",
    },
    "R-04": {
      title: "Balance Sheet and Profitability Adjustments under Inflation Accounting (IAS 29)",
      subtitle:
        "Separating monetary gains/losses, the tax effect and calculating adjusted return on equity (real ROE).",
      categoryLabel: "MACRO & ACCOUNTING",
      recommendation: "THEMATIC MACRO REPORT",
      period: "2024 / 2025 GUIDE",
      readTime: "9 min methodology analysis",
      authorTitle: "Financial Analyst",
      focus:
        "Restating company financials for inflation in a high inflation period, the impact of net monetary position losses on net income and the methodology for calculating true free cash flow.",
      executiveSummary:
        "IAS 29 has driven wide divergence in the reported net income of BIST companies. Companies carrying debt and a surplus of monetary liabilities book monetary gains, while those holding large cash balances and monetary assets can record an accounting loss from a monetary position loss. For analysts the key is not to be misled by reported net income but to track depreciation adjustments, deferred tax effects and operating cash flow.",
      keyCatalysts: [
        "Real ROE calculation: measuring inflation-adjusted real return on capital instead of nominal return on equity.",
        "Fixed asset revaluation effect: preserving the tax base as depreciation expense rises.",
        "Working capital erosion: the extra borrowing needed to preserve the purchasing power of monetary assets.",
        "Sector divergence: comparing the IAS 29 sensitivity of retail and industrial companies against holding companies.",
      ],
      valuationMetrics: [
        { label: "BIST industrials net income adjustment", value: "-22.4%", benchmark: "IAS 29 effect", isPositive: false },
        { label: "Fixed asset revaluation factor", value: "3.4x", benchmark: "Historical cost adjustment", isPositive: true },
        { label: "Operating cash flow / net income", value: "1.45x", benchmark: "Cash-focused approach", isPositive: true },
      ],
      financialDrivers: [
        "Holding a negative net monetary asset position as an inflation shield.",
        "The effect of FIFO versus weighted average inventory valuation on cost of goods sold.",
      ],
      risks: [
        "Possible legal constraints on distributable profit as accounting profit erodes.",
        "Tax burdens created by differences between tax legislation (inflation adjustment) and CMB / IAS 29 rules.",
      ],
      analystNote:
        "Our advice to investors: during the IAS 29 period, pick stocks on EV/EBITDA and free cash flow (FCF) rather than the P/E multiple. Cash flow never lies.",
      methodology: "IAS 29 accounting standards, real equity modeling, cash flow normalisation",
      source: "Onur İnal Macro Analysis Desk",
    },
    "R-05": {
      title: "Pegasus Airlines (PGSUS): The Low-Cost Model and Ancillary Revenue Growth",
      subtitle: "The next-generation A321neo fleet transition, ancillary penetration and new international routes.",
      categoryLabel: "SECTOR REPORT",
      recommendation: "BUY / OUTPERFORM",
      period: "2025 / 2026 VALUATION",
      readTime: "7 min detailed read",
      authorTitle: "Financial Analyst",
      focus:
        "Pegasus's leadership in ancillary revenue per passenger, its fuel and maintenance cost advantage from a young fleet, and the capacity contribution of Sabiha Gökçen's second runway.",
      executiveSummary:
        "By maintaining ultra low-cost carrier (ULCC) discipline, Pegasus has become one of Europe's airlines with the highest ancillary revenue ratio. With A321neo aircraft seating 239 passengers now above 80% of the fleet, the company holds an unmatched cost per available seat kilometre advantage. Rising slot capacity from the second runway at Sabiha Gökçen Airport is accelerating international flight growth.",
      keyCatalysts: [
        "A321neo fleet efficiency: 15% lower fuel burn than the previous generation and 20% lower unit cost per seat.",
        "Ancillary monetisation: 28+ EUR of ancillary revenue per passenger from seat selection, extra baggage and onboard sales.",
        "Sabiha Gökçen slot capacity: room for 40% expansion in hourly landing/take-off capacity with the second runway.",
        "FX-based revenue protection: international routes rising to 78% of total revenue.",
      ],
      valuationMetrics: [
        { label: "Target price", value: "₺340.00", benchmark: "Current: ₺242.00", isPositive: true },
        { label: "Upside potential", value: "+40.5%", benchmark: "12 months", isPositive: true },
        { label: "Estimated P/E", value: "5.4x", benchmark: "European LCC: 8.2x", isPositive: true },
        { label: "EV / EBITDA", value: "4.8x", benchmark: "Ryanair/Wizz: 6.5x", isPositive: true },
        { label: "Ancillary revenue per passenger", value: "€28.4", benchmark: "+14% year on year", isPositive: true },
      ],
      financialDrivers: [
        "Pricing flexibility and a high load factor (86%+) thanks to low ex-fuel CASK.",
        "Strong cash generation comfortably amortising the fleet's finance lease obligations.",
      ],
      risks: [
        "Airspace closures in the region and periodic pullbacks in Middle East transit demand.",
        "The risk that Pratt & Whitney engine inspections create operational constraints on part of the fleet.",
      ],
      analystNote:
        "Pegasus's cost discipline and agile fleet management make it one of the most resilient players in a cyclical aviation sector. Our target price is ₺340.00 and we maintain our Outperform rating.",
      methodology: "Discounted cash flow (DCF) 65% + multiples analysis 35%",
      source: "Onur İnal Research Desk",
    },
  },
};

/** Seçili dile göre birleştirilmiş rapor listesi. */
export function getResearchReports(language: Language): ResearchReport[] {
  return REPORT_BASE.map((base) => ({ ...base, ...REPORT_COPY[language][base.id] }));
}
