export type ReportCategory = "TÜMÜ" | "EQUITY" | "MOAT" | "SECTOR" | "MACRO";

export interface ValuationMetric {
  label: string;
  value: string;
  benchmark?: string;
  isPositive?: boolean;
}

export interface ResearchReport {
  id: string;
  ticker: string;
  title: string;
  subtitle: string;
  category: "EQUITY" | "MOAT" | "SECTOR" | "MACRO";
  categoryLabel: string;
  recommendation: "AL / ENDEKS ÜSTÜ GETİRİ" | "GÜÇLÜ HENDEK (WIDE MOAT)" | "SEKTÖR TERCİHİ" | "TEMATİK MAKRO RAPORU";
  recommendationTone: "bullish" | "moat" | "neutral" | "highlight";
  targetPrice?: string;
  currentPrice?: string;
  upsidePotential?: string;
  period: string;
  readTime: string;
  author: string;
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
  link: string;
  pdfUrl: string;
}

/**
 * Onur İnal Araştırma Masası - Rapor Veritabanı
 * Yeni rapor eklemek veya mevcut raporları güncellemek için aşağıdaki listeye yeni nesne ekleyebilirsiniz.
 * PDF dosyalarınızı /client/public/reports/ klasörüne ekleyerek doğrudan açabilirsiniz.
 */
export const researchReportsData: ResearchReport[] = [
  {
    id: "R-01",
    ticker: "THYAO",
    pdfUrl: "/reports/THYAO-Hisse-Degerleme-Raporu-Onur-Inal.pdf",
    title: "Türk Hava Yolları (THYAO): Küresel Filo Hamlesi, Kargo Katkısı ve CASK/RASK Dinamikleri",
    subtitle: "Küresel rakiplere kıyasla birim maliyet avantajı, genişleyen transit koridoru ve filonun nakit yaratma kabiliyeti.",
    category: "EQUITY",
    categoryLabel: "HİSSE DEĞERLEME",
    recommendation: "AL / ENDEKS ÜSTÜ GETİRİ",
    recommendationTone: "bullish",
    targetPrice: "₺465.00",
    currentPrice: "₺312.50",
    upsidePotential: "+48.8%",
    period: "2025 / 2026 PROJEKSİYON",
    readTime: "8 dk detaylı okuma",
    author: "Onur İnal",
    authorTitle: "Finansal Analist",
    focus: "THYAO'nun 800+ uçaklık 2033 filo vizyonu, İstanbul Havalimanı hub gücü, kargo gelirlerinin (Turkish Cargo) marj katkısı ve küresel havayollarına kıyasla belirgin F/K ve FD/FAVÖK iskontosu.",
    executiveSummary:
      "Türk Hava Yolları, coğrafi aktarma üstünlüğü ve yeni nesil yakıt tasarruflu filo yatırımlarıyla küresel network taşıyıcıları (Lufthansa, Air France-KLM, IAG) arasında en düşük birim maliyet (CASK ex-fuel) yapısına sahip şirketlerden biri olmaya devam etmektedir. 2024 ve 2025 projeksiyonlarımızda, yolcu doluluk oranlarının %83 üzerinde dengelenmesi ve yüksek katma değerli kargo hacminin devamı ile operasyonel nakit akışının güçlü kalacağını hesaplıyoruz. Şirketin mevcut çarpanları (F/K ~4.5x, FD/FAVÖK ~3.8x) tarihsel ortalamalarına ve küresel emsallerine göre %35+ iskontoludur.",
    keyCatalysts: [
      "Yeni Nesil Geniş Gövde Teslimatları: A350 ve 787 filosuyla birim koltuk başına yakıt tüketiminde %15-18 operasyonel tasarruf.",
      "Turkish Cargo Pazar Payı: Dünyanın en büyük ilk 3 hava kargo taşıyıcısından biri olma hedefi doğrultusunda yüksek FAVÖK marjı desteği.",
      "AJet Bağımsız Yapılanması: Düşük maliyetli taşıyıcı (LCC) pazarında maliyet optimizasyonu ve yan gelir penetrasyonunun artması.",
      "Turizm & Transit Yolcu Çarpanı: Türkiye gelen yabancı ziyaretçi ivmesi ve doğu-batı transit transfer trafiğinde pazar payı kazanımı."
    ],
    valuationMetrics: [
      { label: "Hedef Fiyat", value: "₺465.00", benchmark: "Konsensüs: ₺430", isPositive: true },
      { label: "Potansiyel Getiri", value: "+48.8%", benchmark: "12 Aylık", isPositive: true },
      { label: "Tahmini F/K (2025T)", value: "4.6x", benchmark: "Global Emsal: 7.8x", isPositive: true },
      { label: "FD / FAVÖK", value: "3.9x", benchmark: "Sektör: 5.5x", isPositive: true },
      { label: "Serbest Nakit Akımı Verimi", value: "%14.2", benchmark: "Güçlü Nakit Girişi", isPositive: true },
      { label: "ROIC vs. WACC", value: "%18.4 / %13.5", benchmark: "+4.9% Net Spread", isPositive: true }
    ],
    financialDrivers: [
      "Koltuk Kilometre Başına Gelir (RASK) seyrinin güçlü kurlarla döviz bazlı gelir koruması sağlaması.",
      "Jet yakıtı crack spread risklerine karşı uygulanan türev koruma (hedging) stratejisinin maliyet oynaklığını sınırlaması.",
      "Net Borç / FAVÖK oranının 1.2x seviyesinde muhafaza edilerek güçlü bilanço esnekliğinin korunması."
    ],
    risks: [
      "Küresel jeopolitik gerilimler ve hava sahası kısıtlamalarının rotalarda ek uçuş süresi ve yakıt maliyeti oluşturması.",
      "Uçak üreticilerinde (Boeing/Airbus) yaşanan teslimat gecikmeleri ve motor bakım (GTF) bekleme süreleri.",
      "Küresel tüketici harcamalarında olası daralma ve havacılık talebinde mevsimsel baskı."
    ],
    analystNote:
      "Değerlememizde %60 ağırlıklı İndirgenmiş Nakit Akımları (DCF) ve %40 ağırlıklı Uluslararası Çarpan Analizi hibrit modeli kullanılmıştır. THYAO hisseleri, bilanço dayanıklılığı ve nakit akım gücü dikkate alındığında mevcut fiyat seviyelerinde cazip bir risk/getiri profili sunmaktadır.",
    methodology: "DCF (%60 Ağırlık) + Emsal Çarpanlar (%40 Ağırlık), WACC: %13.5 (USD Bazlı), Uç Değer Büyüme: %2.5",
    source: "Onur İnal Araştırma Masası & Measure Moat",
    link: "https://measure-moat.vercel.app/#roadmap"
  },
  {
    id: "R-02B",
    ticker: "BIMAS",
    pdfUrl: "/reports/BIMAS-Hisse-Degerleme-Raporu-Onur-Inal.pdf",
    title: "BİM Mağazalar (BIMAS): Enflasyon Kalkanı, Negatif İşletme Sermayesi ve File Formatı",
    subtitle: "Yüksek nakit dönüşüm hızı, özel markalı (private label) ürün penetrasyonu ve süpermarket segmentinde File büyümesi.",
    category: "EQUITY",
    categoryLabel: "HİSSE DEĞERLEME",
    recommendation: "AL / ENDEKS ÜSTÜ GETİRİ",
    recommendationTone: "bullish",
    targetPrice: "₺680.00",
    currentPrice: "₺477.00",
    upsidePotential: "+42.6%",
    period: "2025 / 2026 PROJEKSİYON",
    readTime: "8 dk detaylı okuma",
    author: "Onur İnal",
    authorTitle: "Finansal Analist",
    focus: "BİM'in 12.000+ mağazalık lojistik ağı, negatif net işletme sermayesi ile tedarikçi finansmanı gücü, yüksek serbest nakit akımı (FCF) ve enflasyona karşı defansif nakit yaratma kabiliyeti.",
    executiveSummary:
      "BİM Birleşik Mağazalar, Türkiye gıda perakende pazarında pazar payı liderliğini korurken, enflasyonist baskılara karşı en dayanıklı perakende iş modelini temsil etmektedir. Tedarikçilerden ortalama 60-70 gün vade alırken envanterini ortalama 22 günde nakde çeviren şirket, negatif net işletme sermayesi sayesinde operasyonel büyümesini dış finansmana ihtiyaç duymadan özkaynak ve tedarikçi kredisiyle finanse etmektedir. Yeni nesil süpermarket konsepti 'File' mağazalarının metrekare başına cirosunun klasik formata göre %60 daha yüksek olması, şirketin marj genişlemesini desteklemektedir.",
    keyCatalysts: [
      "Negatif İşletme Sermayesi Avantajı: Yüksek faiz ortamında sıfır kısa vadeli finansal borç ile faiz gideri yükünden tamamen muafiyet.",
      "File Formatı Büyümesi: Yüksek gelir grubu segmentine hitap eden File mağazalarında taze gıda ve unlu mamul katkısıyla %26+ brüt marj.",
      "Private Label (Özel Marka) Gücü: Cironun %65'inden fazlasını oluşturan özel markalı ürünlerle fiyat esnekliği ve tüketici sadakati.",
      "Fas ve Mısır İştirakleri: Yurt dışı mağaza ağında operasyonel başabaş noktasının aşılması ve döviz bazlı ciro çeşitliliği."
    ],
    valuationMetrics: [
      { label: "Hedef Fiyat", value: "₺680.00", benchmark: "Konsensüs: ₺620.00", isPositive: true },
      { label: "Potansiyel Getiri", value: "+42.6%", benchmark: "12 Aylık Hedef", isPositive: true },
      { label: "Tahmini F/K (2025T)", value: "11.2x", benchmark: "Gelişmekte Olan Perakende: 14.8x", isPositive: true },
      { label: "FD / FAVÖK", value: "6.8x", benchmark: "Sektör: 8.4x", isPositive: true },
      { label: "Yatırılan Sermaye Getirisi (ROIC)", value: "%34.2", benchmark: "WACC: %16.0 (Spread +18.2%)", isPositive: true },
      { label: "Yıllık Net Mağaza Açılışı", value: "+750 Adet", benchmark: "Pazar Hakimiyeti", isPositive: true }
    ],
    financialDrivers: [
      "Gıda enflasyonunun üzerinde seyreden sepet büyüklüğü (basket size) ve müşteri trafiği (footfall) artışı.",
      "Merkezi satın alma ve 80+ bölgesel depo ağıyla lojistik maliyetlerin ciroya oranının %4.5 altında tutulması.",
      "Güçlü serbest nakit akımı sayesinde düzenli temettü dağıtımı ve hisse geri alım programı esnekliği."
    ],
    risks: [
      "Asgari ücret ve personel giderlerindeki artışın faaliyet giderleri (OPEX) üzerinde yaratabileceği baskı.",
      "Rekabet Kurumu ve perakende düzenlemelerinden kaynaklanabilecek idari para cezası ve denetim riskleri.",
      "Tüketici alım gücündeki sert daralmanın harcama kompozisyonunu daha düşük marjlı temel gıdaya kaydırması."
    ],
    analystNote:
      "BİM, yüksek enflasyon ve dalgalı makroekonomik döngülerde defansif büyüme arayan portföyler için güvenli liman niteliğindedir. %34+ ROIC ve güçlü serbest nakit üretimiyle hedef fiyatımız 680.00 TL olup AL önerimizi yineliyoruz.",
    methodology: "İndirgenmiş Nakit Akımları (DCF) %70 + Emsal Çarpanlar %30, WACC: %16.0, Uç Değer Büyüme: %4.0",
    source: "Onur İnal Araştırma Masası & Perakende Sektör Notu",
    link: "https://measure-moat.vercel.app/#roadmap"
  },
  {
    id: "R-02C",
    ticker: "TUPRS",
    pdfUrl: "/reports/TUPRS-Hisse-Degerleme-Raporu-Onur-Inal.pdf",
    title: "Tüpraş (TUPRS): Akdeniz Rafineri Marjları, ROP2 Yatırımları ve Sıfır Karbon Dönüşümü",
    subtitle: "Dizel ve jet yakıtı crack spread gücü, İzmit/İzmir kompleksite katsayısı ve yeşil hidrojen/biyoyakıt yol haritası.",
    category: "EQUITY",
    categoryLabel: "HİSSE DEĞERLEME",
    recommendation: "AL / ENDEKS ÜSTÜ GETİRİ",
    recommendationTone: "bullish",
    targetPrice: "₺235.00",
    currentPrice: "₺172.00",
    upsidePotential: "+36.6%",
    period: "2025 / 2026 DEĞERLEME",
    readTime: "9 dk detaylı okuma",
    author: "Onur İnal",
    authorTitle: "Finansal Analist",
    focus: "Tüpraş'ın Nelson Kompleksite Endeksi (14.5) sayesinde ağır ve yüksek kükürtlü ham petrolleri yüksek marjlı beyaz ürünlere çevirme kabiliyeti, stratejik dönüşüm planı ve temettü verimi.",
    executiveSummary:
      "Tüpraş, 30 milyon tonluk yıllık ham petrol işleme kapasitesi ve yüksek Nelson Kompleksite katsayısı ile Akdeniz havzasının en verimli rafinerilerinden biridir. Küresel enerji piyasalarında dizel ve jet yakıtı crack spread'lerinin tarihsel ortalamaların üzerinde seyretmesi rafineri karlılığını desteklemektedir. Şirketin '2050 Karbon Nötr' stratejisi çerçevesinde başlattığı sürdürülebilir havacılık yakıtı (SAF), yeşil hidrojen ve sıfır karbonlu elektrik yatırımları, uzun vadeli fosil yakıt risklerini dengelemektedir.",
    keyCatalysts: [
      "Ağır Ham Petrol Fiyat Makası: Ağır-hafif ham petrol fiyat farkının Tüpraş lehine açılarak ham petrol tedarik maliyetinde iskonto yaratması.",
      "Entek Elektrik Entegrasyonu: Yenilenebilir enerji portföyünün (rüzgar & güneş) rafinerinin kendi elektrik tüketimini karşılaması ve yeşil hidrojen üretimine zemin hazırlaması.",
      "Sürdürülebilir Havacılık Yakıtı (SAF): 2026 itibariyle devreye girecek biyoyakıt tesisleriyle AB havacılık emisyon kotalarına uyum.",
      "Güçlü Temettü Verimi Geleneği: Yılda iki taksit halinde serbest nakit akımının büyük kısmını temettü olarak dağıtma politikası."
    ],
    valuationMetrics: [
      { label: "Hedef Fiyat", value: "₺235.00", benchmark: "Cari: ₺172.00", isPositive: true },
      { label: "Potansiyel Getiri", value: "+36.6%", benchmark: "12 Aylık", isPositive: true },
      { label: "Tahmini Net Rafineri Marjı", value: "$8.5 / bbl", benchmark: "Akdeniz Medyanı: $5.8", isPositive: true },
      { label: "Tahmini F/K", value: "5.8x", benchmark: "Global Emsaller: 7.5x", isPositive: true },
      { label: "FD / FAVÖK", value: "4.2x", benchmark: "Sektör: 5.8x", isPositive: true },
      { label: "Tahmini Temettü Verimi", value: "%9.4", benchmark: "BIST Lideri", isPositive: true }
    ],
    financialDrivers: [
      "Beyaz ürün veriminin %82 seviyesinde tutularak yüksek katma değerli ürün kompozisyonunun korunması.",
      "Döviz bazlı ürün fiyatlaması sayesinde kurlardaki hareketlere karşı doğal enflasyon ve devalüasyon koruması.",
      "Net Nakit Pozisyonu: Güçlü bilanço yapısı ile negatif net borç / FAVÖK çarpanı."
    ],
    risks: [
      "Küresel petrol talebinde yavaşlama veya OPEC+ üretim kotalarının rafineri ham petrol maliyetini yükseltmesi.",
      "Planlı periyodik rafineri bakımları sırasında yaşanabilecek kapasite kullanım kaybı.",
      "Gelecek regülasyonların karbon vergisi maliyetlerini artırması riski."
    ],
    analystNote:
      "Tüpraş hem anlık yüksek temettü verimi arayan hem de yeşil hidrojen dönüşümü ile geleceğe hazırlanan sanayi devidir. Hedef fiyatımız 235.00 TL olup Endeks Üstü Getiri önerimizi sürdürüyoruz.",
    methodology: "DCF (%60) + Rafineri Emsal Çarpanları (%40), Brent Referans: $78, WACC: %15.2",
    source: "Onur İnal Enerji Araştırma Masası",
    link: "https://measure-moat.vercel.app/#roadmap"
  },
  {
    id: "R-02",
    ticker: "MOAT-BIST",
    pdfUrl: "/reports/BIST-Ekonomik-Hendek-Analizi-Onur-Inal.pdf",
    title: "BIST Şirketlerinde Ekonomik Hendek (Moat) ve Sermaye Getirisi (ROIC) Analizi",
    subtitle: "Sürdürülebilir rekabet avantajına sahip şirketlerin sermaye maliyeti üzerindeki getirileri ve FCF kalitesi.",
    category: "MOAT",
    categoryLabel: "EKONOMİK HENDEK",
    recommendation: "GÜÇLÜ HENDEK (WIDE MOAT)",
    recommendationTone: "moat",
    period: "2025 / GÜNCEL",
    readTime: "10 dk metodolojik inceleme",
    author: "Onur İnal",
    authorTitle: "Finansal Analist",
    focus: "Maddi olmayan duran varlıklar, geçiş maliyetleri (switching costs), ağ etkisi ve maliyet avantajı ekseninde BIST şirketlerinin ayrıştırılması ve Dupont analizi.",
    executiveSummary:
      "Bir şirketin yüksek kar marjlarına sahip olması tek başına değer yaratmaz; asıl kriter, bu karlılığın sermaye maliyetinin (WACC) üzerinde sürdürülebilir bir getiri (ROIC > WACC) üretip üretmediğidir. Türkiye gibi sermaye maliyetinin volatil olduğu gelişmekte olan piyasalarda, güçlü fiyatlama gücüne (pricing power) ve düşük sermaye yoğunluğuna sahip hendekli şirketler, uzun vadede endeksin getirisini katlayarak bileşik getiri makinesine dönüşmektedir.",
    keyCatalysts: [
      "Fiyatlama Gücü (Pricing Power): Enflasyonist dönemde girdi maliyetlerindeki artışı marj kaybı yaşamadan nihai fiyata yansıtabilme gücü.",
      "Yüksek Sermaye Getirisi (ROIC): Yatırılan sermaye üzerinden en az 5 yıllık dönemde düzenli olarak %20+ ROIC üretilmesi.",
      "Dönüşüm Maliyetleri (Switching Costs): Kurumsal yazılım, entegre lojistik veya kritik ara malı tedarikinde müşteri kopuşunun imkansıza yakın olması.",
      "Ölçek Ekonomisi: Dağıtım kanalı hakimiyeti ve satınalma gücü sayesinde rakiplerin erişemeyeceği marj tavanı."
    ],
    valuationMetrics: [
      { label: "Ortalama ROIC Spread", value: "+8.6%", benchmark: "ROIC - WACC Farkı", isPositive: true },
      { label: "Nakit Dönüşüm Süresi", value: "-14 Gün", benchmark: "Negatif İşletme Sermayesi", isPositive: true },
      { label: "FCF / Net Kar Oranı", value: "> %95", benchmark: "Yüksek Kazanç Kalitesi", isPositive: true },
      { label: "Bileşik Yıllık Getiri (5Y)", value: "%42.8", benchmark: "BIST 100: %28.4", isPositive: true }
    ],
    financialDrivers: [
      "Dupont 5 faktörlü ayrıştırma modeli ile faaliyet marjı ve aktif devir hızının net kara katkısının ölçülmesi.",
      "Yeniden yatırım oranı (Reinvestment Rate) ile içsel büyüme oranının (Fundamental Growth) doğrulanması.",
      "Maddi olmayan varlık amortismanlarının ve Ar-Ge harcamalarının sermayeleştirilerek gerçek ekonomik karın (EVA) bulunması."
    ],
    risks: [
      "Sektöre giriş bariyerlerini yıkan yıkıcı teknolojik yenilikler veya regülatif tavan fiyat uygulamaları.",
      "Aşırı sermaye birikimi sonrası yapılan verimsiz ve değer yok edici satın alma (M&A) kararları."
    ],
    analystNote:
      "Measure Moat çerçevesinde geliştirdiğimiz puanlama matrisi ile BIST 100 şirketleri düzenli olarak taranmakta, hendek skoru 80 ve üzeri olan şirketler portföy stratejimizin çekirdeğini oluşturmaktadır.",
    methodology: "ROIC/WACC Farkı, Dupont 5-Way Decomposition, EVA (Ekonomik Katma Değer), 10 Yıllık Marj Stabilitesi",
    source: "Measure Moat Platformu & Akademik Finans Analizi",
    link: "https://measure-moat.vercel.app/#roadmap"
  },
  {
    id: "R-03",
    ticker: "FROTO",
    pdfUrl: "/reports/FROTO-Hisse-Degerleme-Raporu-Onur-Inal.pdf",
    title: "Ford Otosan (FROTO): Craiova Entegrasyonu, Elektrikli Ticari Araç Hamlesi ve İhracat Çarpanı",
    subtitle: "Romanya tesisinin tam kapasiteye ulaşması, Courier ve Puma üretiminin ciroya etkisi ve yüksek temettü geleneği.",
    category: "EQUITY",
    categoryLabel: "HİSSE DEĞERLEME",
    recommendation: "AL / ENDEKS ÜSTÜ GETİRİ",
    recommendationTone: "bullish",
    targetPrice: "₺1,420.00",
    currentPrice: "₺1,010.00",
    upsidePotential: "+40.6%",
    period: "2025 / 2026 DEĞERLEME",
    readTime: "7 dk detaylı okuma",
    author: "Onur İnal",
    authorTitle: "Finansal Analist",
    focus: "Ford Otosan'ın Avrupa hafif ticari araç liderliği, maliyet artı (cost-plus) ihracat sözleşmeleri koruması ve Craiova fabrikasında üretilen elektrikli Puma/Courier modellerinin birim karlılığı.",
    executiveSummary:
      "Ford Otosan, 'maliyet artı sabit kar' formülüyle çalışan ihracat anlaşmaları sayesinde kur ve hammadde risklerine karşı en korunaklı BIST sanayi devlerinden biridir. Romanya Craiova tesisinin satın alınmasıyla yıllık üretim kapasitesinin 900 bin adede yaklaşması, şirketi Ford'un küresel çapta en büyük ticari araç üretim üssü haline getirmiştir. Elektrikli Courier ve yeni nesil Transit modellerinin devreye girmesiyle 2025 yılı marjlarının tarihi yüksek seviyelerde korunmasını bekliyoruz.",
    keyCatalysts: [
      "Craiova Fabrikası Tam Kapasite: Yeni Courier ve Puma modelleriyle Romanya operasyonunun brüt karlılık artışı.",
      "Cost-Plus İhracat Kalkanı: İhracat kontratlarında hammadde ve enerji enflasyonunun Ford Motor Company tarafından kompanse edilmesi.",
      "Avrupa Elektrikli Ticari Araç Dönüşümü: E-Transit ve hibrit modellerin AB emisyon standartları kapsamında yüksek talep görmesi.",
      "İstikrarlı Temettü Geleneği: Yılda çift temettü politikası ile güçlü nakit temettü verimi."
    ],
    valuationMetrics: [
      { label: "Hedef Fiyat", value: "₺1,420.00", benchmark: "Cari: ₺1,010.00", isPositive: true },
      { label: "Potansiyel Getiri", value: "+40.6%", benchmark: "12 Aylık", isPositive: true },
      { label: "Tahmini F/K", value: "8.1x", benchmark: "Tarihsel Medyan: 9.8x", isPositive: true },
      { label: "FD / FAVÖK", value: "7.2x", benchmark: "Otomotiv Emsalleri: 8.5x", isPositive: true },
      { label: "Tahmini Temettü Verimi", value: "%6.8", benchmark: "Yüksek Nakit Getirisi", isPositive: true },
      { label: "Özkaynak Karlılığı (ROE)", value: "%42.5", benchmark: "TMS 29 Düzeltilmiş", isPositive: true }
    ],
    financialDrivers: [
      "İhracat payının cironun %80'ini aşmasıyla doğal döviz hedge mekanizması.",
      "Kapasite kullanım oranının %88 üzerinde kalması ve batarya montaj hattı yatırımlarının geri dönüşü.",
      "Yüksek işletme sermayesi yönetimi sayesinde negatif net işletme sermayesi ile çalışma kabiliyeti."
    ],
    risks: [
      "Avrupa ana ihracat pazarlarında (İngiltere, Almanya, İtalya) ekonomik durgunluk ve hafif ticari araç talebinde yavaşlama.",
      "Batarya teknolojisi tedarik zincirinde hammadde fiyat dalgalanmaları."
    ],
    analystNote:
      "FROTO için geliştirdiğimiz DCF modelinde risksiz faiz oranı %28 ve uç değer büyüme %4 alınmıştır. Güçlü ihracat teminatı ve yüksek temettü verimi, hisseyi defansif büyüme arayan kurumsal portföyler için birinci tercih yapmaktadır.",
    methodology: "İndirgenmiş Nakit Akımları (DCF) + Temettü İndirgeme Modeli (DDM), WACC: %16.8",
    source: "Onur İnal Değerleme Masası",
    link: "https://measure-moat.vercel.app/#roadmap"
  },
  {
    id: "R-04",
    ticker: "TMS-29",
    pdfUrl: "/reports/TMS29-Enflasyon-Muhasebesi-Raporu-Onur-Inal.pdf",
    title: "Enflasyon Muhasebesi (TMS 29) Çerçevesinde Bilanço ve Karlılık Düzeltmeleri",
    subtitle: "Parasal kazanç/kayıp ayrıştırması, vergi etkisi ve düzeltilmiş özkaynak karlılığının (Real ROE) hesaplanması.",
    category: "MACRO",
    categoryLabel: "MAKRO & MUHASEBE",
    recommendation: "TEMATİK MAKRO RAPORU",
    recommendationTone: "highlight",
    period: "2024 / 2025 REHBER",
    readTime: "9 dk metodolojik analiz",
    author: "Onur İnal",
    authorTitle: "Finansal Analist",
    focus: "Yüksek enflasyon döneminde şirketlerin finansal tablolarının enflasyondan arındırılması, parasal net pozisyon zararlarının net kara etkisi ve gerçek FCF hesaplama metodolojisi.",
    executiveSummary:
      "TMS 29 uygulaması ile birlikte BIST şirketlerinin raporlanan net kar rakamlarında büyük ayrışmalar yaşanmaktadır. Borçlu ve parasal yükümlülüğü fazla olan şirketler parasal kazanç yazarken; yüksek nakitte kalan ve parasal varlığı yüksek olan şirketler parasal pozisyon kaybı nedeniyle muhasebesel zarar kaydedebilmektedir. Analistler için kritik olan, raporlanan net kara aldanmayıp amortisman düzeltmeleri, ertelenmiş vergi etkileri ve operasyonel nakit akımını izlemektir.",
    keyCatalysts: [
      "Gerçek ROE Hesaplaması: Nominal özkaynak karlılığı yerine enflasyondan arındırılmış reel sermaye getirisinin ölçülmesi.",
      "Duran Varlık Yeniden Değerleme Etkisi: Amortisman giderlerinin artmasıyla vergi matrahının korunması.",
      "İşletme Sermayesi Erozyonu: Parasal varlıkların alım gücünün korunması için gereken ek borçlanma ihtiyacı.",
      "Sektörel Ayrışma: Perakende ve sanayi şirketleri ile holdinglerin TMS 29 duyarlılık karşılaştırması."
    ],
    valuationMetrics: [
      { label: "BIST Sanayi Net Kar Düzeltmesi", value: "-%22.4", benchmark: "TMS 29 Etkisi", isPositive: false },
      { label: "Duran Varlık Değerleme Katsayısı", value: "3.4x", benchmark: "Tarihi Maliyet Düzeltmesi", isPositive: true },
      { label: "Operasyonel Nakit Akımı / Net Kar", value: "1.45x", benchmark: "Nakit Odaklı Yaklaşım", isPositive: true }
    ],
    financialDrivers: [
      "Parasal net varlık pozisyonunun negatifte tutulması stratejisinin enflasyon kalkanı sağlaması.",
      "Stok değerleme yöntemlerinde FIFO vs. Ağırlıklı Ortalama etkisinin satılan malın maliyetine (SMM) yansıması."
    ],
    risks: [
      "Muhasebesel karın erimesi sonucu temettü dağıtılabilir kar matrahında olası yasal kısıtlar.",
      "Vergi kanunları (VUK enflasyon düzeltmesi) ile SPK/TMS 29 arasındaki farkların yarattığı vergi yükleri."
    ],
    analystNote:
      "Yatırımcılara tavsiyemiz; TMS 29 döneminde hisse seçimini F/K çarpanı yerine FD/FAVÖK ve Serbest Nakit Akımı (FCF) üzerinden yapmalarıdır. Nakit akımı asla yalan söylemez.",
    methodology: "TMS 29 Muhasebe Standartları, Reel Özkaynak Modellemesi, Nakit Akım Normalizasyonu",
    source: "Onur İnal Makro Analiz Masası",
    link: "https://measure-moat.vercel.app/#roadmap"
  },
  {
    id: "R-05",
    ticker: "PGSUS",
    pdfUrl: "/reports/PGSUS-Hisse-Degerleme-Raporu-Onur-Inal.pdf",
    title: "Pegasus Hava Taşımacılığı (PGSUS): Düşük Maliyetli İş Modeli ve Yan Gelir Büyümesi",
    subtitle: "Yeni nesil A321neo filo dönüşümü, yan gelir penetrasyonu ve uluslararası hat açılışları.",
    category: "SECTOR",
    categoryLabel: "SEKTÖR RAPORU",
    recommendation: "AL / ENDEKS ÜSTÜ GETİRİ",
    recommendationTone: "bullish",
    targetPrice: "₺340.00",
    currentPrice: "₺242.00",
    upsidePotential: "+40.5%",
    period: "2025 / 2026 DEĞERLEME",
    readTime: "7 dk detaylı okuma",
    author: "Onur İnal",
    authorTitle: "Finansal Analist",
    focus: "Pegasus'un yolcu başına yan gelir (ancillary revenue) liderliği, filo gençliği sayesinde yakıt ve bakım maliyeti avantajı, Sabiha Gökçen 2. pistinin kapasiteye katkısı.",
    executiveSummary:
      "Pegasus, ultra düşük maliyetli taşıyıcı (ULCC) disiplinini koruyarak Avrupa'nın en yüksek yan gelir oranına sahip havayollarından biri haline gelmiştir. Koltuk başına 239 yolcu kapasiteli A321neo uçaklarının filodaki payının %80'i aşması, şirkete rakipsiz bir koltuk-kilometre maliyet üstünlüğü kazandırmaktadır. Sabiha Gökçen Havalimanı ikinci pistinin devreye girmesiyle artan slot kapasitesi, uluslararası uçuş büyümesini hızlandırmaktadır.",
    keyCatalysts: [
      "A321neo Filo Verimliliği: Eski nesil uçaklara göre %15 daha düşük yakıt tüketimi ve koltuk başına %20 daha düşük birim maliyet.",
      "Yan Gelir Monetizasyonu: Koltuk seçimi, ekstra bagaj ve uçak içi satışlarla yolcu başına 28+ EUR yan gelir başarısı.",
      "Sabiha Gökçen Slot Kapasitesi: 2. pist ile birlikte saatlik iniş-kalkış kapasitesinde %40 genişleme imkanı.",
      "Döviz Bazlı Gelir Koruması: Uluslararası hatların toplam gelir içerisindeki payının %78'e yükselmesi."
    ],
    valuationMetrics: [
      { label: "Hedef Fiyat", value: "₺340.00", benchmark: "Cari: ₺242.00", isPositive: true },
      { label: "Potansiyel Getiri", value: "+40.5%", benchmark: "12 Aylık", isPositive: true },
      { label: "Tahmini F/K", value: "5.4x", benchmark: "Avrupa LCC: 8.2x", isPositive: true },
      { label: "FD / FAVÖK", value: "4.8x", benchmark: "Ryanair/Wizz: 6.5x", isPositive: true },
      { label: "Yolcu Başına Yan Gelir", value: "€28.4", benchmark: "Yıllık +%14 Artış", isPositive: true }
    ],
    financialDrivers: [
      "Düşük yakıt dışı CASK sayesinde bilet fiyatlarında esneklik ve yüksek doluluk oranı (%86+).",
      "Güçlü nakit yaratımıyla filonun finansal kiralama borçlarının rahatlıkla itfa edilmesi."
    ],
    risks: [
      "Bölgemizdeki hava sahası kapanışları ve Orta Doğu transit talebinde dönemsel çekilmeler.",
      "Pratt & Whitney motor muayenelerinin bazı uçaklarda operasyonel kısıt yaratma riski."
    ],
    analystNote:
      "Pegasus'un maliyet disiplini ve çevik filo yönetimi, döngüsel havacılık sektöründe onu en dirençli oyunculardan biri yapmaktadır. Hisse için hedef fiyatımız 340.00 TL olup Endeks Üstü Getiri önerimizi koruyoruz.",
    methodology: "İndirgenmiş Nakit Akımları (DCF) %65 + Çarpan Analizi %35",
    source: "Onur İnal Araştırma Masası",
    link: "https://measure-moat.vercel.app/#roadmap"
  }
];
