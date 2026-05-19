import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Platform
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

const KATEGORILER = ['Kanalizasyon', 'Aydinlatma', 'Yol', 'Temizlik', 'Yesil Alan', 'Diger'];
const ILCELER = ['Çankaya', 'Keçiören', 'Mamak', 'Altındağ', 'Etimesgut', 'Sincan', 'Pursaklar', 'Gölbaşı', 'Diğer'];

export default function SikayetGirScreen({ navigation }) {
  const [form, setForm] = useState({
    sikayet_turu: '',
    aciklama: '',
    ilce: '',
    mahalle: '',
    enlem: null,
    boylam: null,
  });
  const [konumAliniyor, setKonumAliniyor] = useState(false);
  const [gonderiyor, setGonderiyor] = useState(false);

  const konumAl = async () => {
    setKonumAliniyor(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Konum izni verilmedi.');
      setKonumAliniyor(false);
      return;
    }
    const konum = await Location.getCurrentPositionAsync({});
    setForm(prev => ({
      ...prev,
      enlem: konum.coords.latitude,
      boylam: konum.coords.longitude,
    }));
    setKonumAliniyor(false);
    Alert.alert('✓ Konum alındı', 'Konumunuz şikayete eklendi.');
  };

  const sikayet_gonder = async () => {
    if (!form.sikayet_turu) return Alert.alert('Eksik', 'Lütfen şikayet türü seçin.');
    if (!form.aciklama || form.aciklama.length < 10) return Alert.alert('Eksik', 'Açıklama en az 10 karakter olmalı.');
    if (!form.ilce) return Alert.alert('Eksik', 'Lütfen ilçe seçin.');

    setGonderiyor(true);

    const { error } = await supabase.from('sikayetler').insert([{
      sikayet_turu: form.sikayet_turu,
      aciklama: form.aciklama,
      ilce: form.ilce,
      mahalle: form.mahalle,
      enlem: form.enlem,
      boylam: form.boylam,
      oncelik: 'Beklemede',   // AI backend bu alanı dolduracak
      durum: 'Inceleniyor',
      birim: '',              // AI backend bu alanı dolduracak
    }]);

    setGonderiyor(false);

    if (error) {
      Alert.alert('Hata', 'Şikayet gönderilemedi: ' + error.message);
    } else {
      Alert.alert(
        '✓ Şikayetiniz alındı!',
        'Yapay zeka sistemi şikayetinizi analiz edecek ve ilgili birime yönlendirecek.',
        [{ text: 'Tamam', onPress: () => navigation.navigate('Şikayetler') }]
      );
      setForm({ sikayet_turu: '', aciklama: '', ilce: '', mahalle: '', enlem: null, boylam: null });
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.baslik}>Yeni Şikayet</Text>
      <Text style={styles.altBaslik}>Şikayetiniz yapay zeka tarafından analiz edilip ilgili birime yönlendirilecektir.</Text>

      {/* Şikayet Türü */}
      <Text style={styles.etiket}>Şikayet Türü *</Text>
      <View style={styles.kategorilerGrid}>
        {KATEGORILER.map(k => (
          <TouchableOpacity
            key={k}
            style={[styles.kategoriBtn, form.sikayet_turu === k && styles.kategoriBtnAktif]}
            onPress={() => setForm(prev => ({ ...prev, sikayet_turu: k }))}
          >
            <Text style={[styles.kategoriBtnText, form.sikayet_turu === k && styles.kategoriBtnTextAktif]}>{k}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Açıklama */}
      <Text style={styles.etiket}>Açıklama *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Sorunu detaylıca açıklayın..."
        placeholderTextColor="#555"
        value={form.aciklama}
        onChangeText={v => setForm(prev => ({ ...prev, aciklama: v }))}
        multiline
        numberOfLines={4}
      />

      {/* İlçe */}
      <Text style={styles.etiket}>İlçe *</Text>
      <View style={styles.kategorilerGrid}>
        {ILCELER.map(i => (
          <TouchableOpacity
            key={i}
            style={[styles.kategoriBtn, form.ilce === i && styles.kategoriBtnAktif]}
            onPress={() => setForm(prev => ({ ...prev, ilce: i }))}
          >
            <Text style={[styles.kategoriBtnText, form.ilce === i && styles.kategoriBtnTextAktif]}>{i}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mahalle */}
      <Text style={styles.etiket}>Mahalle (opsiyonel)</Text>
      <TextInput
        style={styles.input}
        placeholder="Mahalle adı..."
        placeholderTextColor="#555"
        value={form.mahalle}
        onChangeText={v => setForm(prev => ({ ...prev, mahalle: v }))}
      />

      {/* Konum */}
      <TouchableOpacity style={styles.konumBtn} onPress={konumAl} disabled={konumAliniyor}>
        {konumAliniyor
          ? <ActivityIndicator color="#4CAF50" />
          : <Text style={styles.konumBtnText}>
              {form.enlem ? '✓ Konum alındı' : '📍 Konumumu otomatik ekle'}
            </Text>
        }
      </TouchableOpacity>

      {/* Gönder */}
      <TouchableOpacity
        style={[styles.gonderBtn, gonderiyor && styles.gonderBtnDisabled]}
        onPress={sikayet_gonder}
        disabled={gonderiyor}
      >
        {gonderiyor
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.gonderBtnText}>Şikayeti Gönder</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  baslik: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  altBaslik: { color: '#666', fontSize: 13, lineHeight: 18, marginBottom: 20 },
  etiket: { color: '#aaa', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12,
    color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#333',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  kategorilerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kategoriBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#333',
  },
  kategoriBtnAktif: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  kategoriBtnText: { color: '#888', fontSize: 13 },
  kategoriBtnTextAktif: { color: '#fff', fontWeight: '600' },
  konumBtn: {
    marginTop: 16, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: '#4CAF50', borderStyle: 'dashed',
    alignItems: 'center',
  },
  konumBtnText: { color: '#4CAF50', fontSize: 14 },
  gonderBtn: {
    marginTop: 24, backgroundColor: '#4CAF50',
    padding: 16, borderRadius: 12, alignItems: 'center',
  },
  gonderBtnDisabled: { opacity: 0.6 },
  gonderBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
