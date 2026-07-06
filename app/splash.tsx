import { router } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const subtitleOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  const navegar = () => {
    router.replace('/(tabs)');
  };

  useEffect(() => {
    // Secuencia de animación
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    logoScale.value = withDelay(300, withTiming(1, { duration: 800 }));
    glowOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    subtitleOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));

    // Salir después de 2.8 segundos
    setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(navegar)();
      });
    }, 2800);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: withTiming(subtitleOpacity.value === 0 ? 10 : 0, { duration: 400 }) }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[s.container, screenStyle]}>
      {/* Fondo con partículas de luz */}
      <Animated.View style={[s.glow, s.glowTop, glowStyle]} />
      <Animated.View style={[s.glow, s.glowBottom, glowStyle]} />

      <View style={s.centro}>
        {/* Logo */}
        <Animated.View style={[s.logoContainer, logoStyle]}>
          <View style={s.logoCircle}>
            <Text style={s.logoEmoji}>💊</Text>
          </View>
          <View style={s.logoBarra} />
        </Animated.View>

        {/* Nombre */}
        <Animated.Text style={[s.nombre, logoStyle]}>
          NovaDrop
        </Animated.Text>

        {/* Subtítulo */}
        <Animated.Text style={[s.subtitulo, subtitleStyle]}>
          Tu negocio, en tu mano
        </Animated.Text>

        {/* Línea decorativa */}
        <Animated.View style={[s.lineaDecorativa, subtitleStyle]}>
          <View style={s.lineaIzq} />
          <Text style={s.lineaPunto}>◆</Text>
          <View style={s.lineaDer} />
        </Animated.View>
      </View>

      {/* Versión */}
      <Animated.Text style={[s.version, subtitleStyle]}>v1.0</Animated.Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
  },
  glowTop: {
    top: -width * 0.3,
    left: -width * 0.1,
    backgroundColor: 'rgba(0,229,255,0.06)',
  },
  glowBottom: {
    bottom: -width * 0.3,
    right: -width * 0.1,
    backgroundColor: 'rgba(124,77,255,0.06)',
  },
  centro: {
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(0,229,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e5ff',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  logoEmoji: {
    fontSize: 48,
  },
  logoBarra: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(0,229,255,0.4)',
    marginTop: 8,
  },
  nombre: {
    fontSize: 42,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 6,
    textShadowColor: 'rgba(0,229,255,0.8)',
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitulo: {
    fontSize: 13,
    color: '#6b7494',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  lineaDecorativa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  lineaIzq: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(0,229,255,0.2)',
  },
  lineaPunto: {
    color: '#00e5ff',
    fontSize: 8,
    opacity: 0.6,
  },
  lineaDer: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(0,229,255,0.2)',
  },
  version: {
    position: 'absolute',
    bottom: 50,
    color: 'rgba(107,116,148,0.5)',
    fontSize: 11,
    letterSpacing: 2,
  },
});