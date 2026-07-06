import { activarCatalogo, actualizarCatalogo, Catalogo, contarProductosPorCatalogo, obtenerCatalogos } from '@/database/db';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function MisTiendasScreen() {
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [editando, setEditando] = useState<Catalogo | null>(null);
  const [nombreEdit, setNombreEdit] = useState('');
  const [emojiEdit, setEmojiEdit] = useState('');
  const [fotoEdit, setFotoEdit] = useState('');
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [nombreNueva, setNombreNueva] = useState('');
  const [emojiNueva, setEmojiNueva] = useState('🏪');
  const [fotoNueva, setFotoNueva] = useState('');

  useFocusEffect(
    useCallback(() => {
      setCatalogos(obtenerCatalogos());
    }, [])
  );

  const recargar = () => setCatalogos(obtenerCatalogos());

  const activar = (catalogo: Catalogo) => {
    Alert.alert(
      `Activar ${catalogo.nombre}`,
      `¿Quieres activar la tienda de ${catalogo.nombre}? Aparecerá en tu catálogo cuando agregues productos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Activar', onPress: () => { activarCatalogo(catalogo.id); recargar(); } },
      ]
    );
  };

  const desactivar = (catalogo: Catalogo) => {
    const count = contarProductosPorCatalogo(catalogo.id);
    if (count > 0) {
      Alert.alert(
        'No se puede desactivar',
        `Esta tienda tiene ${count} producto${count !== 1 ? 's' : ''}. Elimina los productos antes de desactivarla.`
      );
      return;
    }
    Alert.alert(
      `Desactivar ${catalogo.nombre}`,
      'La tienda dejará de aparecer en tu catálogo. Puedes volver a activarla cuando quieras.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: () => {
            const db = SQLite.openDatabaseSync('ventas.db');
            db.runSync('UPDATE catalogos SET activo = 0 WHERE id = ?;', [catalogo.id]);
            recargar();
          },
        },
      ]
    );
  };

  const abrirEdicion = (catalogo: Catalogo) => {
    setEditando(catalogo);
    setNombreEdit(catalogo.nombre);
    setEmojiEdit(catalogo.emoji);
    setFotoEdit(catalogo.foto || '');
  };

  const seleccionarFotoEdicion = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return;
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!resultado.canceled) setFotoEdit(resultado.assets[0].uri);
  };

  const seleccionarFotoNueva = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return;
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!resultado.canceled) setFotoNueva(resultado.assets[0].uri);
  };

  const guardarEdicion = () => {
    if (!editando || !nombreEdit.trim()) return;
    actualizarCatalogo({ ...editando, nombre: nombreEdit.trim(), emoji: emojiEdit.trim(), foto: fotoEdit });
    recargar();
    setEditando(null);
  };

  const crearTienda = () => {
    if (!nombreNueva.trim()) { Alert.alert('Faltan datos', 'El nombre es obligatorio.'); return; }
    const db = SQLite.openDatabaseSync('ventas.db');
    const maxOrden = catalogos.length + 1;
    db.runSync(
      'INSERT INTO catalogos (nombre, emoji, foto, activo, orden) VALUES (?, ?, ?, 1, ?);',
      [nombreNueva.trim(), emojiNueva.trim() || '🏪', fotoNueva, maxOrden]
    );
    recargar();
    setMostrarCrear(false);
    setNombreNueva('');
    setEmojiNueva('🏪');
    setFotoNueva('');
  };

  const activas = catalogos.filter(c => c.activo === 1);
  const inactivas = catalogos.filter(c => c.activo === 0);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Mis tiendas</Text>

      {activas.length > 0 && (
        <>
          <Text style={s.seccion}>Tiendas activas</Text>
          {activas.map(cat => {
            const count = contarProductosPorCatalogo(cat.id);
            return (
              <View key={cat.id} style={s.card}>
                <View style={s.cardLeft}>
                  {cat.foto ? (
                    <Image source={{ uri: cat.foto }} style={s.cardFoto} />
                  ) : (
                    <View style={[s.cardEmoji, s.cardEmojiActivo]}>
                      <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                    </View>
                  )}
                  <View>
                    <Text style={s.cardNombre}>{cat.nombre}</Text>
                    <Text style={s.cardCount}>{count} producto{count !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
                <View style={s.cardBtns}>
                  <Pressable style={s.editBtn} onPress={() => abrirEdicion(cat)}>
                    <Ionicons name="pencil-outline" size={16} color="#5ef0ff" />
                  </Pressable>
                  <Pressable style={s.desactivarBtn} onPress={() => desactivar(cat)}>
                    <Ionicons name="power-outline" size={16} color="#ff6b6b" />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </>
      )}

      {inactivas.length > 0 && (
        <>
          <Text style={s.seccion}>Tiendas disponibles</Text>
          <Text style={s.seccionSub}>Toca una para activarla</Text>
          {inactivas.map(cat => (
            <Pressable key={cat.id} style={[s.card, s.cardInactiva]} onPress={() => activar(cat)}>
              <View style={s.cardLeft}>
                <View style={s.cardEmoji}>
                  <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                </View>
                <Text style={s.cardNombreInactivo}>{cat.nombre}</Text>
              </View>
              <View style={s.activarBtn}>
                <Ionicons name="add-circle-outline" size={20} color="#7c4dff" />
                <Text style={s.activarBtnText}>Activar</Text>
              </View>
            </Pressable>
          ))}
        </>
      )}

      <Pressable style={s.crearBtn} onPress={() => setMostrarCrear(true)}>
        <Ionicons name="add-circle-outline" size={20} color="#00e5ff" />
        <Text style={s.crearBtnText}>Crear tienda personalizada</Text>
      </Pressable>

      {/* Modal editar */}
      <Modal visible={!!editando} transparent animationType="slide" onRequestClose={() => setEditando(null)}>
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <Text style={s.modalTitulo}>Editar tienda</Text>
            <Pressable style={s.fotoBtn} onPress={seleccionarFotoEdicion}>
              {fotoEdit ? (
                <Image source={{ uri: fotoEdit }} style={s.fotoPreview} />
              ) : (
                <View style={s.fotoPlaceholder}>
                  <Text style={{ fontSize: 32 }}>{emojiEdit}</Text>
                  <Text style={s.fotoPlaceholderText}>Tocar para añadir foto</Text>
                </View>
              )}
            </Pressable>
            <Text style={s.fieldLabel}>Nombre</Text>
            <TextInput style={s.input} value={nombreEdit} onChangeText={setNombreEdit} placeholderTextColor="#6b7494" />
            <Text style={s.fieldLabel}>Emoji representativo</Text>
            <TextInput style={s.input} value={emojiEdit} onChangeText={setEmojiEdit} placeholder="Ej: 💊 🔌 🛒" placeholderTextColor="#6b7494" />
            <View style={s.modalBtns}>
              <Pressable style={s.cancelarBtn} onPress={() => setEditando(null)}>
                <Text style={s.cancelarBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={s.guardarBtn} onPress={guardarEdicion}>
                <Text style={s.guardarBtnText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal crear tienda */}
      <Modal visible={mostrarCrear} transparent animationType="slide" onRequestClose={() => setMostrarCrear(false)}>
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <Text style={s.modalTitulo}>Nueva tienda</Text>
            <Pressable style={s.fotoBtn} onPress={seleccionarFotoNueva}>
              {fotoNueva ? (
                <Image source={{ uri: fotoNueva }} style={s.fotoPreview} />
              ) : (
                <View style={s.fotoPlaceholder}>
                  <Text style={{ fontSize: 32 }}>{emojiNueva}</Text>
                  <Text style={s.fotoPlaceholderText}>Tocar para añadir foto</Text>
                </View>
              )}
            </Pressable>
            <Text style={s.fieldLabel}>Nombre de la tienda</Text>
            <TextInput style={s.input} value={nombreNueva} onChangeText={setNombreNueva} placeholder="Ej: Mi tienda de ropa" placeholderTextColor="#6b7494" />
            <Text style={s.fieldLabel}>Emoji representativo</Text>
            <TextInput style={s.input} value={emojiNueva} onChangeText={setEmojiNueva} placeholder="Ej: 👗 🍕 🔧" placeholderTextColor="#6b7494" />
            <View style={s.modalBtns}>
              <Pressable style={s.cancelarBtn} onPress={() => setMostrarCrear(false)}>
                <Text style={s.cancelarBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={s.guardarBtn} onPress={crearTienda}>
                <Text style={s.guardarBtnText}>Crear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 60 },
  title: {
    color: '#fff', fontSize: 22, fontWeight: '500', marginBottom: 24,
    textShadowColor: 'rgba(94,240,255,0.6)', textShadowRadius: 14, textShadowOffset: { width: 0, height: 0 },
  },
  seccion: { color: '#5ef0ff', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, marginTop: 16 },
  seccionSub: { color: '#6b7494', fontSize: 11, marginBottom: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(0,229,255,0.2)', borderWidth: 1,
    borderRadius: 14, padding: 14, marginBottom: 10,
  },
  cardInactiva: { borderColor: 'rgba(255,255,255,0.06)' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardEmoji: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  cardEmojiActivo: { backgroundColor: 'rgba(0,229,255,0.08)', borderColor: 'rgba(0,229,255,0.2)' },
  cardFoto: { width: 48, height: 48, borderRadius: 12 },
  cardNombre: { color: '#fff', fontSize: 14, fontWeight: '500' },
  cardNombreInactivo: { color: '#9aa3c0', fontSize: 14 },
  cardCount: { color: '#5ef0ff', fontSize: 11, marginTop: 2 },
  cardBtns: { flexDirection: 'row', gap: 8 },
  editBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(94,240,255,0.06)', borderColor: 'rgba(94,240,255,0.2)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  desactivarBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,107,107,0.06)', borderColor: 'rgba(255,107,107,0.3)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  activarBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activarBtnText: { color: '#7c4dff', fontSize: 13 },
  crearBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 20, borderColor: 'rgba(0,229,255,0.3)', borderWidth: 1, borderStyle: 'dashed',
    borderRadius: 14, paddingVertical: 14,
  },
  crearBtnText: { color: '#00e5ff', fontSize: 14 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#10162b', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderColor: 'rgba(0,229,255,0.15)', borderWidth: 1, padding: 24, paddingBottom: 40,
  },
  modalTitulo: { color: '#fff', fontSize: 18, fontWeight: '500', marginBottom: 20, textAlign: 'center' },
  fotoBtn: { alignSelf: 'center', marginBottom: 16 },
  fotoPreview: { width: 100, height: 100, borderRadius: 20 },
  fotoPlaceholder: {
    width: 100, height: 100, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(94,240,255,0.15)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  fotoPlaceholderText: { color: '#6b7494', fontSize: 10, textAlign: 'center' },
  fieldLabel: { color: '#6b7494', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(94,240,255,0.15)', borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 14,
  },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 24 },
  cancelarBtn: {
    flex: 1, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  cancelarBtnText: { color: '#6b7494', fontSize: 14 },
  guardarBtn: { flex: 1, backgroundColor: '#00e5ff', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  guardarBtnText: { color: '#06121a', fontSize: 14, fontWeight: '600' },
});