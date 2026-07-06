import { eliminarPedido, marcarPedidoRealizado, obtenerPedidosPendientes, Pedido } from '@/database/db';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useFocusEffect(
    useCallback(() => {
      setPedidos(obtenerPedidosPendientes());
    }, [])
  );

  const recargar = () => setPedidos(obtenerPedidosPendientes());

  const confirmarRealizado = (pedido: Pedido) => {
    Alert.alert(
      '¿Pedido realizado?',
      `¿Confirmas que el pedido de ${pedido.cliente_nombre || 'este cliente'} fue entregado?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, realizado ✓',
          onPress: () => { marcarPedidoRealizado(pedido.id); recargar(); },
        },
      ]
    );
  };

  const confirmarEliminar = (pedido: Pedido) => {
    Alert.alert(
      'Eliminar pedido',
      `¿Seguro? El pedido de ${pedido.cliente_nombre || 'este cliente'} se borrará permanentemente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => { eliminarPedido(pedido.id); recargar(); },
        },
      ]
    );
  };

  const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>GESTIÓN</Text>
        <Text style={styles.title}>Pedidos pendientes</Text>
        {pedidos.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pedidos.length} pendiente{pedidos.length !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const items = JSON.parse(item.items);
          return (
            <View style={styles.card}>
              <Pressable style={styles.cardBody} onPress={() => router.push(`/pedido?id=${item.id}`)}>
                <View style={styles.cardBar} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitulo}>
                    {item.cliente_nombre || 'Cliente sin nombre'} · #{item.id}
                  </Text>
                  <Text style={styles.cardDetalle}>
                    {items.length} producto{items.length !== 1 ? 's' : ''} · {fecha(item.fecha)}
                  </Text>
                  {item.fecha_entrega ? (
                    <Text style={styles.cardFechaEntrega}>📅 Entrega: {item.fecha_entrega}</Text>
                  ) : null}
                  <Text style={styles.cardMetodo}>
                    {item.metodo_pago === 'efectivo' ? '💵 Efectivo' : '📲 Transferencia'}
                    {' · '}
                    {item.conseguido_por === 'yo' ? '👤 Yo' : '👥 Proveedora'}
                  </Text>
                </View>
                <Text style={styles.cardTotal}>${item.total.toFixed(0)}</Text>
              </Pressable>

              <View style={styles.cardAcciones}>
                <Pressable style={styles.btnRealizado} onPress={() => confirmarRealizado(item)}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#06121a" />
                  <Text style={styles.btnRealizadoText}>Realizado</Text>
                </Pressable>
                <Pressable style={styles.btnEliminar} onPress={() => confirmarEliminar(item)}>
                  <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
                  <Text style={styles.btnEliminarText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={56} color="#2a3050" />
            <Text style={styles.emptyText}>No hay pedidos pendientes</Text>
            <Text style={styles.emptySubText}>¡Todo al día! 🎉</Text>
          </View>
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/nuevo-pedido')}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  header: { paddingTop: 60, paddingHorizontal: 18, paddingBottom: 18, backgroundColor: '#10162b' },
  label: { color: '#5ef0ff', fontSize: 11, letterSpacing: 2, opacity: 0.7, marginBottom: 2 },
  title: { color: '#fff', fontSize: 22, fontWeight: '500', marginBottom: 6 },
  badge: {
    backgroundColor: 'rgba(255,107,107,0.15)', borderColor: 'rgba(255,107,107,0.3)', borderWidth: 1,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  badgeText: { color: '#ff6b6b', fontSize: 12, fontWeight: '500' },
  list: { padding: 18, gap: 10 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderRadius: 16, overflow: 'hidden', marginBottom: 10,
  },
  cardBody: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  cardBar: { width: 3, height: '100%', backgroundColor: '#7c4dff', borderRadius: 2, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitulo: { color: '#fff', fontSize: 14, fontWeight: '500', marginBottom: 3 },
  cardDetalle: { color: '#6b7494', fontSize: 12, marginBottom: 2 },
  cardFechaEntrega: { color: '#5ef0ff', fontSize: 11, marginBottom: 2 },
  cardMetodo: { color: '#9aa3c0', fontSize: 11 },
  cardTotal: { color: '#00e5ff', fontSize: 16, fontWeight: '500' },
  cardAcciones: {
    flexDirection: 'row', borderTopColor: 'rgba(255,255,255,0.05)', borderTopWidth: 1,
  },
  btnRealizado: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#00e5ff', paddingVertical: 10,
  },
  btnRealizadoText: { color: '#06121a', fontSize: 13, fontWeight: '600' },
  btnEliminar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(255,107,107,0.06)', paddingVertical: 10,
    borderLeftColor: 'rgba(255,255,255,0.05)', borderLeftWidth: 1,
  },
  btnEliminarText: { color: '#ff6b6b', fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyText: { color: '#6b7494', fontSize: 15, fontWeight: '500' },
  emptySubText: { color: '#2a3050', fontSize: 13 },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#00e5ff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7c4dff', shadowOpacity: 0.7, shadowRadius: 16, shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  fabIcon: { color: '#06121a', fontSize: 28, fontWeight: '600', lineHeight: 30 },
});