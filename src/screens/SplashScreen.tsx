import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
  type ImageResizeMode,
  Pressable,
  Text,
} from 'react-native';
import { spacing, textStyles } from '../theme';

type SplashScreenProps = {
  onContinue: () => void;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  const { width, height } = useWindowDimensions();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, translateY]);

  const screenRatio = height / width;
  const shouldUseCover = screenRatio >= 1.75;
  const imageResizeMode: ImageResizeMode = shouldUseCover ? 'cover' : 'contain';

  return (
    <Pressable style={styles.pressable} onPress={onContinue}>
      <View style={styles.container}>
        <StatusBar backgroundColor="#0347D0" barStyle="light-content" />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.artworkWrapper,
            {
              opacity,
              transform: [{ scale }, { translateY }],
            },
          ]}
        >
          <Image
            source={require('../../assets/splash_screen.png')}
            style={styles.artwork}
            resizeMode={imageResizeMode}
          />
        </Animated.View>

        <View pointerEvents="none" style={styles.loaderOverlay}>
          <ActivityIndicator size="small" color="#FFFFFFCC" />
        </View>

        {__DEV__ && (
          <View pointerEvents="none" style={styles.devHint}>
            <Text style={styles.devHintText}>Tap anywhere to continue</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0347D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  loaderOverlay: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
  },
  devHint: {
    position: 'absolute',
    top: spacing.xl,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  devHintText: {
    ...textStyles.caption,
    color: '#FFFFFFE6',
    letterSpacing: 0.4,
  },
});

export default SplashScreen;