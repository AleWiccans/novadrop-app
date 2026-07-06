import { insertarPedido, ItemPedido, obtenerProductosDisponibles, Producto } from '@/database/db';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const RECARGOS = [0, 5, 10, 15, 20, 25, 30, 40, 50];

export default function NuevoPedidoScreen() {
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [conseguidoPor, setConseguidoPor] = useState<'yo' | 'proveedora'>('yo');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [items, setItems] = useState<ItemPedido[]>([]);
  const [domicilio, setDomicilio] = useState('');
  const [tieneDomicilio, setTieneDomicilio] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [recargo, setRecargo] = useState(0);
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [mostrarRecargo, setMostrarRecargo] = useState(false);
  const [mostrarContactos, setMostrarContactos] = useState(false);
  const [contactos, setContactos] = useState<Contacts.Contact[]>([]);
  const [busquedaContacto, setBusquedaContacto] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');

  useEffect(() => {
    setProductos(obtenerProductosDisponibles());
    const hoy = new Date();
    setFechaEntrega(`${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}`);
  }, []);

  const abrirContactos = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus contactos.');
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
    });
    const conTelefono = data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0);
    conTelefono.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    setContactos(conTelefono);
    setBusquedaContacto('');
    setMostrarContactos(true);
  };

  const seleccionarContacto = (contacto: Contacts.Contact) => {
    setClienteNombre(contacto.name || '');
    setClienteTelefono(contacto.phoneNumbers?.[0]?.number || '');
    setMostrarContactos(false);
  };

  const contactosFiltrados = contactos.filter(c =>
    c.name?.toLowerCase().includes(busquedaContacto.toLowerCase())
  );

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    p.gramaje.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  const agregarItem = (producto: Producto) => {
    const existe = items.find(i => i.producto_id === producto.id);
    if (existe) {
      setItems(items.map(i =>
        i.producto_id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
      ));
    } else {
      setItems([...items, {
        producto_id: producto.id,
        nombre: producto.nombre,
        gramaje: producto.gramaje,
        precio_costo: producto.precio_costo,
        precio_proveedor: producto.precio_proveedor,
        precio_venta: producto.precio_venta,
        cantidad: 1,
      }]);
    }
    setMostrarProductos(false);
    setBusquedaProducto('');
  };

  const cambiarCantidad = (producto_id: number, cantidad: number) => {
    if (cantidad <= 0) {
      setItems(items.filter(i => i.producto_id !== producto_id));
    } else {
      setItems(items.map(i => i.producto_id === producto_id ? { ...i, cantidad } : i));
    }
  };

  const getPrecioVenta = (item: ItemPedido) =>
    conseguidoPor === 'proveedora' ? item.precio_proveedor : item.precio_venta;

  const subtotal = items.reduce((acc, i) => acc + getPrecioVenta(i) * i.cantidad, 0);
  const domicilioNum = tieneDomicilio ? (parseFloat(domicilio) || 0) : 0;
  const recargoMonto = metodoPago === 'transferencia' ? subtotal * recargo / 100 : 0;
  const total = subtotal + domicilioNum + recargoMonto;

  const guardarPedido = () => {
    if (items.length === 0) {
      Alert.alert('Sin productos', 'Agrega al menos un producto al pedido.');
      return;
    }
    const id = insertarPedido({
  cliente_nombre: clienteNombre.trim(),
  cliente_telefono: clienteTelefono.trim(),
  direccion: direccion.trim(),
  items: JSON.stringify(items),
  subtotal,
  domicilio: domicilioNum,
  metodo_pago: metodoPago,
  recargo_porcentaje: recargo,
  total,
  conseguido_por: conseguidoPor,
  fecha_entrega: fechaEntrega,
  fecha: new Date().toISOString(),
  realizado: 0,
});
    router.replace(`/pedido?id=${id}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nuevo pedido</Text>

      {/* ¿Quién consiguió? */}
      <Text style={styles.label}>¿Quién consiguió el pedido?</Text>
      <View style={styles.metodosRow}>
        <Pressable
          style={[styles.metodoBtn, conseguidoPor === 'yo' && styles.metodoBtnActivo]}
          onPress={() => setConseguidoPor('yo')}
        >
          <Ionicons name="person-outline" size={18} color={conseguidoPor === 'yo' ? '#06121a' : '#9aa3c0'} />
          <Text style={[styles.metodoBtnText, conseguidoPor === 'yo' && styles.metodoBtnTextActivo]}>Yo</Text>
        </Pressable>
        <Pressable
          style={[styles.metodoBtn, conseguidoPor === 'proveedora' && styles.metodoBtnActivo]}
          onPress={() => setConseguidoPor('proveedora')}
        >
          <Ionicons name="people-outline" size={18} color={conseguidoPor === 'proveedora' ? '#06121a' : '#9aa3c0'} />
          <Text style={[styles.metodoBtnText, conseguidoPor === 'proveedora' && styles.metodoBtnTextActivo]}>Proveedora</Text>
        </Pressable>
      </View>

      {conseguidoPor === 'proveedora' && (
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={14} color="#a78bfa" />
          <Text style={styles.infoBoxText}>
            Se usará el precio de la proveedora. Tu ganancia será solo el domicilio.
          </Text>
        </View>
      )}

      {/* Cliente */}
      <Text style={styles.label}>Cliente</Text>
      <View style={styles.clienteRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Nombre (opcional)"
          placeholderTextColor="#6b7494"
          value={clienteNombre}
          onChangeText={setClienteNombre}
        />
        <Pressable style={styles.contactoBtn} onPress={abrirContactos}>
          <Ionicons name="person-add-outline" size={20} color="#5ef0ff" />
        </Pressable>
      </View>

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        placeholder="Opcional"
        placeholderTextColor="#6b7494"
        keyboardType="phone-pad"
        value={clienteTelefono}
        onChangeText={setClienteTelefono}
      />

      <Text style={styles.label}>Fecha de entrega</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        placeholderTextColor="#6b7494"
        value={fechaEntrega}
        onChangeText={setFechaEntrega}
      />

      {/* Productos */}
      <Text style={styles.label}>Productos</Text>
      {items.map(item => (
        <View key={item.producto_id} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemNombre}>{item.nombre} {item.gramaje}</Text>
            <Text style={styles.itemPrecio}>${getPrecioVenta(item)} c/u</Text>
          </View>
          <View style={styles.cantidadRow}>
            <Pressable style={styles.cantBtn} onPress={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}>
              <Text style={styles.cantBtnText}>−</Text>
            </Pressable>
            <Text style={styles.cantNum}>{item.cantidad}</Text>
            <Pressable style={styles.cantBtn} onPress={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}>
              <Text style={styles.cantBtnText}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.itemTotal}>${getPrecioVenta(item) * item.cantidad}</Text>
        </View>
      ))}

      <Pressable style={styles.addBtn} onPress={() => { setBusquedaProducto(''); setMostrarProductos(true); }}>
        <Ionicons name="add-circle-outline" size={18} color="#5ef0ff" />
        <Text style={styles.addBtnText}>Seleccionar producto</Text>
      </Pressable>

      {/* Método de pago */}
      <Text style={styles.label}>Método de pago</Text>
      <View style={styles.metodosRow}>
        <Pressable
          style={[styles.metodoBtn, metodoPago === 'efectivo' && styles.metodoBtnActivo]}
          onPress={() => setMetodoPago('efectivo')}
        >
          <Ionicons name="cash-outline" size={18} color={metodoPago === 'efectivo' ? '#06121a' : '#9aa3c0'} />
          <Text style={[styles.metodoBtnText, metodoPago === 'efectivo' && styles.metodoBtnTextActivo]}>Efectivo</Text>
        </Pressable>
        <Pressable
          style={[styles.metodoBtn, metodoPago === 'transferencia' && styles.metodoBtnActivo]}
          onPress={() => setMetodoPago('transferencia')}
        >
          <Ionicons name="phone-portrait-outline" size={18} color={metodoPago === 'transferencia' ? '#06121a' : '#9aa3c0'} />
          <Text style={[styles.metodoBtnText, metodoPago === 'transferencia' && styles.metodoBtnTextActivo]}>Transferencia</Text>
        </Pressable>
      </View>

      {metodoPago === 'transferencia' && (
        <>
          <Text style={styles.label}>Recargo por transferencia</Text>
          <Pressable style={styles.selector} onPress={() => setMostrarRecargo(true)}>
            <Text style={styles.selectorText}>{recargo === 0 ? 'Sin recargo' : `+${recargo}%`}</Text>
            <Text style={styles.selectorIcon}>▾</Text>
          </Pressable>
        </>
      )}

      {/* Domicilio */}
      <Text style={styles.label}>Domicilio</Text>
      <Pressable
        style={[styles.domicilioToggle, tieneDomicilio && styles.domicilioToggleActivo]}
        onPress={() => { setTieneDomicilio(!tieneDomicilio); if (tieneDomicilio) { setDomicilio(''); setDireccion(''); } }}
      >
        <Ionicons name={tieneDomicilio ? "checkmark-circle" : "ellipse-outline"} size={20} color={tieneDomicilio ? '#06121a' : '#6b7494'} />
        <Text style={[styles.domicilioToggleText, tieneDomicilio && styles.domicilioToggleTextActivo]}>
          {tieneDomicilio ? 'Con domicilio' : 'Sin domicilio'}
        </Text>
      </Pressable>

      {tieneDomicilio && (
        <>
          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            placeholder="Dirección del cliente"
            placeholderTextColor="#6b7494"
            value={direccion}
            onChangeText={setDireccion}
            multiline
          />
          <Text style={styles.label}>Precio del domicilio</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 150"
            placeholderTextColor="#6b7494"
            keyboardType="numeric"
            value={domicilio}
            onChangeText={setDomicilio}
          />
        </>
      )}

      {/* Resumen */}
      <View style={styles.resumen}>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Subtotal</Text>
          <Text style={styles.resumenValor}>${subtotal}</Text>
        </View>
        {domicilioNum > 0 && (
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Domicilio</Text>
            <Text style={styles.resumenValor}>${domicilioNum}</Text>
          </View>
        )}
        {recargoMonto > 0 && (
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Recargo ({recargo}%)</Text>
            <Text style={styles.resumenValor}>${recargoMonto.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.resumenRow, styles.resumenTotal]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>${total.toFixed(2)}</Text>
        </View>
        {conseguidoPor === 'proveedora' && (
          <Text style={styles.gananciaNote}>
            Tu ganancia: ${domicilioNum} (solo domicilio)
          </Text>
        )}
        {conseguidoPor === 'yo' && (
          <Text style={styles.gananciaNote}>
            Tu ganancia: ${(total - domicilioNum - items.reduce((a, i) => a + i.precio_costo * i.cantidad, 0)).toFixed(2)}
          </Text>
        )}
      </View>

      <Pressable style={styles.button} onPress={guardarPedido}>
        <Text style={styles.buttonText}>Guardar pedido</Text>
      </Pressable>
      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </Pressable>

      {/* Modal productos */}
      <Modal visible={mostrarProductos} transparent animationType="slide" onRequestClose={() => setMostrarProductos(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar producto</Text>
            <Pressable onPress={() => setMostrarProductos(false)}>
              <Ionicons name="close" size={22} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.busquedaContainer}>
            <Ionicons name="search-outline" size={16} color="#6b7494" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.busquedaInput}
              placeholder="Buscar medicamento..."
              placeholderTextColor="#6b7494"
              value={busquedaProducto}
              onChangeText={setBusquedaProducto}
            />
          </View>
          <FlatList
            data={productosFiltrados}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable style={styles.productoItem} onPress={() => agregarItem(item)}>
                {item.foto ? (
                  <Image source={{ uri: item.foto }} style={styles.productoFoto} />
                ) : (
                  <View style={styles.productoFotoPlaceholder}>
                    <Ionicons name="cube-outline" size={20} color="#6b7494" />
                  </View>
                )}
                <View style={styles.productoInfo}>
                  <Text style={styles.productoNombre}>{item.nombre} {item.gramaje}</Text>
                  <Text style={styles.productoDetalle}>{item.presentacion}</Text>
                </View>
                <Text style={styles.productoPrecio}>
                  ${conseguidoPor === 'proveedora' ? item.precio_proveedor : item.precio_venta}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={{ color: '#6b7494', textAlign: 'center', padding: 20 }}>
                No se encontraron productos
              </Text>
            }
          />
        </View>
      </Modal>

      {/* Modal recargo */}
      <Modal visible={mostrarRecargo} transparent animationType="fade" onRequestClose={() => setMostrarRecargo(false)}>
        <Pressable style={styles.overlay} onPress={() => setMostrarRecargo(false)}>
          <View style={styles.menu}>
            <FlatList
              data={RECARGOS}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.menuItem, recargo === item && styles.menuItemActivo]}
                  onPress={() => { setRecargo(item); setMostrarRecargo(false); }}
                >
                  <Text style={[styles.menuItemText, recargo === item && styles.menuItemTextActivo]}>
                    {item === 0 ? 'Sin recargo' : `+${item}%`}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Modal contactos */}
      <Modal visible={mostrarContactos} transparent animationType="slide" onRequestClose={() => setMostrarContactos(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar contacto</Text>
            <Pressable onPress={() => setMostrarContactos(false)}>
              <Ionicons name="close" size={22} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.busquedaContainer}>
            <Ionicons name="search-outline" size={16} color="#6b7494" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.busquedaInput}
              placeholder="Buscar contacto..."
              placeholderTextColor="#6b7494"
              value={busquedaContacto}
              onChangeText={setBusquedaContacto}
            />
          </View>
          <FlatList
            data={contactosFiltrados}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable style={styles.contactoItem} onPress={() => seleccionarContacto(item)}>
                <View style={styles.contactoAvatar}>
                  <Text style={styles.contactoAvatarText}>
                    {(item.name || '?')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.contactoInfo}>
                  <Text style={styles.contactoNombre}>{item.name}</Text>
                  <Text style={styles.contactoTelefono}>{item.phoneNumbers?.[0]?.number}</Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  content: { padding: 20, paddingTop: 30, paddingBottom: 60 },
  title: {
    color: '#fff', fontSize: 22, fontWeight: '500', marginBottom: 20,
    textShadowColor: 'rgba(94,240,255,0.6)', textShadowRadius: 14, textShadowOffset: { width: 0, height: 0 },
  },
  label: { color: '#6b7494', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(94,240,255,0.15)', borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 14,
  },
  clienteRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  contactoBtn: {
    width: 46, height: 46, borderRadius: 10, backgroundColor: 'rgba(94,240,255,0.06)',
    borderColor: 'rgba(94,240,255,0.2)', borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8,
    padding: 10, backgroundColor: 'rgba(124,77,255,0.06)',
    borderColor: 'rgba(124,77,255,0.2)', borderWidth: 1, borderRadius: 8,
  },
  infoBoxText: { color: '#cbb8ff', fontSize: 12, flex: 1 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderRadius: 12, padding: 12, marginBottom: 8,
  },
  itemInfo: { flex: 1 },
  itemNombre: { color: '#fff', fontSize: 13, fontWeight: '500' },
  itemPrecio: { color: '#6b7494', fontSize: 11, marginTop: 2 },
  cantidadRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 10 },
  cantBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,229,255,0.1)', borderColor: 'rgba(0,229,255,0.3)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  cantBtnText: { color: '#00e5ff', fontSize: 16, fontWeight: '600' },
  cantNum: { color: '#fff', fontSize: 14, fontWeight: '500', minWidth: 20, textAlign: 'center' },
  itemTotal: { color: '#00e5ff', fontSize: 14, fontWeight: '500' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderColor: 'rgba(94,240,255,0.3)', borderWidth: 1, borderStyle: 'dashed',
    borderRadius: 12, padding: 12, justifyContent: 'center', marginTop: 4,
  },
  addBtnText: { color: '#5ef0ff', fontSize: 13 },
  metodosRow: { flexDirection: 'row', gap: 10 },
  metodoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    borderRadius: 10, paddingVertical: 12,
  },
  metodoBtnActivo: { backgroundColor: '#00e5ff', borderColor: '#00e5ff' },
  metodoBtnText: { color: '#9aa3c0', fontSize: 13, fontWeight: '500' },
  metodoBtnTextActivo: { color: '#06121a' },
  selector: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,229,255,0.25)', borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
  },
  selectorText: { color: '#5ef0ff', fontSize: 14, fontWeight: '500' },
  selectorIcon: { color: '#5ef0ff', fontSize: 14 },
  domicilioToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
  },
  domicilioToggleActivo: { backgroundColor: '#00e5ff', borderColor: '#00e5ff' },
  domicilioToggleText: { color: '#9aa3c0', fontSize: 13, fontWeight: '500' },
  domicilioToggleTextActivo: { color: '#06121a' },
  resumen: {
    marginTop: 20, backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderRadius: 14, padding: 14,
  },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resumenLabel: { color: '#9aa3c0', fontSize: 13 },
  resumenValor: { color: '#fff', fontSize: 13 },
  resumenTotal: { borderTopColor: 'rgba(255,255,255,0.08)', borderTopWidth: 1, paddingTop: 10, marginTop: 4, marginBottom: 6 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '500' },
  totalValor: {
    color: '#00e5ff', fontSize: 24, fontWeight: '500',
    textShadowColor: 'rgba(0,229,255,0.6)', textShadowRadius: 10, textShadowOffset: { width: 0, height: 0 },
  },
  gananciaNote: { color: '#7c4dff', fontSize: 12, marginTop: 4, textAlign: 'right' },
  button: {
    marginTop: 20, backgroundColor: '#00e5ff', borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    shadowColor: '#7c4dff', shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
  },
  buttonText: { color: '#06121a', fontSize: 14, fontWeight: '600' },
  cancelButton: { marginTop: 10, alignItems: 'center', paddingVertical: 10 },
  cancelText: { color: '#6b7494', fontSize: 13 },
  modalContainer: {
    flex: 1, backgroundColor: '#0a0e1a', marginTop: 80,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderColor: 'rgba(0,229,255,0.15)', borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18, borderBottomColor: 'rgba(255,255,255,0.06)', borderBottomWidth: 1,
  },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '500' },
  busquedaContainer: {
    flexDirection: 'row', alignItems: 'center',
    margin: 14, backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(94,240,255,0.15)', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
  },
  busquedaInput: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 10 },
  productoItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1,
  },
  productoFoto: { width: 44, height: 44, borderRadius: 8, marginRight: 12 },
  productoFotoPlaceholder: {
    width: 44, height: 44, borderRadius: 8, marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center',
  },
  productoInfo: { flex: 1 },
  productoNombre: { color: '#fff', fontSize: 14, fontWeight: '500' },
  productoDetalle: { color: '#6b7494', fontSize: 12, marginTop: 2 },
  productoPrecio: { color: '#00e5ff', fontSize: 14, fontWeight: '500' },
  contactoItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1,
  },
  contactoAvatar: {
    width: 40, height: 40, borderRadius: 20, marginRight: 12,
    backgroundColor: 'rgba(0,229,255,0.1)', borderColor: 'rgba(0,229,255,0.3)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  contactoAvatarText: { color: '#00e5ff', fontSize: 16, fontWeight: '600' },
  contactoInfo: { flex: 1 },
  contactoNombre: { color: '#fff', fontSize: 14, fontWeight: '500' },
  contactoTelefono: { color: '#6b7494', fontSize: 12, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 30 },
  menu: {
    backgroundColor: '#10162b', borderRadius: 16, borderColor: 'rgba(0,229,255,0.2)',
    borderWidth: 1, maxHeight: 300, overflow: 'hidden',
  },
  menuItem: { paddingVertical: 14, paddingHorizontal: 18, borderBottomColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1 },
  menuItemActivo: { backgroundColor: 'rgba(0,229,255,0.08)' },
  menuItemText: { color: '#9aa3c0', fontSize: 14 },
  menuItemTextActivo: { color: '#5ef0ff', fontWeight: '600' },
});