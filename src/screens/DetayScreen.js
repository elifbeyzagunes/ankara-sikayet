import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ONCELIK_RENK = {
  Acil: '#FF4444',
  Orta: '#FF8800',
  Dusuk: '#4CAF50',
  Beklemede: '#888',
};

export default function DetayScreen({ route }) {
  const { sikayet } = route.params;

  const Satir = ({ etiket, deger }) => (
    <View style={styles.satir}>
      <Text style={styles.satirEtiket}>{etiket}</Text>
      <Text style={styles.satirDeger}>{deger || '-'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Öncelik banner */}
      <View style={[styles.banner, { backgroundColor: ONCELIK_RENK[sikayet.oncelik] || '#888' }]}>
        <Text style={styles.bannerText}>{sikayet.oncelik} ÖNCELİK</Text>
      </View>

      <Text style={styles.baslik}>{sikayet.sikayet_turu}</Text>
      <Text style={styles.aciklama}>{sikayet.aciklama}</Text>

      <View style={styles.bilgiKutu}>
        <Satir etiket="📍 Konum" deger={`${sikayet.ilce} / ${sikayet.mahalle}`} />
        <Satir etiket="⚙️ Durum" deger={sikayet.durum} />
        <Satir etiket="🏢 Yönlendirilen Birim" deger={sikayet.birim} />
        <Satir etiket="⏱ Tahmini Süre" deger={sikayet.tahmini_sure} />
        <Satir etiket="📅 Tarih" deger={new Date(sikayet.created_at).toLocaleString('tr-TR')} />
      </View>

      {/* AI analiz notu */}
      {sikayet.ai_notu && (
        <View style={styles.aiKutu}>
          <Text style={styles.aiBaslik}>🤖 Yapay Zeka Analizi</Text>
          <Text style={styles.aiNot}>{sikayet.ai_notu}</Text>
        </View>
      )}

      {/* Durum zaman çizelgesi */}
      <Text style={styles.zaman_baslik}>Süreç Takibi</Text>
      <View style={styles.zamanKutu}>
        {[
          { durum: 'Alındı', renk: '#4CAF50', aktif: true },
          { durum: 'AI Analizi', renk: '#4CAF50', aktif: !!sikayet.oncelik && sikayet.oncelik !== 'Beklemede' },
          { durum: 'İnceleniyor', renk: '#FF8800', aktif: sikayet.durum === 'Inceleniyor' || sikayet.durum === 'Cozuldu' },
          { durum: 'Çözüldü', renk: '#4CAF50', aktif: sikayet.durum === 'Cozuldu' },
        ].map((adim, i) => (
          <View key={i} style={styles.adimRow}>
            <View style={[styles.adimDot, { backgroundColor: adim.aktif ? adim.renk : '#333' }]} />
            {i < 3 && <View style={[styles.adimCizgi, { backgroundColor: adim.aktif ? adim.renk : '#222' }]} />}
            <Text style={[styles.adimText, { color: adim.aktif ? '#fff' : '#555' }]}>{adim.durum}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  banner: { padding: 12, alignItems: 'center' },
  bannerText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  baslik: { color: '#4CAF50', fontSize: 22, fontWeight: '700', margin: 16, marginBottom: 8 },
  aciklama: { color: '#ccc', fontSize: 15, lineHeight: 22, marginHorizontal: 16, marginBottom: 16 },
  bilgiKutu: { backgroundColor: '#1a1a2e', margin: 16, borderRadius: 12, padding: 16, gap: 12 },
  satir: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  satirEtiket: { color: '#777', fontSize: 13, flex: 1 },
  satirDeger: { color: '#fff', fontSize: 13, fontWeight: '500', flex: 2, textAlign: 'right' },
  aiKutu: { backgroundColor: '#0d2318', margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1b4332' },
  aiBaslik: { color: '#4CAF50', fontWeight: '700', marginBottom: 8 },
  aiNot: { color: '#aaa', fontSize: 13, lineHeight: 18 },
  zaman_baslik: { color: '#777', fontSize: 13, fontWeight: '600', marginHorizontal: 16, marginBottom: 12 },
  zamanKutu: { marginHorizontal: 16, marginBottom: 32 },
  adimRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  adimDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  adimCizgi: { position: 'absolute', left: 5, top: 14, width: 2, height: 20 },
  adimText: { fontSize: 14 },
});
