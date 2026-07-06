import { ItemPedido, obtenerPedidosRealizados, Pedido } from '@/database/db';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HistorialScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useFocusEffect(
    useCallback(() => {
      setPedidos(obtenerPedidosRealizados());
    }, [])
  );

  const totalVentas = pedidos.reduce((acc, p) => acc + p.total, 0);
  const totalGanancia = pedidos.reduce((acc, p) => {
    const items: ItemPedido[] = JSON.parse(p.items);
    const costos = items.reduce((a, i) => a + i.precio_costo * i.cantidad, 0);
    return acc + (p.conseguido_por === 'proveedora' ? p.domicilio : p.total - p.domicilio - costos);
  }, 0);
  const totalDomicilios = pedidos.reduce((acc, p) => acc + p.domicilio, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.label}>ESTADÍSTICAS</Text>
        <Text style={styles.title}>Historial</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="receipt-outline" size={22} color="#00e5ff" />
          <Text style={styles.statValor}>{pedidos.length}</Text>
          <Text style={styles.statLabel}>Pedidos realizados</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={22} color="#00e5ff" />
          <Text style={styles.statValor}>${totalVentas.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total ventas</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={22} color="#7c4dff" />
          <Text style={[styles.statValor, { color: '#a78bfa' }]}>${totalGanancia.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Ganancia neta</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="bicycle-outline" size={22} color="#7c4dff" />
          <Text style={[styles.statValor, { color: '#a78bfa' }]}>${totalDomicilios.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Domicilios</Text>
        </View>
      </View>

      <Text style={styles.seccionLabel}>Pedidos completados</Text>

      {pedidos.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={48} color="#2a3050" />
          <Text style={styles.emptyText}>No hay ventas registradas aún</Text>
        </View>
      )}

      {pedidos.map(pedido => {
        const items: ItemPedido[] = JSON.parse(pedido.items);
        const costos = items.reduce((a, i) => a + i.precio_costo * i.cantidad, 0);
        const ganancia = pedido.conseguido_por === 'proveedora'
          ? pedido.domicilio
          : pedido.total - pedido.domicilio - costos;
        const fecha = new Date(pedido.fecha).toLocaleDateString('es-ES', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
        });
        return (
          <Pressable key={pedido.id} style={styles.pedidoRow} onPress={() => router.push(`/pedido?id=${pedido.id}`)}>
            <View style={styles.pedidoIcono}>
              <Ionicons name="checkmark-circle" size={20} color="#00e5ff" />
            </View>
            <View style={styles.pedidoInfo}>
              <Text style={styles.pedidoCliente}>
                {pedido.cliente_nombre || 'Sin nombre'} · #{pedido.id}
              </Text>
              <Text style={styles.pedidoFecha}>{fecha}</Text>
              <Text style={styles.pedidoDetalle}>
                {items.length} producto{items.length !== 1 ? 's' : ''}
                {' · '}
                {pedido.conseguido_por === 'yo' ? '👤 Yo' : '👥 Proveedora'}
              </Text>
            </View>
            <View style={styles.pedidoMontos}>
              <Text style={styles.pedidoTotal}>${pedido.total.toFixed(0)}</Text>
              <Text style={styles.pedidoGanancia}>+${ganancia.toFixed(0)}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  content: { paddingBottom: 40 },
  header: { paddingTop: 60, paddingHorizontal: 18, paddingBottom: 18, backgroundColor: '#10162b' },
  label: { color: '#5ef0ff', fontSize: 11, letterSpacing: 2, opacity: 0.7, marginBottom: 2 },
  title: { color: '#fff', fontSize: 22, fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 18 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderRadius: 16,
    padding: 16, alignItems: 'center', gap: 6,
  },
  statValor: { color: '#00e5ff', fontSize: 22, fontWeight: '500' },
  statLabel: { color: '#6b7494', fontSize: 11, textAlign: 'center' },
  seccionLabel: {
    color: '#6b7494', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1,
    marginHorizontal: 18, marginBottom: 10,
  },
  pedidoRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 18, paddingVertical: 12,
    borderBottomColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1,
  },
  pedidoIcono: { marginRight: 12 },
  pedidoInfo: { flex: 1 },
  pedidoCliente: { color: '#fff', fontSize: 13, fontWeight: '500' },
  pedidoFecha: { color: '#6b7494', fontSize: 11, marginTop: 2 },
  pedidoDetalle: { color: '#9aa3c0', fontSize: 11, marginTop: 2 },
  pedidoMontos: { alignItems: 'flex-end' },
  pedidoTotal: { color: '#fff', fontSize: 13, fontWeight: '500' },
  pedidoGanancia: { color: '#7c4dff', fontSize: 11, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: '#2a3050', fontSize: 14 },
});