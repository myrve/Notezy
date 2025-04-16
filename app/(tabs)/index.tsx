import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Note = {
  id: string;
  text: string;
};

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Notları yükle
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const saved = await AsyncStorage.getItem('notes');
      if (saved) setNotes(JSON.parse(saved));
    } catch (e) {
      Alert.alert('Hata', 'Notlar yüklenemedi.');
    }
  };

  const saveNotes = async (newNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (e) {
      Alert.alert('Hata', 'Not kaydedilemedi.');
    }
  };

  const addNote = () => {
    if (!noteText.trim()) {
      Alert.alert('Uyarı', 'Not boş olamaz!');
      return;
    }
    const newNotes = [{ id: Date.now().toString(), text: noteText }, ...notes];
    saveNotes(newNotes);
    setNoteText('');
    setShowInput(false);
    Keyboard.dismiss();
  };

  const deleteNote = (id: string) => {
    Alert.alert(
      'Notu Sil',
      'Bu notu silmek istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const newNotes = notes.filter(n => n.id !== id);
            saveNotes(newNotes);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notlarım</Text>
      {showInput ? (
        <View style={{ width: '100%', marginBottom: 12 }}>
          <TextInput
            style={styles.input}
            placeholder="Notunu yaz..."
            value={noteText}
            onChangeText={setNoteText}
            autoFocus
            onSubmitEditing={addNote}
            returnKeyType="done"
          />
          <Button title="Kaydet" onPress={addNote} />
        </View>
      ) : (
        <Button title="Yeni Not Ekle" onPress={() => setShowInput(true)} />
      )}
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.note}
            onLongPress={() => deleteNote(item.id)}
          >
            <Text>{item.text}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 24 }}>Henüz not yok. Ekle!</Text>}
        style={{ width: '100%' }}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <Text style={styles.info}>Notu silmek için üzerine uzun bas!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 5,
    padding: 10, marginBottom: 8, backgroundColor: '#f9f9f9'
  },
  note: {
    width: '100%',
    backgroundColor: '#f1f1f1',
    padding: 14,
    borderRadius: 6,
    marginBottom: 10,
  },
  info: {
    color: '#888',
    fontSize: 12,
    marginTop: 12,
  }
});
