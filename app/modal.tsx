import { ATRIBUTOS_POR_CATEGORIA, CATEGORIAS_POR_CATALOGO, insertarProducto } from '@/database/db';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ModalScreen() {
  const params = useLocalSearchParams<{ catalogo_id: string; catalogo_nombre: string }>();
  const catalogoId = parseInt(params.catalogo_id || '1');
  const catalogoNombre = decodeURIComponent(params.catalogo_nombre || 'Medicamentos');

  const [nombre, setNombre] = useState('');
  const [gramaje, setGramaje] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precioCosto, setPrecioCosto] = useState('');
  const [precioProveedor, setPrecioProveedor] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [foto, setFoto] = useState('');
  const [atributos, setAtributos] = useState<{ nombre: string; valor: string }[]>([]);
  const [mostrarCategoria, setMostrarCategoria] = useState(false);

  const esMedicamento = catalogoNombre === 'Medicamentos';
  const categoriasDeCatalogo = CATEGORIAS_POR_CATALOGO[catalogoNombre] || [];

  useEffect(() => {
    if (categoriasDeCatalogo.length > 0) {
      setCategoria(categoriasDeCatalogo[0].nombre);
    }
  }, []);

  useEffect(() => {
    if (categoria && !esMedicamento) {
      const predefinidos = ATRIBUTOS_POR_CATEGORIA[categoria] || [];
      setAtributos(predefinidos.map(n => ({ nombre: n, valor: '' })));
    } else {
      setAtributos([]);
    }
  }, [categoria]);

  const seleccionarFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.'); return; }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!resultado.canceled) setFoto(resultado.assets[0].uri);
  };

  const actualizarNombreAtributo = (index: number, valor: string) => {
    const nuevos = [...atributos];
    nuevos[index].nombre = valor;
    setAtributos(nuevos);
  };

  const actualizarValorAtributo = (index: number, valor: string) => {
    const nuevos = [...atributos];
    nuevos[index].valor = valor;
    setAtributos(nuevos);
  };

  const guardar = () => {
    if (!nombre.trim() || !precioVenta.trim()) {
      Alert.alert('Faltan datos', 'El nombre y el precio de venta son obligatorios.');
      return;
    }
    const atributosFiltrados = atributos.filter(a => a.nombre.trim() && a.valor.trim());
    insertarProducto({
      nombre: nombre.trim(),
      gramaje: gramaje.trim(),
      presentacion: presentacion.trim(),
      categoria,
      precio_costo: parseFloat(precioCosto) || 0,
      precio_proveedor: parseFloat(precioProveedor) || 0,
      precio_venta: parseFloat(precioVenta) || 0,
      agotado: 0,
      foto,
      catalogo_id: catalogoId,
      atributos: JSON.stringify(atributosFiltrados),
    });
    router.dismissTo('/');
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Indicador de tienda */}
      <View style={s.tiendaBadge}>
        <Text style={s.tiendaBadgeText}>
          Agregando a: {catalogoNombre}
        </Text>
      </View>

      <Text style={s.title}>Nuevo producto</Text>

      <Pressable style={s.fotoBtn} onPress={seleccionarFoto}>
        {foto ? <Image source={{ uri: foto }} style={s.foto} /> : (
          <View style={s.fotoPlaceholder}>
            <Ionicons name="camera-outline" size={32} color="#6b7494" />
            <Text style={s.fotoPlaceholderText}>Agregar foto</Text>
          </View>
        )}
      </Pressable>

      <Text style={s.label}>Nombre</Text>
      <TextInput
        style={s.input}
        placeholder={esMedicamento ? 'Ej: Amoxicilina' : 'Nombre del producto'}
        placeholderTextColor="#6b7494"
        value={nombre}
        onChangeText={setNombre}
      />

      {esMedicamento && (
        <>
          <Text style={s.label}>Gramaje / Concentración</Text>
          <TextInput style={s.input} placeholder="Ej: 500mg, 10ml..." placeholderTextColor="#6b7494" value={gramaje} onChangeText={setGramaje} />
          <Text style={s.label}>Presentación</Text>
          <TextInput style={s.input} placeholder="Ej: Blister x10, Ampolla..." placeholderTextColor="#6b7494" value={presentacion} onChangeText={setPresentacion} />
        </>
      )}

      <Text style={s.label}>Categoría</Text>
      <Pressable style={s.selector} onPress={() => setMostrarCategoria(true)}>
        <Text style={s.selectorText}>{categoria || 'Seleccionar categoría'}</Text>
        <Text style={s.selectorArrow}>▾</Text>
      </Pressable>

      {/* Características */}
      {atributos.length > 0 && (
        <>
          <Text style={s.label}>Características</Text>
          {atributos.map((attr, i) => (
            <View key={i} style={s.atributoRow}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={attr.nombre}
                onChangeText={v => actualizarNombreAtributo(i, v)}
                placeholder="Característica"
                placeholderTextColor="#6b7494"
              />
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={attr.valor}
                onChangeText={v => actualizarValorAtributo(i, v)}
                placeholder="Valor"
                placeholderTextColor="#6b7494"
              />
              <Pressable onPress={() => setAtributos(atributos.filter((_, idx) => idx !== i))} style={s.deleteAttr}>
                <Ionicons name="close" size={16} color="#ff6b6b" />
              </Pressable>
            </View>
          ))}
        </>
      )}

      <Pressable style={s.addAttrBtn} onPress={() => setAtributos([...atributos, { nombre: '', valor: '' }])}>
        <Ionicons name="add-circle-outline" size={16} color="#5ef0ff" />
        <Text style={s.addAttrText}>Agregar característica propia</Text>
      </Pressable>

      {!esMedicamento && (
        <>
          <Text style={s.label}>Presentación / Unidad</Text>
          <TextInput style={s.input} placeholder="Ej: Unidad, Kg, Litro, Paquete..." placeholderTextColor="#6b7494" value={presentacion} onChangeText={setPresentacion} />
        </>
      )}

      <Text style={s.label}>Precios</Text>
      <View style={s.preciosRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.precioLabel}>💰 Costo</Text>
          <TextInput style={s.input} placeholder="0" placeholderTextColor="#6b7494" keyboardType="numeric" value={precioCosto} onChangeText={setPrecioCosto} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.precioLabel}>🏪 Proveedora</Text>
          <TextInput style={s.input} placeholder="0" placeholderTextColor="#6b7494" keyboardType="numeric" value={precioProveedor} onChangeText={setPrecioProveedor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.precioLabel}>🏷️ Mi precio</Text>
          <TextInput style={s.input} placeholder="0" placeholderTextColor="#6b7494" keyboardType="numeric" value={precioVenta} onChangeText={setPrecioVenta} />
        </View>
      </View>

      <Pressable style={s.button} onPress={guardar}>
        <Text style={s.buttonText}>Guardar producto</Text>
      </Pressable>
      <Pressable style={s.cancelBtn} onPress={() => router.dismissTo('/')}>
        <Text style={s.cancelBtnText}>Cancelar</Text>
      </Pressable>

      <Modal visible={mostrarCategoria} transparent animationType="fade" onRequestClose={() => setMostrarCategoria(false)}>
        <Pressable style={s.overlay} onPress={() => setMostrarCategoria(false)}>
          <View style={s.menu}>
            <FlatList
              data={categoriasDeCatalogo}
              keyExtractor={item => item.nombre}
              renderItem={({ item }) => (
                <Pressable
                  style={[s.menuItem, categoria === item.nombre && s.menuItemActivo]}
                  onPress={() => { setCategoria(item.nombre); setMostrarCategoria(false); }}
                >
                  <Ionicons name={(item.icono || 'cube-outline') as any} size={18} color={categoria === item.nombre ? '#5ef0ff' : '#6b7494'} style={{ marginRight: 10 }} />
                  <Text style={[s.menuItemText, categoria === item.nombre && s.menuItemTextActivo]}>{item.nombre}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  content: { padding: 20, paddingTop: 20, paddingBottom: 50 },
  tiendaBadge: {
    backgroundColor: 'rgba(0,229,255,0.08)', borderColor: 'rgba(0,229,255,0.2)', borderWidth: 1,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 16,
  },
  tiendaBadgeText: { color: '#5ef0ff', fontSize: 12 },
  title: {
    color: '#fff', fontSize: 22, fontWeight: '500', marginBottom: 20,
    textShadowColor: 'rgba(94,240,255,0.6)', textShadowRadius: 14, textShadowOffset: { width: 0, height: 0 },
  },
  fotoBtn: { alignSelf: 'center', marginBottom: 10 },
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
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,229,255,0.25)', borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
  },
  selectorText: { flex: 1, color: '#5ef0ff', fontSize: 14, fontWeight: '500' },
  selectorArrow: { color: '#5ef0ff', fontSize: 14 },
  atributoRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  deleteAttr: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  addAttrBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 4,
    borderColor: 'rgba(94,240,255,0.3)', borderWidth: 1, borderStyle: 'dashed',
    borderRadius: 10, padding: 10, justifyContent: 'center',
  },
  addAttrText: { color: '#5ef0ff', fontSize: 13 },
  preciosRow: { flexDirection: 'row', gap: 8 },
  precioLabel: { color: '#6b7494', fontSize: 11, marginBottom: 4 },
  button: {
    marginTop: 28, backgroundColor: '#00e5ff', borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    shadowColor: '#7c4dff', shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
  },
  buttonText: { color: '#06121a', fontSize: 14, fontWeight: '600' },
  cancelBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { color: '#6b7494', fontSize: 13 },
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
});