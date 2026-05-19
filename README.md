# 🏙️ Ankara Belediyesi Akıllı Şikayet Sistemi

Vatandaşların belediyeye şikayetlerini kolayca iletebileceği, yapay zeka destekli mobil uygulama.

---

## 📱 Özellikler

- Şikayet listesi — öncelik filtreli, gerçek zamanlı güncelleme
- Harita görünümü — tüm şikayetler haritada pinlenir
- Şikayet gir — kategori seçimi, konum otomatik alınır
- Detay ekranı — süreç takibi, AI analiz notu
- Supabase entegrasyonu — gerçek zamanlı veritabanı

---

## 🗄️ Supabase Tablo Yapısı (Backend için)

Arkadaşın Supabase'de şu tabloyu oluşturmalı:

```sql
CREATE TABLE sikayetler (
  id SERIAL PRIMARY KEY,
  sikayet_turu TEXT NOT NULL,
  aciklama TEXT NOT NULL,
  ilce TEXT NOT NULL,
  mahalle TEXT,
  enlem DECIMAL(10, 7),
  boylam DECIMAL(10, 7),
  oncelik TEXT DEFAULT 'Beklemede',
  durum TEXT DEFAULT 'Inceleniyor',
  birim TEXT,
  tahmini_sure TEXT,
  ai_notu TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime aktif et
ALTER PUBLICATION supabase_realtime ADD TABLE sikayetler;
```

---

## ⚙️ Kurulum

### 1. Repo'yu klonla
```bash
git clone https://github.com/KULLANICI_ADI/ankara-sikayet.git
cd ankara-sikayet
```

### 2. Bağımlılıkları yükle
```bash
npm install
```

### 3. Supabase bilgilerini gir
`src/lib/supabase.js` dosyasını aç:
```js
const SUPABASE_URL = 'https://SENIN_URL.supabase.co';
const SUPABASE_ANON_KEY = 'SENIN_ANON_KEY';
```

Bu bilgileri Supabase Dashboard → Settings → API bölümünden alabilirsin.

### 4. Uygulamayı başlat
```bash
npx expo start
```

Telefonuna **Expo Go** uygulamasını indir, QR kodu okut — uygulama telefonunda açılır.

---

## 🤖 AI Entegrasyonu (Backend Görevi)

Vatandaş şikayet gönderdiğinde backend şunları yapmalı:

1. `sikayetler` tablosunda yeni satır eklenmesini dinle (Supabase Realtime veya webhook)
2. `aciklama` alanını AI'ya gönder
3. AI'dan dönen sonuçla şu alanları güncelle:
   - `oncelik`: "Acil" / "Orta" / "Dusuk"
   - `birim`: "Su ve Kanalizasyon" / "Elektrik İşleri" vb.
   - `tahmini_sure`: "24 saat" / "72 saat" vb.
   - `ai_notu`: AI'ın açıklama metni

Örnek AI prompt:
```
Aşağıdaki belediye şikayetini analiz et:
"{aciklama}"

JSON formatında döndür:
{
  "oncelik": "Acil | Orta | Dusuk",
  "birim": "ilgili belediye birimi adı",
  "tahmini_sure": "kaç saat/gün",
  "ai_notu": "kısa analiz açıklaması"
}
```

---

## 🛠️ Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Mobil | React Native (Expo) |
| Veritabanı | Supabase (PostgreSQL) |
| Harita | React Native Maps |
| Konum | Expo Location |
| Gerçek zamanlı | Supabase Realtime |

---

## 📂 Dosya Yapısı

```
ankara-sikayet/
├── App.js                          # Ana navigasyon
├── app.json                        # Expo konfigürasyon
├── src/
│   ├── lib/
│   │   └── supabase.js            # Supabase bağlantısı
│   └── screens/
│       ├── SikayetlerScreen.js    # Liste ekranı
│       ├── HaritaScreen.js        # Harita ekranı
│       ├── SikayetGirScreen.js    # Form ekranı
│       └── DetayScreen.js         # Detay ekranı
```
