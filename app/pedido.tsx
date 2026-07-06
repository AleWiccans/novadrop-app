import { eliminarPedido, ItemPedido, obtenerPedidoPorId, Pedido } from '@/database/db';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PedidoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [items, setItems] = useState<ItemPedido[]>([]);

  useEffect(() => {
    const p = obtenerPedidoPorId(Number(id));
    if (p) {
      setPedido(p);
      setItems(JSON.parse(p.items));
    }
  }, [id]);

  if (!pedido) return <View style={styles.container}><Text style={styles.title}>Cargando...</Text></View>;

  const getPrecioVenta = (item: ItemPedido) =>
    pedido.conseguido_por === 'proveedora' ? item.precio_proveedor : item.precio_venta;

  const enviarWhatsApp = async (mensaje: string, telefono?: string) => {
    const texto = encodeURIComponent(mensaje);
    let url = '';
    if (telefono && telefono.trim()) {
      const tel = telefono.replace(/\D/g, '');
      url = `whatsapp://send?phone=${tel}&text=${texto}`;
    } else {
      url = `whatsapp://send?text=${texto}`;
    }
    const puede = await Linking.canOpenURL(url);
    if (puede) {
      await Linking.openURL(url);
    } else {
      Alert.alert('WhatsApp no disponible', 'No se pudo abrir WhatsApp.');
    }
  };

  const compartirCliente = async () => {
    let msg = `¡Hola! Aquí está el resumen de tu pedido:\n`;
    if (pedido.cliente_nombre) msg += `*Cliente:* ${pedido.cliente_nombre}\n`;
    if (pedido.cliente_telefono) msg += `*Teléfono:* ${pedido.cliente_telefono}\n`;
    if (pedido.fecha_entrega) msg += `*Fecha de Entrega:* ${pedido.fecha_entrega}\n`;
    msg += `*Productos:*\n`;
    items.forEach(item => {
      const precio = getPrecioVenta(item);
      if (item.cantidad > 1) {
        msg += `• ${item.cantidad}x ${item.nombre}${item.gramaje ? ' ' + item.gramaje : ''} ($${precio} c/u) - $${(precio * item.cantidad).toFixed(0)}\n`;
      } else {
        msg += `• ${item.nombre}${item.gramaje ? ' ' + item.gramaje : ''} - $${precio}\n`;
      }
    });
    if (pedido.domicilio > 0) {
      if (pedido.direccion) msg += `*Domicilio:* ${pedido.direccion}\n`;
      msg += `*Precio envío:* $${pedido.domicilio.toFixed(0)}\n`;
    }
    if (pedido.recargo_porcentaje > 0) {
      msg += `*Recargo transferencia (${pedido.recargo_porcentaje}%):* $${(pedido.subtotal * pedido.recargo_porcentaje / 100).toFixed(0)}\n`;
    }
    msg += `*TOTAL: $${pedido.total.toFixed(0)}*\n`;
    msg += `¡Gracias por tu compra! 🎉`;
    await enviarWhatsApp(msg, pedido.cliente_telefono);
  };

  const compartirProveedora = async () => {
    let msg = `📋 *INFORME PARA PROVEEDORA* 📋\n`;
    if (pedido.cliente_nombre) msg += `*Pedido de:* ${pedido.cliente_nombre}\n`;
    if (pedido.cliente_telefono) msg += `*Teléfono:* ${pedido.cliente_telefono}\n`;
    if (pedido.fecha_entrega) msg += `*Fecha:* ${pedido.fecha_entrega}\n`;
    msg += `*Consiguió:* ${pedido.conseguido_por === 'yo' ? 'Yo' : 'Tú'}\n`;
    msg += `*Productos (a precio de costo):*\n`;
    items.forEach(item => {
      if (item.cantidad > 1) {
        msg += `• ${item.cantidad}x ${item.nombre}${item.gramaje ? ' ' + item.gramaje : ''} ($${item.precio_costo} c/u) - $${(item.precio_costo * item.cantidad).toFixed(0)}\n`;
      } else {
        msg += `• ${item.nombre}${item.gramaje ? ' ' + item.gramaje : ''} - $${item.precio_costo}\n`;
      }
    });
    const totalCosto = items.reduce((acc, i) => acc + i.precio_costo * i.cantidad, 0);
    msg += `*TOTAL A PAGAR A PROVEEDORA: $${totalCosto.toFixed(0)}*\n`;
    msg += `✅ Pedido completado`;
    await enviarWhatsApp(msg);
  };

  const confirmarEliminar = () => {
    Alert.alert('Eliminar pedido', '¿Seguro que quieres eliminar este pedido?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { eliminarPedido(pedido.id); router.back(); } },
    ]);
  };

  const ganancia = pedido.conseguido_por === 'yo'
    ? pedido.total - pedido.domicilio - items.reduce((a, i) => a + i.precio_costo * i.cantidad, 0)
    : pedido.domicilio;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Pedido #{pedido.id}</Text>
        <Pressable onPress={confirmarEliminar}>
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
        </Pressable>
      </View>

      {pedido.fecha_entrega ? <Text style={styles.fecha}>📅 Entrega: {pedido.fecha_entrega}</Text> : null}
      {pedido.cliente_nombre ? <Text style={styles.cliente}>👤 {pedido.cliente_nombre}</Text> : null}
      {pedido.cliente_telefono ? <Text style={styles.cliente}>📞 {pedido.cliente_telefono}</Text> : null}
      {pedido.direccion ? <Text style={styles.cliente}>📍 {pedido.direccion}</Text> : null}

      <View style={styles.conseguidoBadge}>
        <Ionicons name={pedido.conseguido_por === 'yo' ? 'person' : 'people'} size={14} color={pedido.conseguido_por === 'yo' ? '#00e5ff' : '#a78bfa'} />
        <Text style={[styles.conseguidoText, { color: pedido.conseguido_por === 'yo' ? '#00e5ff' : '#a78bfa' }]}>
          Consiguió: {pedido.conseguido_por === 'yo' ? 'Yo' : 'Proveedora'}
        </Text>
      </View>

      <Text style={styles.label}>Productos</Text>
      {items.map(item => {
        const precio = getPrecioVenta(item);
        return (
          <View key={item.producto_id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemNombre}>{item.nombre} {item.gramaje}</Text>
              {item.cantidad > 1 && <Text style={styles.itemDetalle}>{item.cantidad} x ${precio}</Text>}
            </View>
            <Text style={styles.itemTotal}>${(precio * item.cantidad).toFixed(0)}</Text>
          </View>
        );
      })}

      <View style={styles.resumen}>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Subtotal</Text>
          <Text style={styles.resumenValor}>${pedido.subtotal.toFixed(0)}</Text>
        </View>
        {pedido.domicilio > 0 && (
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Domicilio</Text>
            <Text style={styles.resumenValor}>${pedido.domicilio.toFixed(0)}</Text>
          </View>
        )}
        {pedido.recargo_porcentaje > 0 && (
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Recargo ({pedido.recargo_porcentaje}%)</Text>
            <Text style={styles.resumenValor}>${(pedido.subtotal * pedido.recargo_porcentaje / 100).toFixed(0)}</Text>
          </View>
        )}
        <View style={[styles.resumenRow, styles.resumenTotal]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>${pedido.total.toFixed(0)}</Text>
        </View>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>
            {pedido.metodo_pago === 'efectivo' ? '💵 Efectivo' : '📲 Transferencia'}
          </Text>
          <Text style={[styles.resumenValor, { color: '#7c4dff' }]}>
            Tu ganancia: ${ganancia.toFixed(0)}
          </Text>
        </View>
      </View>

      <View style={styles.botonesRow}>
        <Pressable style={styles.btnCliente} onPress={compartirCliente}>
          <Ionicons name="logo-whatsapp" size={18} color="#06121a" />
          <Text style={styles.btnClienteText}>Enviar a cliente</Text>
        </Pressable>
        <Pressable style={styles.btnProveedor} onPress={compartirProveedora}>
          <Ionicons name="logo-whatsapp" size={18} color="#cbb8ff" />
          <Text style={styles.btnProveedorText}>Enviar a proveedora</Text>
        </Pressable>
      </View>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Volver</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  content: { padding: 20, paddingTop: 30, paddingBottom: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: {
    color: '#fff', fontSize: 22, fontWeight: '500',
    textShadowColor: 'rgba(94,240,255,0.6)', textShadowRadius: 14, textShadowOffset: { width: 0, height: 0 },
  },
  fecha: { color: '#5ef0ff', fontSize: 13, marginBottom: 4 },
  cliente: { color: '#9aa3c0', fontSize: 13, marginBottom: 2 },
  conseguidoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start',
  },
  conseguidoText: { fontSize: 12, fontWeight: '500' },
  label: { color: '#6b7494', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 18 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderRadius: 12, padding: 12, marginBottom: 8,
  },
  itemInfo: { flex: 1 },
  itemNombre: { color: '#fff', fontSize: 13, fontWeight: '500' },
  itemDetalle: { color: '#6b7494', fontSize: 11, marginTop: 2 },
  itemTotal: { color: '#00e5ff', fontSize: 14, fontWeight: '500' },
  resumen: {
    marginTop: 16, backgroundColor: 'rgba(255,255,255,0.03)',
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
  botonesRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnCliente: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#00e5ff', borderRadius: 12, paddingVertical: 13,
    shadowColor: '#7c4dff', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
  },
  btnClienteText: { color: '#06121a', fontSize: 13, fontWeight: '600' },
  btnProveedor: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderColor: 'rgba(167,139,250,0.3)', borderWidth: 1, borderRadius: 12, paddingVertical: 13,
    backgroundColor: 'rgba(124,77,255,0.06)',
  },
  btnProveedorText: { color: '#cbb8ff', fontSize: 13, fontWeight: '500' },
  backButton: { marginTop: 12, alignItems: 'center', paddingVertical: 10 },
  backText: { color: '#6b7494', fontSize: 13 },
});