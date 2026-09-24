import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewScreen = ({ navigation, route }: any) => {
  const { url } = route.params;
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Efsolit AI</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loaderText}>Loading efsolitai.in...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#4F46E5',
  },
  backText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  webviewContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1 },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
});