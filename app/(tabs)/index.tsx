import { AnimatedCard } from '@/components/AnimatedCard';
import {
  Catalogo,
  CATEGORIAS_POR_CATALOGO,
  contarProductosPorCatalogo,
  EMOJIS_CATEGORIA,
  initDB, insertarProductosDeEjemplo,
  obtenerCatalogosActivos, obtenerProductosPorCatalogoYCategoria,
  Producto
} from '@/database/db';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

function FabAnimado({ onPressTienda, onPressAdd }: { onPressTienda: () => void; onPressAdd: () => void }) {
  const glow = useSharedValue(0.5);

  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 2200 }), -1, true);
  }, []);

  const fabStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value * 0.7,
    shadowRadius: glow.value * 16,
  }));

  return (
    <View style={s.fabs}>
      <Pressable style={s.fabTienda} onPress={onPressTienda}>
        <Ionicons name="storefront-outline" size={20} color="#5ef0ff" />
      </Pressable>
      <Animated.View style={[s.fabAdd, fabStyle]}>
        <Pressable style={s.fabAddInner} onPress={onPressAdd}>
          <Ionicons name="add" size={28} color="#06121a" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function CatalogoScreen() {
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [catalogoActivo, setCatalogoActivo] = useState<Catalogo | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtro, setFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  useEffect(() => {
    initDB();
    insertarProductosDeEjemplo();
    cargarCatalogos();
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarCatalogos();
    }, [])
  );

  const cargarCatalogos = () => {
    const activos = obtenerCatalogosActivos();
    setCatalogos(activos);
    if (activos.length > 0) {
      setCatalogoActivo(prev => {
        const actual = prev ? activos.find(c => c.id === prev.id) || activos[0] : activos[0];
        cargarProductos(actual.id, 'Todos');
        return actual;
      });
      setFiltro('Todos');
    }
  };

  const cargarProductos = (catalogoId: number, cat: string) => {
    const lista = obtenerProductosPorCatalogoYCategoria(catalogoId, cat);
    setProductos(lista);
    setProductosFiltrados(lista);
    setBusqueda('');
  };

  const seleccionarCatalogo = (catalogo: Catalogo) => {
    setCatalogoActivo(catalogo);
    setFiltro('Todos');
    cargarProductos(catalogo.id, 'Todos');
  };

  const aplicarBusqueda = (texto: string) => {
    setBusqueda(texto);
    if (!texto.trim()) { setProductosFiltrados(productos); return; }
    const lower = texto.toLowerCase();
    setProductosFiltrados(productos.filter(p =>
      p.nombre.toLowerCase().includes(lower) ||
      (p.gramaje || '').toLowerCase().includes(lower) ||
      (p.presentacion || '').toLowerCase().includes(lower) ||
      (p.categoria || '').toLowerCase().includes(lower)
    ));
  };

  const onFiltro = (cat: string) => {
    setFiltro(cat);
    setMostrarFiltro(false);
    if (catalogoActivo) cargarProductos(catalogoActivo.id, cat);
  };

  const categoriasActuales = catalogoActivo
    ? [{ nombre: 'Todos', icono: 'grid-outline' }, ...(CATEGORIAS_POR_CATALOGO[catalogoActivo.nombre] || [])]
    : [];

  const filtroActual = categoriasActuales.find(c => c.nombre === filtro) || categoriasActuales[0];

  return (
    <View style={s.container}>
      <AnimatedCard delay={0}>
        <View style={s.header}>
          <Text style={s.label}>MI CATÁLOGO</Text>
          <Text style={s.title}>NovaDrop</Text>
          <View style={s.searchRow}>
            <Ionicons name="search-outline" size={16} color="#6b7494" style={{ marginRight: 8 }} />
            <TextInput
              style={s.searchInput}
              placeholder="Buscar producto..."
              placeholderTextColor="#6b7494"
              value={busqueda}
              onChangeText={aplicarBusqueda}
            />
            {busqueda.length > 0 && (
              <Pressable onPress={() => aplicarBusqueda('')}>
                <Ionicons name="close-circle" size={16} color="#6b7494" />
              </Pressable>
            )}
          </View>
        </View>
      </AnimatedCard>

      {catalogos.length > 0 && (
        <AnimatedCard delay={100}>
          <View style={s.tiendas}>
            <Text style={s.tiendasLabel}>Mis tiendas activas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tiendasScroll}>
              {catalogos.map((cat, index) => {
                const activo = catalogoActivo?.id === cat.id;
                const count = contarProductosPorCatalogo(cat.id);
                return (
                  <AnimatedCard key={cat.id} delay={100 + index * 60}>
                    <Pressable
                      style={[s.tiendaCard, activo && s.tiendaCardActiva]}
                      onPress={() => seleccionarCatalogo(cat)}
                    >
                      {activo && <View style={s.tiendaBarra} />}
                      {cat.foto ? (
                        <Image source={{ uri: cat.foto }} style={s.tiendaFoto} />
                      ) : (
                        <View style={[s.tiendaEmoji, activo && s.tiendaEmojiActivo]}>
                          <Text style={{ fontSize: 26 }}>{cat.emoji}</Text>
                        </View>
                      )}
                      <Text style={[s.tiendaNombre, activo && s.tiendaNombreActivo]} numberOfLines={2}>{cat.nombre}</Text>
                      <Text style={[s.tiendaCount, activo && s.tiendaCountActivo]}>
                        {count} producto{count !== 1 ? 's' : ''}
                      </Text>
                    </Pressable>
                  </AnimatedCard>
                );
              })}
            </ScrollView>
          </View>
        </AnimatedCard>
      )}

      {catalogoActivo && (
        <AnimatedCard delay={200}>
          <Pressable style={s.filtroBar} onPress={() => setMostrarFiltro(true)}>
            <View style={s.filtroLeft}>
              <Ionicons name={(filtroActual?.icono || 'grid-outline') as any} size={16} color="#5ef0ff" style={{ marginRight: 8 }} />
              <Text style={s.filtroText}>{filtro}</Text>
            </View>
            <View style={s.filtroRight}>
              {busqueda.length > 0 && (
                <Text style={s.filtroCount}>{productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''}</Text>
              )}
              <Text style={s.filtroArrow}>▾</Text>
            </View>
          </Pressable>
        </AnimatedCard>
      )}

      <Modal visible={mostrarFiltro} transparent animationType="fade" onRequestClose={() => setMostrarFiltro(false)}>
        <Pressable style={s.overlay} onPress={() => setMostrarFiltro(false)}>
          <View style={s.menu}>
            <FlatList
              data={categoriasActuales}
              keyExtractor={item => item.nombre}
              renderItem={({ item }) => (
                <Pressable
                  style={[s.menuItem, filtro === item.nombre && s.menuItemActivo]}
                  onPress={() => onFiltro(item.nombre)}
                >
                  <Ionicons name={(item.icono || 'grid-outline') as any} size={18} color={filtro === item.nombre ? '#5ef0ff' : '#6b7494'} style={{ marginRight: 10 }} />
                  <Text style={[s.menuItemText, filtro === item.nombre && s.menuItemTextActivo]}>{item.nombre}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      <FlatList
        data={productosFiltrados}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={s.lista}
        renderItem={({ item, index }) => (
          <AnimatedCard delay={250 + index * 50}>
            <Pressable
              style={[s.card, item.agotado === 1 && s.cardAgotado]}
              onPress={() => router.push(`/producto?id=${item.id}`)}
            >
              <View style={s.cardBarra} />
              {item.foto ? (
                <Image source={{ uri: item.foto }} style={s.cardFoto} />
              ) : (
                <View style={s.cardFotoPlaceholder}>
                  <Text style={{ fontSize: 22 }}>{EMOJIS_CATEGORIA[item.categoria] || catalogoActivo?.emoji || '📦'}</Text>
                </View>
              )}
              <View style={s.cardInfo}>
                <Text style={s.cardNombre}>{item.nombre}{item.gramaje ? ' ' + item.gramaje : ''}</Text>
                <Text style={s.cardDetalle}>{item.agotado === 1 ? 'Agotado' : item.presentacion}</Text>
                <Text style={s.cardCategoria}>{item.categoria}</Text>
              </View>
              <Text style={[s.cardPrecio, item.agotado === 1 && s.cardPrecioAgotado]}>${item.precio_venta}</Text>
            </Pressable>
          </AnimatedCard>
        )}
        ListEmptyComponent={
          <AnimatedCard delay={300}>
            <View style={s.empty}>
              <Ionicons name={catalogos.length === 0 ? 'storefront-outline' : 'cube-outline'} size={48} color="#2a3050" />
              <Text style={s.emptyText}>
                {catalogos.length === 0 ? 'Activa una tienda para empezar' : busqueda.length > 0 ? `Sin resultados para "${busqueda}"` : 'No hay productos aquí aún'}
              </Text>
              {catalogos.length === 0 && (
                <Pressable style={s.emptyBtn} onPress={() => router.push('/mis-tiendas')}>
                  <Text style={s.emptyBtnText}>Gestionar tiendas</Text>
                </Pressable>
              )}
            </View>
          </AnimatedCard>
        }
      />

      <FabAnimado
        onPressTienda={() => router.push('/mis-tiendas')}
        onPressAdd={() => catalogoActivo && router.push(`/modal?catalogo_id=${catalogoActivo.id}&catalogo_nombre=${encodeURIComponent(catalogoActivo.nombre)}`)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  header: { paddingTop: 60, paddingHorizontal: 18, paddingBottom: 14, backgroundColor: '#10162b' },
  label: { color: '#5ef0ff', fontSize: 11, letterSpacing: 2, opacity: 0.7, marginBottom: 2 },
  title: { color: '#fff', fontSize: 22, fontWeight: '500', marginBottom: 14 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(94,240,255,0.15)', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 13 },
  tiendas: { paddingTop: 14, paddingBottom: 10, backgroundColor: '#10162b' },
  tiendasLabel: { color: '#6b7494', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingHorizontal: 18 },
  tiendasScroll: { paddingHorizontal: 18, gap: 12 },
  tiendaCard: {
    width: 110, backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderRadius: 16, padding: 12, alignItems: 'center', position: 'relative', overflow: 'hidden',
  },
  tiendaCardActiva: { borderColor: 'rgba(0,229,255,0.4)' },
  tiendaBarra: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: '#00e5ff' },
  tiendaFoto: { width: 52, height: 52, borderRadius: 14, marginBottom: 8 },
  tiendaEmoji: {
    width: 52, height: 52, borderRadius: 14, marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  tiendaEmojiActivo: { backgroundColor: 'rgba(0,229,255,0.1)', borderColor: 'rgba(0,229,255,0.3)' },
  tiendaNombre: { color: '#9aa3c0', fontSize: 11, fontWeight: '500', textAlign: 'center', marginBottom: 2 },
  tiendaNombreActivo: { color: '#fff' },
  tiendaCount: { color: '#6b7494', fontSize: 10, textAlign: 'center' },
  tiendaCountActivo: { color: '#5ef0ff' },
  filtroBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 18, marginTop: 14, marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,229,255,0.25)', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  filtroLeft: { flexDirection: 'row', alignItems: 'center' },
  filtroRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filtroText: { color: '#5ef0ff', fontSize: 14, fontWeight: '500' },
  filtroArrow: { color: '#5ef0ff', fontSize: 14 },
  filtroCount: { color: '#6b7494', fontSize: 11 },
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
  lista: { padding: 18, paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderRadius: 16, padding: 12, marginBottom: 10, overflow: 'hidden',
  },
  cardAgotado: { opacity: 0.5 },
  cardBarra: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
    backgroundColor: '#00e5ff', borderRadius: 2,
  },
  cardFoto: { width: 52, height: 52, borderRadius: 10, marginRight: 12, marginLeft: 8 },
  cardFotoPlaceholder: {
    width: 52, height: 52, borderRadius: 10, marginRight: 12, marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardNombre: { color: '#fff', fontSize: 14, fontWeight: '500', marginBottom: 2 },
  cardDetalle: { color: '#6b7494', fontSize: 12, marginBottom: 2 },
  cardCategoria: { color: '#5ef0ff', fontSize: 11, opacity: 0.7 },
  cardPrecio: { color: '#00e5ff', fontSize: 16, fontWeight: '500' },
  cardPrecioAgotado: { color: '#6b7494' },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: '#6b7494', fontSize: 13, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: 'rgba(0,229,255,0.1)', borderColor: 'rgba(0,229,255,0.3)', borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8,
  },
  emptyBtnText: { color: '#5ef0ff', fontSize: 13 },
  fabs: { position: 'absolute', bottom: 24, right: 24, gap: 12, alignItems: 'center' },
  fabTienda: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(94,240,255,0.1)', borderColor: 'rgba(94,240,255,0.3)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  fabAdd: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#00e5ff',
    shadowColor: '#7c4dff', shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  fabAddInner: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
});