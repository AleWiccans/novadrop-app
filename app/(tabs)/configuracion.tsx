import { Config, generarBackup, guardarConfig, obtenerConfig, restaurarBackup } from '@/database/db';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
;

export default function ConfiguracionScreen() {
  const [config, setConfig] = useState<Config | null>(null);
  const [nombreTienda, setNombreTienda] = useState('');
  const [telefono, setTelefono] = useState('');
  const [domicilioMin, setDomicilioMin] = useState('');
  const [domicilioMax, setDomicilioMax] = useState('');
  const [recargoTransferencia, setRecargoTransferencia] = useState('');
  const [moneda, setMoneda] = useState('');
  const [mensajePie, setMensajePie] = useState('');
  const [guardado, setGuardado] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const c = obtenerConfig();
      setConfig(c);
      setNombreTienda(c.nombre_tienda);
      setTelefono(c.telefono);
      setDomicilioMin(c.domicilio_min.toString());
      setDomicilioMax(c.domicilio_max.toString());
      setRecargoTransferencia(c.recargo_transferencia.toString());
      setMoneda(c.moneda);
      setMensajePie(c.mensaje_pie);
    }, [])
  );

  const guardar = () => {
    if (!nombreTienda.trim()) {
      Alert.alert('Campo requerido', 'El nombre de la tienda es obligatorio.');
      return;
    }
    guardarConfig({
      nombre_tienda: nombreTienda.trim(),
      telefono: telefono.trim(),
      domicilio_min: parseFloat(domicilioMin) || 0,
      domicilio_max: parseFloat(domicilioMax) || 0,
      recargo_transferencia: parseFloat(recargoTransferencia) || 0,
      moneda: moneda.trim() || 'MN',
      mensaje_pie: mensajePie.trim(),
    });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const exportarBackup = async () => {
    try {
      setExportando(true);
      const json = generarBackup();
      const fileUri = FileSystem.documentDirectory + 'novadrop-backup.json';
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });

      const puedeCompartir = await Sharing.isAvailableAsync();
      if (puedeCompartir) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Guardar backup de NovaDrop',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Backup guardado', `Archivo guardado en: ${fileUri}`);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo exportar el backup.');
    } finally {
      setExportando(false);
    }
  };

  const importarBackup = async () => {
    try {
      setImportando(true);
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (resultado.canceled) { setImportando(false); return; }

      const archivo = resultado.assets[0];
      const contenido = await FileSystem.readAsStringAsync(archivo.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert(
        'Restaurar backup',
        '⚠️ Esto reemplazará TODOS tus datos actuales con los del backup. ¿Estás seguro?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Restaurar',
            style: 'destructive',
            onPress: () => {
              const resultado = restaurarBackup(contenido);
              if (resultado.exito) {
                Alert.alert('✅ Restaurado', resultado.mensaje);
              } else {
                Alert.alert('❌ Error', resultado.mensaje);
              }
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'No se pudo leer el archivo de backup.');
    } finally {
      setImportando(false);
    }
  };

  if (!config) return <View style={s.container} />;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.label}>AJUSTES</Text>
        <Text style={s.title}>Configuración</Text>
      </View>

      {/* Mi tienda */}
      <View style={s.seccion}>
        <Text style={s.seccionTitulo}>
          <Ionicons name="storefront-outline" size={14} color="#5ef0ff" /> Mi tienda
        </Text>
        <Text style={s.fieldLabel}>Nombre de la tienda</Text>
        <TextInput style={s.input} value={nombreTienda} onChangeText={setNombreTienda} placeholder="Ej: NovaDrop" placeholderTextColor="#6b7494" />
        <Text style={s.fieldLabel}>Teléfono de contacto</Text>
        <TextInput style={s.input} value={telefono} onChangeText={setTelefono} placeholder="Ej: +53 59558767" placeholderTextColor="#6b7494" keyboardType="phone-pad" />
        <Text style={s.fieldLabel}>Moneda principal</Text>
        <TextInput style={s.input} value={moneda} onChangeText={setMoneda} placeholder="Ej: MN, USD" placeholderTextColor="#6b7494" autoCapitalize="characters" />
      </View>

      {/* Domicilio */}
      <View style={s.seccion}>
        <Text style={s.seccionTitulo}>
          <Ionicons name="bicycle-outline" size={14} color="#5ef0ff" /> Domicilio
        </Text>
        <View style={s.row}>
          <View style={s.half}>
            <Text style={s.fieldLabel}>Precio mínimo</Text>
            <TextInput style={s.input} value={domicilioMin} onChangeText={setDomicilioMin} placeholder="150" placeholderTextColor="#6b7494" keyboardType="numeric" />
          </View>
          <View style={s.half}>
            <Text style={s.fieldLabel}>Precio máximo</Text>
            <TextInput style={s.input} value={domicilioMax} onChangeText={setDomicilioMax} placeholder="200" placeholderTextColor="#6b7494" keyboardType="numeric" />
          </View>
        </View>
        <Text style={s.fieldInfo}>Se mostrará como: "Domicilio: ${domicilioMin} - ${domicilioMax} según zona"</Text>
      </View>

      {/* Pagos */}
      <View style={s.seccion}>
        <Text style={s.seccionTitulo}>
          <Ionicons name="phone-portrait-outline" size={14} color="#5ef0ff" /> Pagos
        </Text>
        <Text style={s.fieldLabel}>Recargo por transferencia (%)</Text>
        <TextInput style={s.input} value={recargoTransferencia} onChangeText={setRecargoTransferencia} placeholder="Ej: 10" placeholderTextColor="#6b7494" keyboardType="numeric" />
      </View>

      {/* Lista WhatsApp */}
      <View style={s.seccion}>
        <Text style={s.seccionTitulo}>
          <Ionicons name="chatbubble-outline" size={14} color="#5ef0ff" /> Lista WhatsApp
        </Text>
        <Text style={s.fieldLabel}>Mensaje al pie de la lista</Text>
        <TextInput style={[s.input, { minHeight: 80 }]} value={mensajePie} onChangeText={setMensajePie} placeholder="Ej: Solo hacemos domicilio..." placeholderTextColor="#6b7494" multiline />
      </View>

      <Pressable style={[s.button, guardado && s.buttonGuardado]} onPress={guardar}>
        <Ionicons name={guardado ? 'checkmark-circle' : 'save-outline'} size={18} color="#06121a" />
        <Text style={s.buttonText}>{guardado ? '¡Guardado!' : 'Guardar configuración'}</Text>
      </Pressable>

      {/* Backup */}
      <View style={s.seccion}>
        <Text style={s.seccionTitulo}>
          <Ionicons name="cloud-outline" size={14} color="#5ef0ff" /> Respaldo de datos
        </Text>
        <Text style={s.fieldInfo}>
          Exporta todos tus datos (productos, pedidos, catálogos) en un archivo JSON. Puedes guardarlo en Google Drive, WhatsApp o correo. Para restaurar, importa ese mismo archivo.
        </Text>

        <Pressable style={s.backupBtn} onPress={exportarBackup} disabled={exportando}>
          <Ionicons name="download-outline" size={20} color="#06121a" />
          <Text style={s.backupBtnText}>{exportando ? 'Exportando...' : 'Exportar backup'}</Text>
        </Pressable>

        <Pressable style={[s.backupBtn, s.backupBtnImportar]} onPress={importarBackup} disabled={importando}>
          <Ionicons name="arrow-up-circle-outline" size={20} color="#cbb8ff" />
          <Text style={[s.backupBtnText, { color: '#cbb8ff' }]}>{importando ? 'Importando...' : 'Importar backup'}</Text>
        </Pressable>

        <View style={s.backupInfo}>
          <Ionicons name="information-circle-outline" size={14} color="#6b7494" />
          <Text style={s.backupInfoText}>
            El archivo siempre se llama "novadrop-backup.json". Si lo subes a Google Drive y lo reemplazas cada vez, siempre tendrás solo un archivo actualizado.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a' },
  content: { paddingBottom: 50 },
  header: { paddingTop: 60, paddingHorizontal: 18, paddingBottom: 18, backgroundColor: '#10162b' },
  label: { color: '#5ef0ff', fontSize: 11, letterSpacing: 2, opacity: 0.7, marginBottom: 2 },
  title: { color: '#fff', fontSize: 22, fontWeight: '500' },
  seccion: {
    margin: 18, marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderRadius: 16, padding: 16,
  },
  seccionTitulo: { color: '#5ef0ff', fontSize: 13, fontWeight: '500', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 },
  fieldLabel: { color: '#6b7494', fontSize: 12, marginBottom: 6, marginTop: 10 },
  fieldInfo: { color: '#6b7494', fontSize: 11, marginTop: 8, lineHeight: 16 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(94,240,255,0.15)', borderWidth: 1,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 14,
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    margin: 18, backgroundColor: '#00e5ff', borderRadius: 14, paddingVertical: 14,
    shadowColor: '#7c4dff', shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
  },
  buttonGuardado: { backgroundColor: '#7c4dff' },
  buttonText: { color: '#06121a', fontSize: 14, fontWeight: '600' },
  backupBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#00e5ff', borderRadius: 12, paddingVertical: 12, marginTop: 14,
  },
  backupBtnImportar: {
    backgroundColor: 'rgba(124,77,255,0.1)', borderColor: 'rgba(124,77,255,0.3)', borderWidth: 1,
  },
  backupBtnText: { color: '#06121a', fontSize: 14, fontWeight: '600' },
  backupInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 14,
    padding: 10, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8,
  },
  backupInfoText: { color: '#6b7494', fontSize: 11, flex: 1, lineHeight: 16 },
});