// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   StatusBar,
//   BackHandler,
//   Platform,
//   Alert,
//   Linking,
//   AppState,
//   AppStateStatus,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { WebView, WebViewNavigation } from 'react-native-webview';
// import type {
//   WebViewErrorEvent,
//   WebViewHttpErrorEvent,
//   ShouldStartLoadRequest,
//   WebViewMessageEvent,
// } from 'react-native-webview/lib/WebViewTypes';
// import NetInfo from '@react-native-community/netinfo';

// // ─────────────────────────────────────────────────────────────
// // CONFIG
// // ─────────────────────────────────────────────────────────────
// const DEFAULT_URL = 'https://efsolitai.in';
// const ALLOWED_HOSTS = ['efsolitai.in', 'www.efsolitai.in'];

// // External schemes we hand off to the OS
// const EXTERNAL_SCHEMES = [
//   'tel:',
//   'mailto:',
//   'sms:',
//   'whatsapp:',
//   'upi:',
//   'intent:',
//   'market:',
//   'geo:',
// ];

// // ─────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────
// interface RouteParams {
//   url?: string;
// }

// interface Props {
//   navigation: {
//     goBack: () => void;
//     canGoBack: () => boolean;
//   };
//   route: {
//     params?: RouteParams;
//   };
// }

// type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

// // ─────────────────────────────────────────────────────────────
// // COMPONENT
// // ─────────────────────────────────────────────────────────────
// const WebViewScreen: React.FC<Props> = ({ navigation, route }) => {
//   const initialUrl = route?.params?.url || DEFAULT_URL;

//   const webViewRef = useRef<WebView>(null);
//   const canGoBackRef = useRef(false);
//   const appStateRef = useRef<AppStateStatus>(AppState.currentState);
//   const isMountedRef = useRef(true);

//   const [loadState, setLoadState] = useState<LoadState>('loading');
//   const [progress, setProgress] = useState(0);
//   const [currentUrl, setCurrentUrl] = useState(initialUrl);
//   const [canGoBack, setCanGoBack] = useState(false);
//   const [canGoForward, setCanGoForward] = useState(false);
//   const [reloadKey, setReloadKey] = useState(0);
//   const [isOffline, setIsOffline] = useState(false);

//   // ───────────────────────────────────────────────────────────
//   // NETWORK MONITORING
//   // ───────────────────────────────────────────────────────────
//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener(state => {
//       const offline =
//         state.isConnected === false ||
//         state.isInternetReachable === false;
//       setIsOffline(offline);
//     });
//     return () => unsubscribe();
//   }, []);

//   // ───────────────────────────────────────────────────────────
//   // TRACK APP STATE (pause/resume WebView safely)
//   // ───────────────────────────────────────────────────────────
//   useEffect(() => {
//     const sub = AppState.addEventListener('change', next => {
//       appStateRef.current = next;
//     });
//     return () => sub.remove();
//   }, []);

//   // ───────────────────────────────────────────────────────────
//   // CLEANUP
//   // ───────────────────────────────────────────────────────────
//   useEffect(() => {
//     isMountedRef.current = true;
//     return () => {
//       isMountedRef.current = false;
//     };
//   }, []);

//   // ───────────────────────────────────────────────────────────
//   // HELPERS
//   // ───────────────────────────────────────────────────────────
//   const updateNavState = useCallback((navState: WebViewNavigation) => {
//     if (!isMountedRef.current) return;
//     canGoBackRef.current = navState.canGoBack;
//     setCanGoBack(navState.canGoBack);
//     setCanGoForward(navState.canGoForward);
//     setCurrentUrl(navState.url || initialUrl);
//   }, [initialUrl]);

//   const openExternal = useCallback(async (url: string) => {
//     try {
//       const supported = await Linking.canOpenURL(url);
//       if (supported) {
//         await Linking.openURL(url);
//       } else {
//         Alert.alert('Unable to open', `No app found to handle: ${url}`);
//       }
//     } catch (err) {
//       console.warn('[WebView] openExternal error:', err);
//     }
//   }, []);

//   const handleGoBack = useCallback(() => {
//     if (canGoBackRef.current && webViewRef.current) {
//       webViewRef.current.goBack();
//     } else {
//       navigation.goBack();
//     }
//   }, [navigation]);

//   const handleRetry = useCallback(() => {
//     setLoadState('loading');
//     setProgress(0);
//     setReloadKey(k => k + 1);
//   }, []);

//   // ───────────────────────────────────────────────────────────
//   // ANDROID HARDWARE BACK
//   // ───────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (Platform.OS !== 'android') return;

//     const sub = BackHandler.addEventListener('hardwareBackPress', () => {
//       if (canGoBackRef.current && webViewRef.current) {
//         webViewRef.current.goBack();
//         return true;
//       }
//       navigation.goBack();
//       return true;
//     });

//     return () => sub.remove();
//   }, [navigation]);

//   // ───────────────────────────────────────────────────────────
//   // NAVIGATION GUARD (block external links / open in system)
//   // ───────────────────────────────────────────────────────────
//   const onShouldStartLoadWithRequest = useCallback(
//     (request: ShouldStartLoadRequest): boolean => {
//       const { url } = request;

//       // Allow internal navigation
//       try {
//         const parsed = new URL(url);
//         const host = parsed.hostname.replace(/^www\./, '');

//         if (
//           ALLOWED_HOSTS.some(h => host === h.replace(/^www\./, '')) ||
//           url.startsWith('about:') ||
//           url.startsWith('data:') ||
//           url.startsWith('blob:')
//         ) {
//           return true;
//         }

//         // External schemes → open with OS
//         if (EXTERNAL_SCHEMES.some(s => url.startsWith(s))) {
//           openExternal(url);
//           return false;
//         }

//         // Any other https link → still keep inside app
//         // (change to `openExternal(url); return false;` if you want to force external)
//         if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
//           return true;
//         }

//         openExternal(url);
//         return false;
//       } catch {
//         return false;
//       }
//     },
//     [openExternal],
//   );

//   // ───────────────────────────────────────────────────────────
//   // MESSAGE BRIDGE (website → React Native)
//   // ───────────────────────────────────────────────────────────
//   const onMessage = useCallback(
//     (event: WebViewMessageEvent) => {
//       try {
//         const data = JSON.parse(event.nativeEvent.data);
//         if (__DEV__) console.log('[WebView message]', data);

//         switch (data?.type) {
//           case 'CLOSE':
//             navigation.goBack();
//             break;
//           case 'OPEN_EXTERNAL':
//             if (typeof data.url === 'string') openExternal(data.url);
//             break;
//           case 'NAVIGATE':
//             if (typeof data.url === 'string' && webViewRef.current) {
//               webViewRef.current.injectJavaScript(
//                 `window.location.href = ${JSON.stringify(data.url)}; true;`,
//               );
//             }
//             break;
//           default:
//             break;
//         }
//       } catch {
//         // Non-JSON message — ignore
//       }
//     },
//     [navigation, openExternal],
//   );

//   // ───────────────────────────────────────────────────────────
//   // LOADING EVENTS
//   // ───────────────────────────────────────────────────────────
//   const onLoadStart = useCallback(() => setLoadState('loading'), []);

//   const onLoadProgress = useCallback(
//     ({ nativeEvent }: { nativeEvent: { progress: number } }) => {
//       setProgress(nativeEvent.progress);
//     },
//     [],
//   );

//   const onLoadEnd = useCallback(() => {
//     setLoadState(prev => (prev === 'error' ? prev : 'loaded'));
//   }, []);

//   const onError = useCallback((e: WebViewErrorEvent) => {
//     console.warn('[WebView error]', e.nativeEvent);
//     setLoadState('error');
//   }, []);

//   const onHttpError = useCallback((e: WebViewHttpErrorEvent) => {
//     // Only treat serious server errors as fatal
//     const status = e.nativeEvent.statusCode;
//     if (status >= 500) {
//       console.warn('[WebView http error]', status);
//       setLoadState('error');
//     }
//   }, []);

//   // ───────────────────────────────────────────────────────────
//   // DERIVED
//   // ───────────────────────────────────────────────────────────
//   const hostname = useMemo(() => {
//     try {
//       return new URL(currentUrl).hostname.replace(/^www\./, '');
//     } catch {
//       return 'efsolitai.in';
//     }
//   }, [currentUrl]);

//   const injectedJS = useMemo(
//     () => `
//       (function () {
//         if (window.__RN_BRIDGE__) return;
//         window.__RN_BRIDGE__ = true;
//         // Hide potential horizontal overflow
//         var style = document.createElement('style');
//         style.innerHTML = 'body{overflow-x:hidden;}';
//         document.head.appendChild(style);
//       })();
//       true;
//     `,
//     [],
//   );

//   // ───────────────────────────────────────────────────────────
//   // RENDER
//   // ───────────────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>

    

//       {/* ── PROGRESS BAR ─────────────────────────────────── */}
//       {loadState === 'loading' && (
//         <View style={styles.progressTrack}>
//           <View
//             style={[
//               styles.progressBar,
//               { width: `${Math.max(progress * 100, 5)}%` },
//             ]}
//           />
//         </View>
//       )}

//       {/* ── WEBVIEW ──────────────────────────────────────── */}
//       <View style={styles.webviewContainer}>
//         {!isOffline && loadState !== 'error' && (
//           <WebView
//             key={reloadKey}
//             ref={webViewRef}
//             source={{ uri: initialUrl }}
//             style={styles.webview}
//             // ── Behaviour
//             originWhitelist={['*']}
//             javaScriptEnabled
//             domStorageEnabled
//             databaseEnabled
//             cacheEnabled
//             cacheMode="LOAD_DEFAULT"
//             // ── Cookies / Sessions
//             sharedCookiesEnabled
//             thirdPartyCookiesEnabled
//             // ── Media
//             allowsInlineMediaPlayback
//             mediaPlaybackRequiresUserAction={false}
//             allowsFullscreenVideo
//             // ── Android
//             setSupportMultipleWindows={false}
//             mixedContentMode="never"
//             allowFileAccess={false}
//             allowUniversalAccessFromFileURLs={false}
//             // ── Security
//             javaScriptCanOpenWindowsAutomatically={false}
//             // ── UX
//             pullToRefreshEnabled
//             overScrollMode="never"
//             bounces={false}
//             showsHorizontalScrollIndicator={false}
//             showsVerticalScrollIndicator
//             // ── Events
//             onLoadStart={onLoadStart}
//             onLoadProgress={onLoadProgress}
//             onLoadEnd={onLoadEnd}
//             onError={onError}
//             onHttpError={onHttpError}
//             onNavigationStateChange={updateNavState}
//             onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
//             onMessage={onMessage}
//             injectedJavaScript={injectedJS}
//             // ── Crash recovery
//             onContentProcessDidTerminate={() => {
//               webViewRef.current?.reload();
//             }}
//             onRenderProcessGone={() => {
//               setLoadState('error');
//               return true; // we handled it
//             }}
//           />
//         )}

//         {/* ── LOADER OVERLAY (first load only) ──────────── */}
//         {loadState === 'loading' && progress < 0.15 && !isOffline && (
//           <View style={styles.loaderOverlay} pointerEvents="none">
//             <ActivityIndicator size="large" color="#4F46E5" />
//             <Text style={styles.loaderText}>Loading {hostname}…</Text>
//           </View>
//         )}

//         {/* ── OFFLINE STATE ─────────────────────────────── */}
//         {isOffline && (
//           <View style={styles.stateOverlay}>
//             <Text style={styles.stateEmoji}>📡</Text>
//             <Text style={styles.stateTitle}>No Internet Connection</Text>
//             <Text style={styles.stateBody}>
//               Please check your network and try again.
//             </Text>
//             <TouchableOpacity style={styles.stateButton} onPress={handleRetry}>
//               <Text style={styles.stateButtonText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* ── ERROR STATE ──────────────────────────────── */}
//         {!isOffline && loadState === 'error' && (
//           <View style={styles.stateOverlay}>
//             <Text style={styles.stateEmoji}>⚠️</Text>
//             <Text style={styles.stateTitle}>Something went wrong</Text>
//             <Text style={styles.stateBody}>
//               We couldn’t load the page. Please try again.
//             </Text>
//             <TouchableOpacity style={styles.stateButton} onPress={handleRetry}>
//               <Text style={styles.stateButtonText}>Reload</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       {/* ── BOTTOM NAV (optional) ─────────────────────────── */}
     
//     </SafeAreaView>
//   );
// };

// export default WebViewScreen;

// // ─────────────────────────────────────────────────────────────
// // STYLES
// // ─────────────────────────────────────────────────────────────
// const BRAND = '#4F46E5';

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },

//   // Header
//   header: {
//     height: 56,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 8,
//     backgroundColor: BRAND,
//   },
//   headerBtn: {
//     width: 48,
//     height: 48,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerBtnText: {
//     color: '#FFFFFF',
//     fontSize: 22,
//     fontWeight: '600',
//   },
//   headerCenter: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   title: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   subtitle: {
//     color: 'rgba(255,255,255,0.85)',
//     fontSize: 11,
//     marginTop: 1,
//   },

//   // Progress
//   progressTrack: {
//     height: 2,
//     backgroundColor: 'rgba(79,70,229,0.15)',
//   },
//   progressBar: {
//     height: 2,
//     backgroundColor: BRAND,
//   },

//   // WebView
//   webviewContainer: {
//     flex: 1,
//     position: 'relative',
//     backgroundColor: '#FFFFFF',
//   },
//   webview: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },

//   // Loader
//   loaderOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: '#FFFFFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loaderText: {
//     marginTop: 12,
//     color: '#6B7280',
//     fontSize: 14,
//   },

//   // Error / offline
//   stateOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: '#FFFFFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 32,
//   },
//   stateEmoji: {
//     fontSize: 48,
//     marginBottom: 12,
//   },
//   stateTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 6,
//     textAlign: 'center',
//   },
//   stateBody: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   stateButton: {
//     backgroundColor: BRAND,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   stateButtonText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontWeight: '600',
//   },

//   // Bottom bar
//   bottomBar: {
//     flexDirection: 'row',
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderTopColor: '#E5E7EB',
//     backgroundColor: '#FAFAFA',
//   },
//   bottomBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   bottomBtnDisabled: {
//     opacity: 0.4,
//   },
//   bottomBtnText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: BRAND,
//   },
// });

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  BackHandler,
  Platform,
  Alert,
  Linking,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import type {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';
import NetInfo from '@react-native-community/netinfo';

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────
// Apex domain — DO NOT change to www. or login cookies won't match.
const DEFAULT_URL = 'https://efsolitai.in';

const ALLOWED_HOSTS = [
  'efsolitai.in',
  'www.efsolitai.in',
  // Google OAuth domains required for the "Sign in with Google" flow.
  // These MUST be allowed inside the WebView so the OAuth handshake
  // can complete and set the session cookie on efsolitai.in.
  'accounts.google.com',
  'accounts.youtube.com',
];

// External schemes we hand off to the OS
const EXTERNAL_SCHEMES = [
  'tel:',
  'mailto:',
  'sms:',
  'whatsapp:',
  'upi:',
  'intent:',
  'market:',
  'geo:',
];

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface RouteParams {
  url?: string;
}

interface Props {
  navigation: {
    goBack: () => void;
    canGoBack: () => boolean;
  };
  route: {
    params?: RouteParams;
  };
}

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
const WebViewScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialUrl = route?.params?.url || DEFAULT_URL;

  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isMountedRef = useRef(true);

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [progress, setProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // ───────────────────────────────────────────────────────────
  // NETWORK MONITORING
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline =
        state.isConnected === false ||
        state.isInternetReachable === false;
      setIsOffline(offline);
    });
    return () => unsubscribe();
  }, []);

  // ───────────────────────────────────────────────────────────
  // TRACK APP STATE (pause/resume WebView safely)
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, []);

  // ───────────────────────────────────────────────────────────
  // CLEANUP
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ───────────────────────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────────────────────
  const updateNavState = useCallback(
    (navState: WebViewNavigation) => {
      if (!isMountedRef.current) return;
      canGoBackRef.current = navState.canGoBack;
      setCanGoBack(navState.canGoBack);
      setCanGoForward(navState.canGoForward);
      setCurrentUrl(navState.url || initialUrl);
    },
    [initialUrl],
  );

  const openExternal = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to open', `No app found to handle: ${url}`);
      }
    } catch (err) {
      console.warn('[WebView] openExternal error:', err);
    }
  }, []);

  const handleGoBack = useCallback(() => {
    if (canGoBackRef.current && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      navigation.goBack();
    }
  }, [navigation]);

  // ✅ CHANGED: reload in-place — keeps the SAME WebView instance,
  // so cookies, localStorage, DOM storage, and the JS session survive.
  const handleRetry = useCallback(() => {
    setLoadState('loading');
    setProgress(0);
    webViewRef.current?.reload();
  }, []);

  // ───────────────────────────────────────────────────────────
  // ANDROID HARDWARE BACK
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      navigation.goBack();
      return true;
    });

    return () => sub.remove();
  }, [navigation]);

  // ───────────────────────────────────────────────────────────
  // NAVIGATION GUARD (block external links / open in system)
  // ───────────────────────────────────────────────────────────
  const onShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest): boolean => {
      const { url } = request;

      try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, '');

        // Allow internal + OAuth hosts
        if (
          ALLOWED_HOSTS.some(h => host === h.replace(/^www\./, '')) ||
          url.startsWith('about:') ||
          url.startsWith('data:') ||
          url.startsWith('blob:')
        ) {
          return true;
        }

        // External schemes → open with OS
        if (EXTERNAL_SCHEMES.some(s => url.startsWith(s))) {
          openExternal(url);
          return false;
        }

        // Any other http/https link → keep inside app
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
          return true;
        }

        openExternal(url);
        return false;
      } catch {
        return false;
      }
    },
    [openExternal],
  );

  // ───────────────────────────────────────────────────────────
  // MESSAGE BRIDGE (website → React Native)
  // ───────────────────────────────────────────────────────────
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (__DEV__) console.log('[WebView message]', data);

        switch (data?.type) {
          case 'CLOSE':
            navigation.goBack();
            break;
          case 'OPEN_EXTERNAL':
            if (typeof data.url === 'string') openExternal(data.url);
            break;
          case 'NAVIGATE':
            if (typeof data.url === 'string' && webViewRef.current) {
              webViewRef.current.injectJavaScript(
                `window.location.href = ${JSON.stringify(data.url)}; true;`,
              );
            }
            break;
          default:
            break;
        }
      } catch {
        // Non-JSON message — ignore
      }
    },
    [navigation, openExternal],
  );

  // ───────────────────────────────────────────────────────────
  // LOADING EVENTS
  // ───────────────────────────────────────────────────────────
  const onLoadStart = useCallback(() => setLoadState('loading'), []);

  const onLoadProgress = useCallback(
    ({ nativeEvent }: { nativeEvent: { progress: number } }) => {
      setProgress(nativeEvent.progress);
    },
    [],
  );

  const onLoadEnd = useCallback(() => {
    setLoadState(prev => (prev === 'error' ? prev : 'loaded'));
  }, []);

  const onError = useCallback((e: WebViewErrorEvent) => {
    console.warn('[WebView error]', e.nativeEvent);
    setLoadState('error');
  }, []);

  const onHttpError = useCallback((e: WebViewHttpErrorEvent) => {
    const status = e.nativeEvent.statusCode;
    if (status >= 500) {
      console.warn('[WebView http error]', status);
      setLoadState('error');
    }
  }, []);

  // ───────────────────────────────────────────────────────────
  // DERIVED
  // ───────────────────────────────────────────────────────────
  const hostname = useMemo(() => {
    try {
      return new URL(currentUrl).hostname.replace(/^www\./, '');
    } catch {
      return 'efsolitai.in';
    }
  }, [currentUrl]);

  const injectedJS = useMemo(
    () => `
      (function () {
        if (window.__RN_BRIDGE__) return;
        window.__RN_BRIDGE__ = true;
        var style = document.createElement('style');
        style.innerHTML = 'body{overflow-x:hidden;}';
        document.head.appendChild(style);
      })();
      true;
    `,
    [],
  );

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── PROGRESS BAR ─────────────────────────────────── */}
      {loadState === 'loading' && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.max(progress * 100, 5)}%` },
            ]}
          />
        </View>
      )}

      {/* ── WEBVIEW ──────────────────────────────────────── */}
      <View style={styles.webviewContainer}>
        {!isOffline && loadState !== 'error' && (
          <WebView
            ref={webViewRef}
            source={{ uri: initialUrl }}
            style={styles.webview}

            // ── Behaviour
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            databaseEnabled
            cacheEnabled
            cacheMode="LOAD_DEFAULT"

            // ✅ NEW: explicitly disable incognito mode.
            // Default is false, but explicit = never wipe on crash/restart.
            incognito={false}

            // ── Cookies / Sessions  (KEEP ALL OF THESE)
            sharedCookiesEnabled
            thirdPartyCookiesEnabled

            // ── Media
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo

            // ── Android
            setSupportMultipleWindows={false}
            mixedContentMode="never"
            allowFileAccess={false}
            allowUniversalAccessFromFileURLs={false}

            // ── Security
            javaScriptCanOpenWindowsAutomatically={false}

            // ── UX
            pullToRefreshEnabled
            overScrollMode="never"
            bounces={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator

            // ── Events
            onLoadStart={onLoadStart}
            onLoadProgress={onLoadProgress}
            onLoadEnd={onLoadEnd}
            onError={onError}
            onHttpError={onHttpError}
            onNavigationStateChange={updateNavState}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            onMessage={onMessage}
            injectedJavaScript={injectedJS}

            // ── Crash recovery (session-safe)
            onContentProcessDidTerminate={() => {
              webViewRef.current?.reload();
            }}
            onRenderProcessGone={() => {
              setLoadState('error');
              return true; // we handled it
            }}
          />
        )}

        {/* ── LOADER OVERLAY (first load only) ──────────── */}
        {loadState === 'loading' && progress < 0.15 && !isOffline && (
          <View style={styles.loaderOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loaderText}>Loading {hostname}…</Text>
          </View>
        )}

        {/* ── OFFLINE STATE ─────────────────────────────── */}
        {isOffline && (
          <View style={styles.stateOverlay}>
            <Text style={styles.stateEmoji}>📡</Text>
            <Text style={styles.stateTitle}>No Internet Connection</Text>
            <Text style={styles.stateBody}>
              Please check your network and try again.
            </Text>
            <TouchableOpacity
              style={styles.stateButton}
              onPress={handleRetry}
            >
              <Text style={styles.stateButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── ERROR STATE ──────────────────────────────── */}
        {!isOffline && loadState === 'error' && (
          <View style={styles.stateOverlay}>
            <Text style={styles.stateEmoji}>⚠️</Text>
            <Text style={styles.stateTitle}>Something went wrong</Text>
            <Text style={styles.stateBody}>
              We couldn’t load the page. Please try again.
            </Text>
            <TouchableOpacity
              style={styles.stateButton}
              onPress={handleRetry}
            >
              <Text style={styles.stateButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default WebViewScreen;

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const BRAND = '#4F46E5';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header (unused, kept for reference)
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    backgroundColor: BRAND,
  },
  headerBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 1,
  },

  // Progress
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(79,70,229,0.15)',
  },
  progressBar: {
    height: 2,
    backgroundColor: BRAND,
  },

  // WebView
  webviewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Loader
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },

  // Error / offline
  stateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  stateBody: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  stateButton: {
    backgroundColor: BRAND,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  stateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Bottom bar (unused, kept for reference)
  bottomBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  bottomBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnDisabled: {
    opacity: 0.4,
  },
  bottomBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND,
  },
});