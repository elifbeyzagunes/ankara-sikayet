import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { supabase } from '../lib/supabase';

const ONCELIK_RENK = {
  Acil: '#FF4444',
  Orta: '#FF8800',
  Dusuk: '#4CAF50',
};

export default function SikayetlerScreen({ navigation }) {
  const [sikayetler, setSikayetler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [filtre, setFiltre] = useState('Tümü');

  const kategoriler = ['Tümü', 'Acil', 'Orta', 'Dusuk'];

  const verileriGetir = async () => {
    const { data, error } = await supabase
      .from('sikayetler')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setSikayetler(data || []);
    setYukleniyor(false);
    setYenileniyor(false);
  };

  useEffect(() => {
    verileriGetir();

    // Gerçek zamanlı güncellemeler — yeni şikayet gelince otomatik yansır
    const kanal = supabase
      .channel('sikayetler-kanal')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sikayetler' }, verileriGetir)
      .subscribe();

    return () => supabase.removeChannel(kanal);
  }, []);

  const filtreliSikayetler = filtre === 'Tümü'
    ? sikayetler
    : sikayetler.filter(s => s.oncelik === filtre);

  const SikayetKarti = ({ item }) => (
    <TouchableOpacity
      style={styles.kart}
      onPress={() => navigation.navigate('Detay', { sikayet: item })}
    >
      <View style={styles.kartUst}>
        <View style={[styles.oncelikBadge, { backgroundColor: ONCELIK_RENK[item.oncelik] || '#888' }]}>
          <Text style={styles.oncelikText}>{item.oncelik}</Text>
        </View>
        <Text style={styles.tarih}>{new Date(item.created_at).toLocaleDateString('tr-TR')}</Text>
      </View>
      <Text style={styles.tur}>{item.sikayet_turu}</Text>
      <Text style={styles.aciklama} numberOfLines={2}>{item.aciklama}</Text>
      <View style={styles.kartAlt}>
        <Text style={styles.ilce}>📍 {item.ilce} / {item.mahalle}</Text>
        <View style={[styles.durumBadge, item.durum === 'Cozuldu' && styles.durumCozuldu]}>
          <Text style={styles.durumText}>{item.durum}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (yukleniyor) {
    return (
      <View style={styles.yukleniyorContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.yukleniyorText}>Şikayetler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filtre butonları */}
      <View style={styles.filtreRow}>
        {kategoriler.map(k => (
          <TouchableOpacity
            key={k}
            style={[styles.filtreBtn, filtre === k && styles.filtreBtnAktif]}
            onPress={() => setFiltre(k)}
          >
            <Text style={[styles.filtreBtnText, filtre === k && styles.filtreBtnTextAktif]}>{k}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sayac}>{filtreliSikayetler.length} şikayet</Text>

      <FlatList
        data={filtreliSikayetler}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <SikayetKarti item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={yenileniyor}
            onRefresh={() => { setYenileniyor(true); verileriGetir(); }}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <Text style={styles.bos}>Henüz şikayet yok.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 12 },
  yukleniyorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' },
  yukleniyorText: { color: '#888', marginTop: 12 },
  filtreRow: { flexDirection: 'row', marginBottom: 10, gap: 8 },
  filtreBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#333' },
  filtreBtnAktif: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  filtreBtnText: { color: '#888', fontSize: 13 },
  filtreBtnTextAktif: { color: '#fff', fontWeight: '600' },
  sayac: { color: '#555', fontSize: 12, marginBottom: 8 },
  kart: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#222' },
  kartUst: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  oncelikBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  oncelikText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  tarih: { color: '#555', fontSize: 12 },
  tur: { color: '#4CAF50', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  aciklama: { color: '#ccc', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  kartAlt: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ilce: { color: '#777', fontSize: 12 },
  durumBadge: { backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  durumCozuldu: { backgroundColor: '#1b4332' },
  durumText: { color: '#aaa', fontSize: 11 },
  bos: { textAlign: 'center', color: '#555', marginTop: 60 },
});
