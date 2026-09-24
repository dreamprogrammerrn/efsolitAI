
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';

const Loader = () => {
  const pulseAnim = useRef(new Animated.Value(0.85)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.85,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim, scaleAnim]);

  return (
    <View style={styles.container}>

      {/* Background decoration */}
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      {/* Center content */}
      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: pulseAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          {/* <Text style={styles.logoText}>E</Text> */}
          <Image source={require('../assets/efsolit.png')} style={{height:70,width:70,borderRadius:20}}/>
        </View>

        <Text style={styles.brandName}>EFSOLIT AI</Text>

        <Text style={styles.tagline}>
          Smart. Simple. Powerful.
        </Text>
      </Animated.View>

      {/* Spinner */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
        />

        <Text style={styles.loadingText}>
          Loading...
        </Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#4F46E5',

    justifyContent: 'center',
    alignItems: 'center',

    overflow: 'hidden',
  },

  glowOne: {
    position: 'absolute',

    width: 300,
    height: 300,
    borderRadius: 150,

    backgroundColor: 'rgba(255,255,255,0.08)',

    top: -120,
    right: -120,
  },

  glowTwo: {
    position: 'absolute',

    width: 400,
    height: 400,
    borderRadius: 200,

    backgroundColor: 'rgba(255,255,255,0.05)',

    bottom: -200,
    left: -150,
  },

  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoCircle: {
    width: 82,
    height: 82,

    borderRadius: 41,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 18,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,

    elevation: 8,
  },

  logoText: {
    fontSize: 44,
    fontWeight: '800',
    color: '#4F46E5',
  },

  brandName: {
    fontSize: 26,
    fontWeight: '800',

    color: '#FFFFFF',

    letterSpacing: 1.5,
  },

  tagline: {
    marginTop: 6,

    fontSize: 13,
    fontWeight: '400',

    color: 'rgba(255,255,255,0.75)',

    letterSpacing: 0.5,
  },

  loaderContainer: {
    position: 'absolute',

    bottom: 70,

    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,

    fontSize: 12,
    fontWeight: '500',

    color: 'rgba(255,255,255,0.75)',

    letterSpacing: 0.5,
  },
});

export default Loader;
