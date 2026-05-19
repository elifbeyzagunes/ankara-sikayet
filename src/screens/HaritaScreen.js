import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { supabase } from '../lib/supabase';

const ONCELIK_RENK = {
  Acil: '#FF4444',
  Orta: '#FF8800',
  Dusuk: '#4CAF50',
};

export default function HaritaScreen() {
  const [sikayetler, setSikayetler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenSikayet, setSecilenSikayet] = useState(null);

  useEffect(() => {
    const verileriGetir = async () => {
      const { data, error } = await supabase
        .from('sikayetler')
        .select('id, sikayet_turu, aciklama, ilce, mahalle, enlem, boylam, oncelik, durum');
      if (!error) setSikayetler(data || []);
      setYukleniyor(false);
    };
    verileriGetir();
  }, []);

  if (yukleniyor) {
    return (
      <View style={styles.yukleniyorContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.harita}
        initialRegion={{
          latitude: 39.9334,
          longitude: 32.8597,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
      >
        {sikayetler
          .filter(s => s.enlem && s.boylam)
          .map(s => (
            <Marker
              key={s.id}
              coordinate={{ latitude: parseFloat(s.enlem), longitude: parseFloat(s.boylam) }}
              pinColor={ONCELIK_RENK[s.oncelik] || '#888'}
              onPress={() => setSecilenSikayet(s)}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTur}>{s.sikayet_turu}</Text>
                  <Text style={styles.calloutIlce}>{s.ilce}</Text>
                  <Text style={styles.calloutOncelik}>{s.oncelik}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
      </MapView>

      {/* Alt bilgi kutusu */}
      <View style={styles.bilgiKutu}>
        <Text style={styles.bilgiText}>🔴 Acil  🟠 Orta  🟢 Düşük</Text>
        <Text style={styles.bilgiSayac}>{sikayetler.length} şikayet haritada</Text>
      </View>

      {/* Seçilen şikayet detay modal */}
      {secilenSikayet && (
        <Modal transparent animationType="slide" visible={!!secilenSikayet}>
          <TouchableOpacity style={styles.modalArka} onPress={() => setSecilenSikayet(null)}>
            <View style={styles.modalKart}>
              <View style={[styles.oncelikBar, { backgroundColor: ONCELIK_RENK[secilenSikayet.oncelik] }]} />
              <Text style={styles.modalTur}>{secilenSikayet.sikayet_turu}</Text>
              <Text style={styles.modalAciklama}>{secilenSikayet.aciklama}</Text>
              <Text style={styles.modalIlce}>📍 {secilenSikayet.ilce} / {secilenSikayet.mahalle}</Text>
              <View style={styles.modalAlt}>
                <Text style={styles.modalDurum}>Durum: {secilenSikayet.durum}</Text>
                <Text style={styles.modalKapat}>Kapat ✕</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  yukleniyorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' },
  harita: { flex: 1 },
  callout: { padding: 8, minWidth: 140 },
  calloutTur: { fontWeight: '700', fontSize: 14 },
  calloutIlce: { color: '#555', fontSize: 12 },
  calloutOncelik: { fontSize: 12, marginTop: 2 },
  bilgiKutu: {
    position: 'absolute', bottom: 20, left: 16, right: 16,
    backgroundColor: 'rgba(26,26,46,0.92)',
    borderRadius: 12, padding: 12,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  bilgiText: { color: '#ccc', fontSize: 13 },
  bilgiSayac: { color: '#4CAF50', fontSize: 13, fontWeight: '600' },
  modalArka: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalKart: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  oncelikBar: { height: 4, borderRadius: 2, marginBottom: 14 },
  modalTur: { color: '#4CAF50', fontWeight: '700', fontSize: 18, marginBottom: 8 },
  modalAciklama: { color: '#ccc', fontSize: 14, lineHeight: 20, marginBottom: 10 },
  modalIlce: { color: '#888', fontSize: 13, marginBottom: 14 },
  modalAlt: { flexDirection: 'row', justifyContent: 'space-between' },
  modalDurum: { color: '#aaa', fontSize: 13 },
  modalKapat: { color: '#4CAF50', fontSize: 13, fontWeight: '600' },
});
