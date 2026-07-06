import { actualizarProducto, CATEGORIAS, eliminarProducto, obtenerProductoPorId, Producto } from '@/database/db';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

export default function ProductoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [nombre, setNombre] = useState('');
  const [gramaje, setGramaje] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0].nombre);
  const [precioCosto, setPrecioCosto] = useState('');
  const [precioProveedor, setPrecioProveedor] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [agotado, setAgotado] = useState(false);
  const [foto, setFoto] = useState('');
  const [mostrarSelector, setMostrarSelector] = useState(false);

  useEffect(() => {
    const p = obtenerProductoPorId(Number(id));
    if (p) {
      setProducto(p);
      setNombre(p.nombre);
      setGramaje(p.gramaje);
      setPresentacion(p.presentacion);
      setCategoria(p.categoria);
      setPrecioCosto(p.precio_costo.toString());
      setPrecioProveedor(p.precio_proveedor.toString());
      setPrecioVenta(p.precio_venta.toString());
      setAgotado(p.agotado === 1);
      setFoto(p.foto || '');
    }
  }, [id]);

  const seleccionarFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!resultado.canceled) setFoto(resultado.assets[0].uri);
  };

  if (!producto) return <View style={styles.container}><Text style={styles.title}>Cargando...</Text></View>;

  const guardar = () => {
    if (!nombre.trim() || !precioVenta.trim()) {
      Alert.alert('Faltan datos', 'El nombre y el precio de venta son obligatorios.');
      return;
    }
    actualizarProducto({
      id: producto.id,
      nombre: nombre.trim(),
      gramaje: gramaje.trim(),
      presentacion: presentacion.trim(),
      categoria,
      precio_costo: parseFloat(precioCosto) || 0,
      precio_proveedor: parseFloat(precioProveedor) || 0,
      precio_venta: parseFloat(precioVenta) || 0,
      agotado: agotado ? 1 : 0,
      foto,
      fecha_creacion: producto.fecha_creacion,
    });
    router.back();
  };

  const confirmarEliminar = () => {
    Alert.alert('Eliminar producto', `¿Seguro que quieres eliminar "${producto.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { eliminarProducto(producto.id); router.back(); } },
    ]);
  };

  const categoriaActual = CATEGORIAS.find(c => c.nombre === categoria) || CATEGORIAS[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Editar producto</Text>

      <Pressable style={styles.fotoContainer} onPress={seleccionarFoto}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.foto} />
        ) : (
          <View style={styles.fotoPlaceholder}>
            <Ionicons name="camera-outline" size={32} color="#6b7494" />
            <Text style={styles.fotoPlaceholderText}>Agregar foto</Text>
          </View>
        )}
      </Pressable>

      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} placeholderTextColor="#6b7494" value={nombre} onChangeText={setNombre} />

      <Text style={styles.label}>Gramaje / Concentración</Text>
      <TextInput style={styles.input} placeholder="Ej: 500mg, 10ml..." placeholderTextColor="#6b7494" value={gramaje} onChangeText={setGramaje} />

      <Text style={styles.label}>Presentación</Text>
      <TextInput style={styles.input} placeholder="Ej: Blister x10, Ampolla..." placeholderTextColor="#6b7494" value={presentacion} onChangeText={setPresentacion} />

      <Text style={styles.label}>Categoría</Text>
      <Pressable style={styles.selector} onPress={() => setMostrarSelector(true)}>
        <View style={styles.selectorLeft}>
          <Ionicons name={categoriaActual.icono as any} size={18} color="#5ef0ff" style={{ marginRight: 8 }} />
          <Text style={styles.selectorText}>{categoria}</Text>
        </View>
        <Text style={styles.selectorIcon}>▾</Text>
      </Pressable>

      <Modal visible={mostrarSelector} transparent animationType="fade" onRequestClose={() => setMostrarSelector(false)}>
        <Pressable style={styles.overlay} onPress={() => setMostrarSelector(false)}>
          <View style={styles.menu}>
            <FlatList
              data={CATEGORIAS}
              keyExtractor={(item) => item.nombre}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.menuItem, categoria === item.nombre && styles.menuItemActivo]}
                  onPress={() => { setCategoria(item.nombre); setMostrarSelector(false); }}
                >
                  <Ionicons name={item.icono as any} size={18} color={categoria === item.nombre ? '#5ef0ff' : '#6b7494'} style={{ marginRight: 10 }} />
                  <Text style={[styles.menuItemText, categoria === item.nombre && styles.menuItemTextActivo]}>{item.nombre}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      <Text style={styles.label}>Precios</Text>
      <View style={styles.preciosGrid}>
        <View style={styles.precioItem}>
          <Text style={styles.precioLabel}>💰 Costo</Text>
          <TextInput style={styles.input} placeholderTextColor="#6b7494" keyboardType="numeric" value={precioCosto} onChangeText={setPrecioCosto} />
        </View>
        <View style={styles.precioItem}>
          <Text style={styles.precioLabel}>🏪 Proveedora</Text>
          <TextInput style={styles.input} placeholderTextColor="#6b7494" keyboardType="numeric" value={precioProveedor} onChangeText={setPrecioProveedor} />
        </View>
        <View style={styles.precioItem}>
          <Text style={styles.precioLabel}>🏷️ Mi precio</Text>
          <TextInput style={styles.input} placeholderTextColor="#6b7494" keyboardType="numeric" value={precioVenta} onChangeText={setPrecioVenta} />
        </View>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Marcar como agotado</Text>
        <Switch value={agotado} onValueChange={setAgotado} trackColor={{ false: '#2a3050', true: '#7c4dff' }} thumbColor="#fff" />
      </View>

      <Pressable style={styles.button} onPress={guardar}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={confirmarEliminar}>
        <Text style={styles.deleteText}>Eliminar producto</Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  content: { padding: 20, paddingTop: 30, paddingBottom: 50 },
  title: {
    color: '#fff', fontSize: 22, fontWeight: '500', marginBottom: 20,
    textShadowColor: 'rgba(94,240,255,0.6)', textShadowRadius: 14, textShadowOffset: { width: 0, height: 0 },
  },
  fotoContainer: { alignSelf: 'center', marginBottom: 10 },
  foto: { width: 110, height: 110, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,229,255,0.3)' },
  fotoPlaceholder: {
    width: 110, height: 110, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(94,240,255,0.15)',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  fotoPlaceholderText: { color: '#6b7494', fontSize: 11 },
  label: { color: '#6b7494', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(94,240,255,0.15)', borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 14,
  },
  selector: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,229,255,0.25)', borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
  },
  selectorLeft: { flexDirection: 'row', alignItems: 'center' },
  selectorText: { color: '#5ef0ff', fontSize: 14, fontWeight: '500' },
  selectorIcon: { color: '#5ef0ff', fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 30 },
  menu: {
    backgroundColor: '#10162b', borderRadius: 16, borderColor: 'rgba(0,229,255,0.2)',
    borderWidth: 1, maxHeight: 400, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 18,
    borderBottomColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1,
  },
  menuItemActivo: { backgroundColor: 'rgba(0,229,255,0.08)' },
  menuItemText: { color: '#9aa3c0', fontSize: 14 },
  menuItemTextActivo: { color: '#5ef0ff', fontWeight: '600' },
  preciosGrid: { flexDirection: 'row', gap: 8 },
  precioItem: { flex: 1 },
  precioLabel: { color: '#6b7494', fontSize: 11, marginBottom: 4 },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 24, padding: 14, backgroundColor: 'rgba(124,77,255,0.06)',
    borderColor: 'rgba(124,77,255,0.2)', borderWidth: 1, borderRadius: 12,
  },
  switchLabel: { color: '#cbb8ff', fontSize: 13 },
  button: {
    marginTop: 28, backgroundColor: '#00e5ff', borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    shadowColor: '#7c4dff', shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
  },
  buttonText: { color: '#06121a', fontSize: 14, fontWeight: '600' },
  deleteButton: {
    marginTop: 12, borderColor: 'rgba(255,90,90,0.3)', borderWidth: 1,
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  deleteText: { color: '#ff6b6b', fontSize: 13 },
  cancelButton: { marginTop: 8, alignItems: 'center', paddingVertical: 10 },
  cancelText: { color: '#6b7494', fontSize: 13 },
});