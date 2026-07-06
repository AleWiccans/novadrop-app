import * as SQLite from 'expo-sqlite';

export type Producto = {
  id: number;
  nombre: string;
  gramaje: string;
  presentacion: string;
  precio_costo: number;
  precio_proveedor: number;
  precio_venta: number;
  categoria: string;
  agotado: number;
  foto: string;
  fecha_creacion: string;
  catalogo_id: number;
  atributos: string;
};

export type Catalogo = {
  id: number;
  nombre: string;
  emoji: string;
  foto: string;
  activo: number;
  orden: number;
};

export type ItemPedido = {
  producto_id: number;
  nombre: string;
  gramaje: string;
  precio_costo: number;
  precio_proveedor: number;
  precio_venta: number;
  cantidad: number;
};

export type Pedido = {
  id: number;
  cliente_nombre: string;
  cliente_telefono: string;
  direccion: string;
  items: string;
  subtotal: number;
  domicilio: number;
  metodo_pago: string;
  recargo_porcentaje: number;
  total: number;
  conseguido_por: string;
  fecha_entrega: string;
  fecha: string;
  realizado: number;
};

export type Config = {
  nombre_tienda: string;
  telefono: string;
  domicilio_min: number;
  domicilio_max: number;
  recargo_transferencia: number;
  moneda: string;
  mensaje_pie: string;
};

export const CONFIG_DEFAULT: Config = {
  nombre_tienda: 'NovaDrop',
  telefono: '+53 59558767',
  domicilio_min: 150,
  domicilio_max: 200,
  recargo_transferencia: 10,
  moneda: 'MN',
  mensaje_pie: 'Solo hacemos DOMICILIO. No contamos con local físico. Nosotros llevamos el pedido hasta ti 🏠',
};

export const CATALOGOS_DEFAULT: Omit<Catalogo, 'id'>[] = [
  { nombre: 'Medicamentos', emoji: '💊', foto: '', activo: 1, orden: 1 },
  { nombre: 'Electrodomésticos', emoji: '🔌', foto: '', activo: 0, orden: 2 },
  { nombre: 'Teléfonos y Computadoras', emoji: '📱', foto: '', activo: 0, orden: 3 },
  { nombre: 'Alimentos', emoji: '🛒', foto: '', activo: 0, orden: 4 },
  { nombre: 'Cocina casera', emoji: '🍕', foto: '', activo: 0, orden: 5 },
  { nombre: 'Ropa y Calzado', emoji: '👗', foto: '', activo: 0, orden: 6 },
  { nombre: 'Artículos de fiesta', emoji: '🎉', foto: '', activo: 0, orden: 7 },
  { nombre: 'Ferretería', emoji: '🔧', foto: '', activo: 0, orden: 8 },
  { nombre: 'Miscelánea', emoji: '🗂️', foto: '', activo: 0, orden: 9 },
];

export const CATEGORIAS_POR_CATALOGO: Record<string, { nombre: string; icono: string }[]> = {
  'Medicamentos': [
    { nombre: 'Medicamentos Blister', icono: 'medkit' },
    { nombre: 'Inyectables', icono: 'eyedrop' },
    { nombre: 'Colirios', icono: 'eye' },
    { nombre: 'Óvulos', icono: 'ellipse' },
    { nombre: 'Lociones', icono: 'flask' },
    { nombre: 'Cremas / Geles / Ungüentos', icono: 'hand-left' },
    { nombre: 'Suspensiones', icono: 'beaker' },
    { nombre: 'Material de operaciones', icono: 'cut' },
    { nombre: 'Otros', icono: 'cube' },
  ],
  'Electrodomésticos': [
    { nombre: 'Aires acondicionados', icono: 'thermometer' },
    { nombre: 'Lavadoras', icono: 'water' },
    { nombre: 'Refrigeradores', icono: 'snow' },
    { nombre: 'Televisores', icono: 'tv' },
    { nombre: 'Cocinas', icono: 'flame' },
    { nombre: 'Ventiladores', icono: 'cloudy' },
    { nombre: 'Batidoras y Licuadoras', icono: 'construct' },
    { nombre: 'Otros equipos', icono: 'hardware-chip' },
  ],
  'Teléfonos y Computadoras': [
    { nombre: 'Teléfonos', icono: 'phone-portrait' },
    { nombre: 'Laptops', icono: 'laptop' },
    { nombre: 'Computadoras de escritorio', icono: 'desktop' },
    { nombre: 'Tablets', icono: 'tablet-portrait' },
    { nombre: 'Accesorios', icono: 'headset' },
  ],
  'Alimentos': [
    { nombre: 'Lácteos', icono: 'nutrition' },
    { nombre: 'Aceites y condimentos', icono: 'flask' },
    { nombre: 'Granos y cereales', icono: 'leaf' },
    { nombre: 'Bebidas', icono: 'cafe' },
    { nombre: 'Carnes', icono: 'restaurant' },
    { nombre: 'Frutas y vegetales', icono: 'flower' },
    { nombre: 'Productos empacados', icono: 'archive' },
  ],
  'Cocina casera': [
    { nombre: 'Repostería', icono: 'rose' },
    { nombre: 'Pizzas y pastas', icono: 'pizza' },
    { nombre: 'Comidas completas', icono: 'restaurant' },
    { nombre: 'Bebidas artesanales', icono: 'wine' },
    { nombre: 'Dulces y postres', icono: 'heart' },
    { nombre: 'Ensaladas', icono: 'leaf' },
  ],
  'Ropa y Calzado': [
    { nombre: 'Ropa de mujer', icono: 'heart' },
    { nombre: 'Ropa de hombre', icono: 'person' },
    { nombre: 'Ropa de niños', icono: 'happy' },
    { nombre: 'Calzado', icono: 'walk' },
    { nombre: 'Accesorios', icono: 'star' },
  ],
  'Artículos de fiesta': [
    { nombre: 'Globos', icono: 'happy' },
    { nombre: 'Decoraciones', icono: 'sparkles' },
    { nombre: 'Cotillón', icono: 'gift' },
    { nombre: 'Pasteles y tortas', icono: 'rose' },
  ],
  'Ferretería': [
    { nombre: 'Herramientas', icono: 'hammer' },
    { nombre: 'Materiales de construcción', icono: 'business' },
    { nombre: 'Electricidad', icono: 'flash' },
    { nombre: 'Plomería', icono: 'water' },
    { nombre: 'Pintura', icono: 'color-palette' },
    { nombre: 'Fijación y tornillería', icono: 'settings' },
  ],
  'Miscelánea': [
    { nombre: 'General', icono: 'apps' },
  ],
};

export const ATRIBUTOS_POR_CATEGORIA: Record<string, string[]> = {
  'Aires acondicionados': ['Marca', 'Capacidad (ton)', 'Voltaje', 'Tipo', 'Color'],
  'Lavadoras': ['Marca', 'Capacidad (kg)', 'Tipo', 'Voltaje', 'Color'],
  'Refrigeradores': ['Marca', 'Capacidad (L)', 'Tipo', 'Voltaje', 'Color'],
  'Televisores': ['Marca', 'Tamaño (pulgadas)', 'Resolución', 'Tipo'],
  'Cocinas': ['Marca', 'Tipo', 'Quemadores', 'Voltaje'],
  'Ventiladores': ['Marca', 'Tipo', 'Voltaje', 'Velocidades'],
  'Batidoras y Licuadoras': ['Marca', 'Tipo', 'Velocidades', 'Vaso', 'Capacidad', 'Voltaje'],
  'Teléfonos': ['Marca', 'Modelo', 'Almacenamiento', 'RAM', 'Color'],
  'Laptops': ['Marca', 'Procesador', 'RAM', 'Almacenamiento', 'Pantalla'],
  'Computadoras de escritorio': ['Marca', 'Procesador', 'RAM', 'Almacenamiento'],
  'Tablets': ['Marca', 'Pantalla', 'Almacenamiento', 'RAM', 'Color'],
  'Lácteos': ['Marca', 'Tipo', 'Peso/Volumen', 'Presentación'],
  'Aceites y condimentos': ['Marca', 'Tipo', 'Volumen', 'Presentación'],
  'Granos y cereales': ['Marca', 'Tipo', 'Peso', 'Presentación'],
  'Bebidas': ['Marca', 'Tipo', 'Volumen', 'Presentación'],
  'Carnes': ['Tipo', 'Peso', 'Presentación'],
  'Frutas y vegetales': ['Tipo', 'Peso/Unidad', 'Origen'],
  'Productos empacados': ['Marca', 'Tipo', 'Peso/Volumen', 'Presentación'],
  'Repostería': ['Tamaño', 'Sabor', 'Porciones', 'Pedido mínimo'],
  'Pizzas y pastas': ['Tamaño', 'Ingredientes', 'Precio por', 'Disponibilidad'],
  'Comidas completas': ['Incluye', 'Porciones', 'Disponibilidad'],
  'Bebidas artesanales': ['Tipo', 'Volumen', 'Presentación'],
  'Dulces y postres': ['Tipo', 'Tamaño', 'Sabor', 'Unidades'],
  'Ensaladas': ['Ingredientes', 'Tamaño', 'Aderezo'],
  'Ropa de mujer': ['Talla', 'Color', 'Material', 'Tipo'],
  'Ropa de hombre': ['Talla', 'Color', 'Material', 'Tipo'],
  'Ropa de niños': ['Talla', 'Color', 'Material', 'Tipo', 'Edad'],
  'Calzado': ['Talla', 'Color', 'Material', 'Tipo'],
  'Herramientas': ['Tipo', 'Marca', 'Material', 'Medida'],
  'Materiales de construcción': ['Tipo', 'Medida', 'Material', 'Unidad'],
  'Electricidad': ['Tipo', 'Voltaje', 'Amperaje', 'Marca'],
  'Plomería': ['Tipo', 'Medida', 'Material'],
  'Pintura': ['Marca', 'Color', 'Tipo', 'Presentación'],
};

export const EMOJIS_CATEGORIA: Record<string, string> = {
  'Medicamentos Blister': '💊',
  'Inyectables': '💉',
  'Colirios': '👁️',
  'Óvulos': '🔴',
  'Lociones': '🧴',
  'Cremas / Geles / Ungüentos': '🧪',
  'Suspensiones': '🍼',
  'Material de operaciones': '📌',
  'Otros': '📦',
};

export const CATEGORIAS = CATEGORIAS_POR_CATALOGO['Medicamentos'];

const db = SQLite.openDatabaseSync('ventas.db');

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS catalogos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      emoji TEXT,
      foto TEXT,
      activo INTEGER DEFAULT 0,
      orden INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      gramaje TEXT,
      presentacion TEXT,
      precio_costo REAL DEFAULT 0,
      precio_proveedor REAL DEFAULT 0,
      precio_venta REAL NOT NULL,
      categoria TEXT,
      agotado INTEGER DEFAULT 0,
      foto TEXT,
      fecha_creacion TEXT DEFAULT (datetime('now')),
      catalogo_id INTEGER DEFAULT 1,
      atributos TEXT DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_nombre TEXT,
      cliente_telefono TEXT,
      direccion TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      domicilio REAL DEFAULT 0,
      metodo_pago TEXT DEFAULT 'efectivo',
      recargo_porcentaje REAL DEFAULT 0,
      total REAL NOT NULL,
      conseguido_por TEXT DEFAULT 'yo',
      fecha_entrega TEXT,
      fecha TEXT NOT NULL,
      realizado INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS configuracion (
      clave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );
  `);

  const catalogosExistentes = db.getAllSync('SELECT id FROM catalogos;');
  if (catalogosExistentes.length === 0) {
    CATALOGOS_DEFAULT.forEach(cat => {
      db.runSync(
        'INSERT INTO catalogos (nombre, emoji, foto, activo, orden) VALUES (?, ?, ?, ?, ?);',
        [cat.nombre, cat.emoji, cat.foto, cat.activo, cat.orden]
      );
    });
  }

  const claves = Object.keys(CONFIG_DEFAULT) as (keyof Config)[];
  claves.forEach(clave => {
    const existe = db.getAllSync('SELECT clave FROM configuracion WHERE clave = ?;', [clave]);
    if (existe.length === 0) {
      db.runSync('INSERT INTO configuracion (clave, valor) VALUES (?, ?);',
        [clave, String(CONFIG_DEFAULT[clave])]);
    }
  });
}

// ── CATÁLOGOS ──────────────────────────────────────────

export function obtenerCatalogos(): Catalogo[] {
  return db.getAllSync<Catalogo>('SELECT * FROM catalogos ORDER BY orden;');
}

export function obtenerCatalogosActivos(): Catalogo[] {
  return db.getAllSync<Catalogo>('SELECT * FROM catalogos WHERE activo = 1 ORDER BY orden;');
}

export function activarCatalogo(id: number) {
  db.runSync('UPDATE catalogos SET activo = 1 WHERE id = ?;', [id]);
}

export function actualizarCatalogo(catalogo: Catalogo) {
  db.runSync(
    'UPDATE catalogos SET nombre = ?, emoji = ?, foto = ? WHERE id = ?;',
    [catalogo.nombre, catalogo.emoji, catalogo.foto, catalogo.id]
  );
}

export function contarProductosPorCatalogo(catalogoId: number): number {
  const result = db.getAllSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM productos WHERE catalogo_id = ?;',
    [catalogoId]
  );
  return result[0]?.count || 0;
}

// ── PRODUCTOS ──────────────────────────────────────────

export function obtenerProductos(): Producto[] {
  return db.getAllSync<Producto>('SELECT * FROM productos ORDER BY categoria, nombre;');
}

export function obtenerProductosDisponibles(): Producto[] {
  return db.getAllSync<Producto>('SELECT * FROM productos WHERE agotado = 0 ORDER BY categoria, nombre;');
}

export function obtenerProductosPorCatalogo(catalogoId: number): Producto[] {
  return db.getAllSync<Producto>(
    'SELECT * FROM productos WHERE catalogo_id = ? ORDER BY categoria, nombre;',
    [catalogoId]
  );
}

export function obtenerProductosPorCategoria(categoria: string): Producto[] {
  if (categoria === 'Todos') return obtenerProductos();
  return db.getAllSync<Producto>(
    'SELECT * FROM productos WHERE categoria = ? ORDER BY nombre;',
    [categoria]
  );
}

export function obtenerProductosPorCatalogoYCategoria(catalogoId: number, categoria: string): Producto[] {
  if (categoria === 'Todos') return obtenerProductosPorCatalogo(catalogoId);
  return db.getAllSync<Producto>(
    'SELECT * FROM productos WHERE catalogo_id = ? AND categoria = ? ORDER BY nombre;',
    [catalogoId, categoria]
  );
}

export function obtenerProductosDisponiblesPorCatalogo(catalogoId: number): Producto[] {
  return db.getAllSync<Producto>(
    'SELECT * FROM productos WHERE catalogo_id = ? AND agotado = 0 ORDER BY categoria, nombre;',
    [catalogoId]
  );
}

export function obtenerProductosNuevos(): Producto[] {
  return db.getAllSync<Producto>(
    `SELECT * FROM productos
     WHERE agotado = 0
     AND fecha_creacion >= datetime('now', '-7 days')
     ORDER BY catalogo_id, categoria, nombre;`
  );
}

export function insertarProducto(producto: Omit<Producto, 'id' | 'fecha_creacion'>) {
  db.runSync(
    `INSERT INTO productos (nombre, gramaje, presentacion, precio_costo, precio_proveedor, precio_venta, categoria, agotado, foto, fecha_creacion, catalogo_id, atributos)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?);`,
    [producto.nombre, producto.gramaje, producto.presentacion, producto.precio_costo, producto.precio_proveedor, producto.precio_venta, producto.categoria, producto.agotado, producto.foto, producto.catalogo_id, producto.atributos || '{}']
  );
}

export function insertarProductosDeEjemplo() {
  const existentes = obtenerProductos();
  if (existentes.length > 0) return;
  const ejemplos: Omit<Producto, 'id' | 'fecha_creacion'>[] = [
    { nombre: 'Amoxicilina', gramaje: '500mg', presentacion: 'Blister x10', precio_costo: 30, precio_proveedor: 40, precio_venta: 45, categoria: 'Medicamentos Blister', agotado: 0, foto: '', catalogo_id: 1, atributos: '{}' },
    { nombre: 'Diclofenaco', gramaje: '75mg', presentacion: 'Ampolla', precio_costo: 40, precio_proveedor: 55, precio_venta: 60, categoria: 'Inyectables', agotado: 0, foto: '', catalogo_id: 1, atributos: '{}' },
    { nombre: 'Loratadina', gramaje: '10mg', presentacion: 'Blister x10', precio_costo: 18, precio_proveedor: 25, precio_venta: 30, categoria: 'Medicamentos Blister', agotado: 1, foto: '', catalogo_id: 1, atributos: '{}' },
    { nombre: 'Vitamina C', gramaje: '1g', presentacion: 'Tableta efervescente', precio_costo: 15, precio_proveedor: 22, precio_venta: 25, categoria: 'Medicamentos Blister', agotado: 0, foto: '', catalogo_id: 1, atributos: '{}' },
  ];
  ejemplos.forEach(insertarProducto);
}

export function obtenerProductoPorId(id: number): Producto | null {
  const resultado = db.getAllSync<Producto>('SELECT * FROM productos WHERE id = ?;', [id]);
  return resultado.length > 0 ? resultado[0] : null;
}

export function actualizarProducto(producto: Producto) {
  db.runSync(
    `UPDATE productos SET nombre = ?, gramaje = ?, presentacion = ?, precio_costo = ?, precio_proveedor = ?, precio_venta = ?, categoria = ?, agotado = ?, foto = ?, atributos = ?
     WHERE id = ?;`,
    [producto.nombre, producto.gramaje, producto.presentacion, producto.precio_costo, producto.precio_proveedor, producto.precio_venta, producto.categoria, producto.agotado, producto.foto, producto.atributos || '{}', producto.id]
  );
}

export function eliminarProducto(id: number) {
  db.runSync('DELETE FROM productos WHERE id = ?;', [id]);
}

// ── CONFIGURACIÓN ──────────────────────────────────────

export function obtenerConfig(): Config {
  const rows = db.getAllSync<{ clave: string; valor: string }>('SELECT * FROM configuracion;');
  const config = { ...CONFIG_DEFAULT };
  rows.forEach(row => {
    const clave = row.clave as keyof Config;
    if (clave in config) {
      if (['domicilio_min', 'domicilio_max', 'recargo_transferencia'].includes(clave)) {
        (config as any)[clave] = parseFloat(row.valor) || 0;
      } else {
        (config as any)[clave] = row.valor;
      }
    }
  });
  return config;
}

export function guardarConfig(config: Partial<Config>) {
  const claves = Object.keys(config) as (keyof Config)[];
  claves.forEach(clave => {
    db.runSync(
      'INSERT OR REPLACE INTO configuracion (clave, valor) VALUES (?, ?);',
      [clave, String(config[clave])]
    );
  });
}

// ── PEDIDOS ────────────────────────────────────────────

export function insertarPedido(pedido: Omit<Pedido, 'id'>): number {
  const result = db.runSync(
    `INSERT INTO pedidos (cliente_nombre, cliente_telefono, direccion, items, subtotal, domicilio, metodo_pago, recargo_porcentaje, total, conseguido_por, fecha_entrega, fecha, realizado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    [pedido.cliente_nombre, pedido.cliente_telefono, pedido.direccion, pedido.items, pedido.subtotal, pedido.domicilio, pedido.metodo_pago, pedido.recargo_porcentaje, pedido.total, pedido.conseguido_por, pedido.fecha_entrega, pedido.fecha]
  );
  return result.lastInsertRowId;
}

export function obtenerPedidosPendientes(): Pedido[] {
  return db.getAllSync<Pedido>('SELECT * FROM pedidos WHERE realizado = 0 ORDER BY fecha DESC;');
}

export function obtenerPedidosRealizados(): Pedido[] {
  return db.getAllSync<Pedido>('SELECT * FROM pedidos WHERE realizado = 1 ORDER BY fecha DESC;');
}

export function obtenerPedidoPorId(id: number): Pedido | null {
  const resultado = db.getAllSync<Pedido>('SELECT * FROM pedidos WHERE id = ?;', [id]);
  return resultado.length > 0 ? resultado[0] : null;
}

export function marcarPedidoRealizado(id: number) {
  db.runSync('UPDATE pedidos SET realizado = 1 WHERE id = ?;', [id]);
}

export function eliminarPedido(id: number) {
  db.runSync('DELETE FROM pedidos WHERE id = ?;', [id]);
}

export function contarPedidosPendientes(): number {
  const result = db.getAllSync<{ count: number }>('SELECT COUNT(*) as count FROM pedidos WHERE realizado = 0;');
  return result[0]?.count || 0;
}

// ── BACKUP ─────────────────────────────────────────────

export function generarBackup(): string {
  const productos = db.getAllSync<Producto>('SELECT * FROM productos;');
  const pedidos = db.getAllSync<Pedido>('SELECT * FROM pedidos;');
  const catalogos = db.getAllSync<Catalogo>('SELECT * FROM catalogos;');
  const config = db.getAllSync<{ clave: string; valor: string }>('SELECT * FROM configuracion;');

  const backup = {
    version: '1.0',
    fecha: new Date().toISOString(),
    app: 'NovaDrop',
    datos: { productos, pedidos, catalogos, config },
  };

  return JSON.stringify(backup, null, 2);
}

export function restaurarBackup(jsonString: string): { exito: boolean; mensaje: string } {
  try {
    const backup = JSON.parse(jsonString);
    if (!backup.datos || !backup.app) {
      return { exito: false, mensaje: 'El archivo no es un backup válido de NovaDrop.' };
    }

    const { productos, pedidos, catalogos, config } = backup.datos;

    db.execSync('DELETE FROM productos;');
    db.execSync('DELETE FROM pedidos;');
    db.execSync('DELETE FROM catalogos;');
    db.execSync('DELETE FROM configuracion;');

    catalogos?.forEach((cat: Catalogo) => {
      db.runSync(
        'INSERT INTO catalogos (id, nombre, emoji, foto, activo, orden) VALUES (?, ?, ?, ?, ?, ?);',
        [cat.id, cat.nombre, cat.emoji, cat.foto, cat.activo, cat.orden]
      );
    });

    productos?.forEach((p: Producto) => {
      db.runSync(
        `INSERT INTO productos (id, nombre, gramaje, presentacion, precio_costo, precio_proveedor, precio_venta, categoria, agotado, foto, fecha_creacion, catalogo_id, atributos)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [p.id, p.nombre, p.gramaje, p.presentacion, p.precio_costo, p.precio_proveedor, p.precio_venta, p.categoria, p.agotado, p.foto, p.fecha_creacion, p.catalogo_id, p.atributos]
      );
    });

    pedidos?.forEach((p: Pedido) => {
      db.runSync(
        `INSERT INTO pedidos (id, cliente_nombre, cliente_telefono, direccion, items, subtotal, domicilio, metodo_pago, recargo_porcentaje, total, conseguido_por, fecha_entrega, fecha, realizado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [p.id, p.cliente_nombre, p.cliente_telefono, p.direccion, p.items, p.subtotal, p.domicilio, p.metodo_pago, p.recargo_porcentaje, p.total, p.conseguido_por, p.fecha_entrega, p.fecha, p.realizado]
      );
    });

    config?.forEach((c: { clave: string; valor: string }) => {
      db.runSync('INSERT INTO configuracion (clave, valor) VALUES (?, ?);', [c.clave, c.valor]);
    });

    return { exito: true, mensaje: `Backup restaurado: ${productos?.length || 0} productos, ${pedidos?.length || 0} pedidos.` };
  } catch (e) {
    return { exito: false, mensaje: 'Error al leer el archivo. Asegúrate de que sea un backup válido.' };
  }
}