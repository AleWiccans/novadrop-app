import { useEffect } from 'react';
import { TextStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
};

export function GlowText({ children, style, color = '#00e5ff' }: Props) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.55, { duration: 2400 }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[
      style,
      animStyle,
      {
        color,
        textShadowColor: color + 'aa',
        textShadowRadius: 14,
        textShadowOffset: { width: 0, height: 0 },
      }
    ]}>
      {children}
    </Animated.Text>
  );
}