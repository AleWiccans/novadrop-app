import {
  Catalogo,
  CATEGORIAS_POR_CATALOGO,
  Config,
  EMOJIS_CATEGORIA,
  obtenerCatalogosActivos,
  obtenerConfig,
  obtenerProductosDisponiblesPorCatalogo,
  obtenerProductosNuevos,
  Producto
} from '@/database/db';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const ESTILOS_CATALOGO: Record<string, { encabezado: string; emoji: string; subtitulo: string }> = {
  'Medicamentos': { encabezado: '💊', emoji: '💊', subtitulo: 'Tu salud, a tu puerta' },
  'Electrodomésticos': { encabezado: '🔌', emoji: '🔌', subtitulo: 'Equipos de calidad para tu hogar' },
  'Teléfonos y Computadoras': { encabezado: '📱', emoji: '📱', subtitulo: 'Tecnología al mejor precio' },
  'Alimentos': { encabezado: '🛒', emoji: '🛒', subtitulo: 'Productos frescos y de calidad' },
  'Cocina casera': { encabezado: '🍕', emoji: '🍕', subtitulo: 'Hecho con amor, entregado en tu puerta' },
  'Ropa y Calzado': { encabezado: '👗', emoji: '👗', subtitulo: 'Moda y estilo para todos' },
  'Artículos de fiesta': { encabezado: '🎉', emoji: '🎉', subtitulo: 'Todo para tu celebración especial' },
  'Ferretería': { encabezado: '🔧', emoji: '🔧', subtitulo: 'Herramientas y materiales de confianza' },
  'Miscelánea': { encabezado: '🗂️', emoji: '🗂️', subtitulo: 'Variedad para cada necesidad' },
};

function generarFecha(): string {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function generarSemana(): string {
  const hoy = new Date();
  const hace7 = new Date();
  hace7.setDate(hoy.getDate() - 7);
  const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  return `${fmt(hace7)} al ${fmt(hoy)} de ${hoy.getFullYear()}`;
}

function generarPie(config: Config): string {
  let pie = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  pie += `📞 *Contacto:* ${config.telefono}\n\n`;
  pie += `🚚 *${config.mensaje_pie}*\n\n`;
  pie += `💰 *Domicilio:* $${config.domicilio_min} - $${config.domicilio_max} según zona\n`;
  pie += `✨ ¡Gracias por tu preferencia! ✨\n`;
  pie += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  return pie;
}

function generarListaCatalogo(catalogo: Catalogo, productos: Producto[], config: Config): string {
  const estilo = ESTILOS_CATALOGO[catalogo.nombre] || { encabezado: '🏪', emoji: '📦', subtitulo: 'Disponibles ahora' };
  const categorias = CATEGORIAS_POR_CATALOGO[catalogo.nombre] || [];

  const porCategoria: Record<string, Producto[]> = {};
  productos.forEach(p => {
    if (!porCategoria[p.categoria]) porCategoria[p.categoria] = [];
    porCategoria[p.categoria].push(p);
  });

  let texto = `╔═══════════════════════════╗\n`;
  texto += `   ${estilo.encabezado} *${config.nombre_tienda} — ${catalogo.nombre}* ${estilo.encabezado}\n`;
  texto += `   _${estilo.subtitulo}_\n`;
  texto += `╚═══════════════════════════╝\n\n`;
  texto += `📅 *Actualizado:* ${generarFecha()}\n\n`;
  texto += `💬 ¡Hola! Aquí la lista actualizada 👇\n`;

  if (categorias.length > 1) {
    categorias.forEach(cat => {
      const prods = porCategoria[cat.nombre];
      if (!prods || prods.length === 0) return;
      const emoji = EMOJIS_CATEGORIA[cat.nombre] || estilo.emoji;
      texto += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      texto += `${emoji} *${cat.nombre.toUpperCase()}*\n`;
      texto += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      prods.forEach(p => {
        const nombreProd = `*${p.nombre}*${p.gramaje ? ' ' + p.gramaje : ''}`;
        const presentacion = p.presentacion ? ` (${p.presentacion})` : '';
        const atributos = p.atributos && p.atributos !== '{}' ? JSON.parse(p.atributos) : [];
        const base = `${emoji} ${nombreProd}${presentacion}`;
        const puntos = '.'.repeat(Math.max(3, 45 - base.length + 2));
        texto += `${base} ${puntos} $${p.precio_venta}\n`;
        if (atributos.length > 0) {
          const resumen = atributos.slice(0, 3).map((a: any) => `${a.nombre}: ${a.valor}`).join(' | ');
          texto += `   ↳ ${resumen}\n`;
        }
      });
    });
  } else {
    texto += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    productos.forEach(p => {
      const atributos = p.atributos && p.atributos !== '{}' ? JSON.parse(p.atributos) : [];
      texto += `${estilo.emoji} *${p.nombre}*${p.presentacion ? ' (' + p.presentacion + ')' : ''} .... $${p.precio_venta}\n`;
      if (atributos.length > 0) {
        const resumen = atributos.slice(0, 3).map((a: any) => `${a.nombre}: ${a.valor}`).join(' | ');
        texto += `   ↳ ${resumen}\n`;
      }
    });
  }

  texto += `\n${estilo.encabezado} *${config.nombre_tienda}*`;
  texto += generarPie(config);
  return texto;
}

function generarListaNuevosCatalogo(catalogo: Catalogo, productos: Producto[], config: Config): string {
  const estilo = ESTILOS_CATALOGO[catalogo.nombre] || { encabezado: '🏪', emoji: '📦', subtitulo: '' };
  if (productos.length === 0) return '';

  let texto = `╔═══════════════════════════╗\n`;
  texto += `   🆕 *${config.nombre_tienda} — ${catalogo.nombre}* — NUEVOS\n`;
  texto += `   _Productos recién llegados_\n`;
  texto += `╚═══════════════════════════╝\n\n`;
  texto += `📅 *Semana del* ${generarSemana()}\n\n`;
  texto += `🔔 ¡Nuevos productos disponibles!\n\n`;
  texto += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  productos.forEach(p => {
    const atributos = p.atributos && p.atributos !== '{}' ? JSON.parse(p.atributos) : [];
    texto += `${estilo.emoji} *${p.nombre}*${p.gramaje ? ' ' + p.gramaje : ''}${p.presentacion ? ' (' + p.presentacion + ')' : ''} .... $${p.precio_venta}\n`;
    if (atributos.length > 0) {
      const resumen = atributos.slice(0, 2).map((a: any) => `${a.nombre}: ${a.valor}`).join(' | ');
      texto += `   ↳ ${resumen}\n`;
    }
  });

  texto += `\n${estilo.encabezado} *${config.nombre_tienda}*`;
  texto += generarPie(config);
  return texto;
}

export default function ListasScreen() {
  const [catalogos, setCatalogos] = useState<Catalogo[]>([]);
  const [catalogoSel, setCatalogoSel] = useState<Catalogo | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosNuevos, setProductosNuevos] = useState<Producto[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [mostrarSelector, setMostrarSelector] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const cats = obtenerCatalogosActivos();
      setCatalogos(cats);
      const cfg = obtenerConfig();
      setConfig(cfg);
      if (cats.length > 0) {
        const sel = catalogoSel ? cats.find(c => c.id === catalogoSel.id) || cats[0] : cats[0];
        setCatalogoSel(sel);
        setProductos(obtenerProductosDisponiblesPorCatalogo(sel.id));
        setProductosNuevos(obtenerProductosNuevos().filter(p => p.catalogo_id === sel.id));
      }
    }, [])
  );

  const seleccionarCatalogo = (cat: Catalogo) => {
    setCatalogoSel(cat);
    setProductos(obtenerProductosDisponiblesPorCatalogo(cat.id));
    setProductosNuevos(obtenerProductosNuevos().filter(p => p.catalogo_id === cat.id));
    setMostrarSelector(false);
  };

  const compartirWhatsApp = async (texto: string) => {
    const url = `whatsapp://send?text=${encodeURIComponent(texto)}`;
    const puede = await Linking.canOpenURL(url);
    if (puede) { await Linking.openURL(url); }
    else { Alert.alert('WhatsApp no disponible'); }
  };

  if (!config || !catalogoSel) return <View style={s.container} />;

  const estilo = ESTILOS_CATALOGO[catalogoSel.nombre] || { encabezado: '🏪', emoji: '📦', subtitulo: '' };
  const nuevosDelCatalogo = productosNuevos.filter(p => p.catalogo_id === catalogoSel.id);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.label}>PUBLICAR</Text>
        <Text style={s.title}>Listas WhatsApp</Text>
      </View>

      {/* Selector de tienda */}
      {catalogos.length > 1 && (
        <Pressable style={s.selectorTienda} onPress={() => setMostrarSelector(true)}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>{catalogoSel.emoji}</Text>
          <Text style={s.selectorTiendaText}>{catalogoSel.nombre}</Text>
          <Text style={s.selectorTiendaArrow}>▾</Text>
        </Pressable>
      )}

      {catalogos.length === 1 && (
        <View style={s.tiendaBadge}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>{catalogoSel.emoji}</Text>
          <Text style={s.tiendaBadgeText}>{catalogoSel.nombre}</Text>
        </View>
      )}

      {/* Lista completa */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.cardIcono}>
            <Text style={{ fontSize: 24 }}>{estilo.encabezado}</Text>
          </View>
          <View style={s.cardInfo}>
            <Text style={s.cardTitulo}>Lista completa</Text>
            <Text style={s.cardSubtitulo}>{productos.length} productos disponibles</Text>
            <Text style={s.cardSubtitulo2}>{estilo.subtitulo}</Text>
          </View>
        </View>

        <Pressable
          style={[s.botonCompartir, productos.length === 0 && s.botonDesactivado]}
          onPress={() => {
            if (productos.length === 0) { Alert.alert('Sin productos', 'No hay productos disponibles en esta tienda.'); return; }
            compartirWhatsApp(generarListaCatalogo(catalogoSel, productos, config));
          }}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#06121a" />
          <Text style={s.botonCompartirText}>Compartir lista completa</Text>
        </Pressable>
      </View>

      {/* Lista de nuevos */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={[s.cardIcono, { backgroundColor: 'rgba(124,77,255,0.1)', borderColor: 'rgba(124,77,255,0.3)' }]}>
            <Ionicons name="sparkles" size={24} color="#a78bfa" />
          </View>
          <View style={s.cardInfo}>
            <Text style={s.cardTitulo}>Productos nuevos</Text>
            <Text style={s.cardSubtitulo}>
              {nuevosDelCatalogo.length > 0
                ? `${nuevosDelCatalogo.length} nuevos esta semana`
                : 'Sin productos nuevos esta semana'}
            </Text>
          </View>
        </View>

        {nuevosDelCatalogo.length > 0 && (
          <View style={s.nuevosLista}>
            {nuevosDelCatalogo.map(p => (
              <View key={p.id} style={s.nuevoItem}>
                <Text style={s.nuevoEmoji}>{estilo.emoji}</Text>
                <Text style={s.nuevoNombre}>{p.nombre}{p.gramaje ? ' ' + p.gramaje : ''}</Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          style={[s.botonCompartir, { backgroundColor: nuevosDelCatalogo.length === 0 ? 'rgba(124,77,255,0.3)' : '#7c4dff' }]}
          onPress={() => {
            if (nuevosDelCatalogo.length === 0) { Alert.alert('Sin productos nuevos', 'No hay productos nuevos esta semana.'); return; }
            compartirWhatsApp(generarListaNuevosCatalogo(catalogoSel, nuevosDelCatalogo, config));
          }}
          disabled={nuevosDelCatalogo.length === 0}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={[s.botonCompartirText, { color: '#fff' }]}>Compartir productos nuevos</Text>
        </Pressable>
      </View>

      {/* Vista previa */}
      <View style={s.previsualizacion}>
        <Text style={s.previsualizacionLabel}>Vista previa</Text>
        <Text style={s.previsualizacionTexto}>
          {productos.length > 0
            ? generarListaCatalogo(catalogoSel, productos, config).substring(0, 500) + '...'
            : 'No hay productos disponibles.'}
        </Text>
      </View>

      {/* Modal selector de tienda */}
      <Modal visible={mostrarSelector} transparent animationType="fade" onRequestClose={() => setMostrarSelector(false)}>
        <Pressable style={s.overlay} onPress={() => setMostrarSelector(false)}>
          <View style={s.menu}>
            <FlatList
              data={catalogos}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={[s.menuItem, catalogoSel.id === item.id && s.menuItemActivo]}
                  onPress={() => seleccionarCatalogo(item)}
                >
                  <Text style={{ fontSize: 20, marginRight: 12 }}>{item.emoji}</Text>
                  <Text style={[s.menuItemText, catalogoSel.id === item.id && s.menuItemTextActivo]}>{item.nombre}</Text>
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
  content: { paddingBottom: 40 },
  header: { paddingTop: 60, paddingHorizontal: 18, paddingBottom: 18, backgroundColor: '#10162b' },
  label: { color: '#5ef0ff', fontSize: 11, letterSpacing: 2, opacity: 0.7, marginBottom: 2 },
  title: { color: '#fff', fontSize: 22, fontWeight: '500' },
  selectorTienda: {
    flexDirection: 'row', alignItems: 'center',
    margin: 18, marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,229,255,0.25)', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  selectorTiendaText: { flex: 1, color: '#5ef0ff', fontSize: 15, fontWeight: '500' },
  selectorTiendaArrow: { color: '#5ef0ff', fontSize: 14 },
  tiendaBadge: {
    flexDirection: 'row', alignItems: 'center',
    margin: 18, marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  tiendaBadgeText: { color: '#9aa3c0', fontSize: 14 },
  card: {
    margin: 18, marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderRadius: 18, padding: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardIcono: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(0,229,255,0.08)', borderColor: 'rgba(0,229,255,0.2)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitulo: { color: '#fff', fontSize: 16, fontWeight: '500', marginBottom: 2 },
  cardSubtitulo: { color: '#6b7494', fontSize: 12 },
  cardSubtitulo2: { color: '#5ef0ff', fontSize: 11, marginTop: 2, opacity: 0.7 },
  botonCompartir: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#00e5ff', borderRadius: 12, paddingVertical: 13,
  },
  botonDesactivado: { opacity: 0.5 },
  botonCompartirText: { color: '#06121a', fontSize: 14, fontWeight: '600' },
  nuevosLista: {
    backgroundColor: 'rgba(124,77,255,0.05)', borderRadius: 10, padding: 10, marginBottom: 14,
  },
  nuevoItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  nuevoEmoji: { fontSize: 14 },
  nuevoNombre: { color: '#cbb8ff', fontSize: 13 },
  previsualizacion: {
    margin: 18,
    backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
    borderRadius: 14, padding: 14,
  },
  previsualizacionLabel: { color: '#6b7494', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  previsualizacionTexto: { color: '#6b7494', fontSize: 11, lineHeight: 18 },
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