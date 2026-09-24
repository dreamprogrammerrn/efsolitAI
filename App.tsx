/**
 * Complete React Native App with Redux Toolkit
 * NO External Dependencies - Uses only emojis and pure RN
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WebViewScreen from './src/screens/WebViewScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const { width, height } = Dimensions.get('window');

// ==================== API CONFIGURATION ====================
const API_BASE_URL = 'https://api.efsolitai.in'; // Replace with actual API

// ==================== API SERVICES ====================
const apiService = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  getDashboardData: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard');
    return response.json();
  },
};

// ==================== REDUX SLICES ====================
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      AsyncStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      AsyncStorage.removeItem('user');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: null,
    isLoading: false,
    error: null,
    stats: {
      leads: 0,
      meetings: 0,
      replies: 0,
      conversion: 0,
    },
    recentActivity: [],
  },
  reducers: {
    setDashboardData: (state, action) => {
      state.data = action.payload;
      state.stats = action.payload.stats || state.stats;
      state.recentActivity = action.payload.recentActivity || [];
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// ==================== ASYNC THUNKS ====================
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, { dispatch }) => {
    try {
      dispatch(authSlice.actions.setLoading(true));
      const response = await apiService.login(email, password);
      dispatch(authSlice.actions.setUser({ user: response.user, token: response.token }));
      dispatch(authSlice.actions.setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(authSlice.actions.setError(error.message));
      dispatch(authSlice.actions.setLoading(false));
      throw error;
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: any, { dispatch }) => {
    try {
      dispatch(authSlice.actions.setLoading(true));
      const response = await apiService.register(userData);
      dispatch(authSlice.actions.setUser({ user: response.user, token: response.token }));
      dispatch(authSlice.actions.setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(authSlice.actions.setError(error.message));
      dispatch(authSlice.actions.setLoading(false));
      throw error;
    }
  }
);

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { getState, dispatch }) => {
    try {
      dispatch(dashboardSlice.actions.setLoading(true));
      const { auth } = getState() as RootState;
      if (!auth.token) throw new Error('No token available');
      
      const response = await apiService.getDashboardData(auth.token);
      dispatch(dashboardSlice.actions.setDashboardData(response));
      dispatch(dashboardSlice.actions.setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(dashboardSlice.actions.setError(error.message));
      dispatch(dashboardSlice.actions.setLoading(false));
      throw error;
    }
  }
);

// ==================== STORE CONFIGURATION ====================
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    dashboard: dashboardSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T,>(selector: (state: RootState) => T) => useSelector(selector);

// ==================== ONBOARDING DATA ====================
const onboardingSlides = [
  {
    id: '1',
    title: 'AI-Powered Lead Outreach',
    description: 'Automate your lead outreach with personalized emails and auto-scheduling.',
    icon: '🚀',
    features: ['Smart Personalization', 'Auto-Scheduling', 'Reply Tracking'],
    color: '#4F46E5',
    url:require('./src/assets/efsolit.png')
  },
  {
    id: '2',
    title: 'Connect Your Email',
    description: 'Sign in with Google or connect Gmail, Hostinger, Zoho, or Outlook.',
    icon: '📧',
    features: ['Gmail Integration', 'Outlook Support', 'SMTP/IMAP'],
    color: '#7C3AED',
    url:require('./src/assets/efsolit.png')
  },
  {
    id: '3',
    title: 'Upload & Automate',
    description: 'Bulk import leads via Excel or CSV, AI handles the rest.',
    icon: '⚡',
    features: ['Bulk Import', 'AI Personalization', 'Auto-Follow Up'],
    color: '#06B6D4',
    url:require('./src/assets/efsolit.png')
  },
];

// ==================== SCREENS ====================
// 1. SPLASH SCREEN
const SplashScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

   const checkAuth = async () => {
  const SPLASH_TIMEOUT = 2000; // 2 seconds

  try {
    const userData = await AsyncStorage.getItem('user');

    if (userData) {
      const parsed = JSON.parse(userData);
      store.dispatch(authSlice.actions.setUser(parsed));

      setTimeout(() => {
        navigation.replace('Dashboard');
      }, SPLASH_TIMEOUT);
    } else {
      setTimeout(() => {
        navigation.replace('Onboarding');
      }, SPLASH_TIMEOUT);
    }
  } catch (error) {
    setTimeout(() => {
      navigation.replace('Onboarding');
    }, SPLASH_TIMEOUT);
  }
};

    checkAuth();
  }, []);

  return (
    <View style={[styles.splashContainer, { backgroundColor: '#4F46E5' }]}>
      <Animated.View style={[
        styles.splashContent,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        {/* <Text style={styles.splashLogo}>🤖</Text> */}
        <Image source={require('./src/assets/efsolit.png')} style={{height:60,width:60,borderRadius:25}}/>
        <Text style={styles.splashTitle}>Efsolit AI</Text>
        <Text style={styles.splashSubtitle}>AI-Powered Lead Outreach</Text>
        <Text style={styles.splashTagline}>Automate. Personalize. Convert.</Text>
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
      </Animated.View>
    </View>
  );
};

// 2. ONBOARDING SCREEN
const OnboardingScreen = ({ navigation }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({ item }: any) => (
    <View style={[styles.onboardingSlide, { width }]}>
      <View style={styles.slideContent}>
        <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
          <Image source={item.url} style={{height:120,width:120,borderRadius:40}}/>
        </View>
        <Text style={styles.onboardingTitle}>{item.title}</Text>
        <Text style={styles.onboardingDescription}>{item.description}</Text>
        <View style={styles.featureContainer}>
          {item.features.map((feature: string, index: number) => (
            <View key={index} style={[styles.featureBadge, { borderColor: item.color }]}>
              <Text style={[styles.featureBadgeText, { color: item.color }]}>✓ {feature}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      Alert.alert("We are working....","Coming Soon..");
      // navigation.replace('Login');
    }
  };

  const handleSkip = () => {
  Alert.alert("We are working....","Coming Soon..");
    // navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.logoHeader}>
        <Text style={styles.headerLogo}>🤖</Text>
        <Text style={styles.headerLogoText}>Efsolit AI</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        style={styles.onboardingList}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.paginationContainer}>
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && [styles.paginationDotActive, { backgroundColor: onboardingSlides[index].color }],
              ]}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: onboardingSlides[currentIndex]?.color || '#4F46E5' }]} 
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === onboardingSlides.length - 1 ? 'Get Started 🚀' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// 3. LOGIN SCREEN
const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigation.replace('Dashboard');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.authContainer}>
            <View style={styles.authHeader}>
              <Text style={styles.authLogo}>🤖</Text>
              <Text style={styles.authTitle}>Welcome Back</Text>
              <Text style={styles.authSubtitle}>Sign in to your Efsolit AI account</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#4F46E5' }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

    
          
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.link}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// 4. REGISTER SCREEN
const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
  });
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await dispatch(registerUser(formData)).unwrap();
      navigation.replace('Dashboard');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Unable to create account');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.authContainer}>
            <View style={styles.authHeader}>
              <Text style={styles.authLogo}>🤖</Text>
              <Text style={styles.authTitle}>Create Account</Text>
              <Text style={styles.authSubtitle}>Get started with Efsolit AI</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#94A3B8"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🏢</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Company Name (Optional)"
                  placeholderTextColor="#94A3B8"
                  value={formData.company}
                  onChangeText={(text) => setFormData({ ...formData, company: text })}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#94A3B8"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔐</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#94A3B8"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                />
              </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#4F46E5' }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.link}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// 5. DASHBOARD SCREEN
// const DashboardScreen = ({ navigation }: any) => {
//   const dispatch = useAppDispatch();
//   const { user } = useAppSelector((state) => state.auth);
//   const { stats, isLoading } = useAppSelector((state) => state.dashboard);

//   useEffect(() => {
//     dispatch(fetchDashboardData());
//   }, []);

//   const handleLogout = () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Logout', 
//           style: 'destructive',
//           onPress: () => {
//             dispatch(authSlice.actions.logout());
//             navigation.replace('Login');
//           }
//         },
//       ]
//     );
//   };

//   const statsData = [
//     { label: 'Total Leads', value: stats.leads, icon: '👥', color: '#4F46E5' },
//     { label: 'Meetings', value: stats.meetings, icon: '📅', color: '#7C3AED' },
//     { label: 'Replies', value: stats.replies, icon: '✉️', color: '#06B6D4' },
//     { label: 'Conversion', value: `${stats.conversion}%`, icon: '📈', color: '#10B981' },
//   ];

//   const quickActions = [
//     { icon: '📤', label: 'Upload Leads' },
//     { icon: '✉️', label: 'Send Outreach' },
//     { icon: '📊', label: 'Analytics' },
//     { icon: '⚙️', label: 'Settings' },
//   ];

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={[styles.dashboardHeader, { backgroundColor: '#4F46E5' }]}>
//         <View style={styles.headerContent}>
//           <View>
//             <Text style={styles.welcomeText}>Welcome back,</Text>
//             <Text style={styles.userName}>{user?.name || 'User'}</Text>
//           </View>
//           <View style={styles.headerRight}>
//             <TouchableOpacity style={styles.notificationButton}>
//               <Text style={styles.notificationIcon}>🔔</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
//               <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       <ScrollView style={styles.dashboardContent} showsVerticalScrollIndicator={false}>
//         <View style={styles.statsGrid}>
//           {statsData.map((stat, index) => (
//             <View key={index} style={[styles.statCard, { borderTopColor: stat.color }]}>
//               <Text style={styles.statIcon}>{stat.icon}</Text>
//               <Text style={styles.statValue}>{stat.value}</Text>
//               <Text style={styles.statLabel}>{stat.label}</Text>
//             </View>
//           ))}
//         </View>

//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Quick Actions</Text>
//           <View style={styles.actionGrid}>
//             {quickActions.map((action, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={styles.actionButton}
//                 onPress={() => Alert.alert(action.label, 'Feature coming soon!')}
//               >
//                 <Text style={styles.actionIcon}>{action.icon}</Text>
//                 <Text style={styles.actionText}>{action.label}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>AI-Powered Features</Text>
//           <View style={[styles.featureCard, { backgroundColor: '#F0F4FF' }]}>
//             <Text style={styles.featureTitle}>🤖 Auto-Schedule Meetings</Text>
//             <Text style={styles.featureDescription}>
//               AI reads replies and schedules Google Meet automatically
//             </Text>
//             <View style={[styles.featureTag, { backgroundColor: '#4F46E5' }]}>
//               <Text style={styles.featureTagText}>Coming Soon</Text>
//             </View>
//           </View>
//           <View style={[styles.featureCard, { backgroundColor: '#FFF4F0' }]}>
//             <Text style={styles.featureTitle}>📧 Personalized Emails</Text>
//             <Text style={styles.featureDescription}>
//               AI generates personalized outreach emails for each lead
//             </Text>
//             <View style={[styles.featureTag, { backgroundColor: '#FF6B6B' }]}>
//               <Text style={styles.featureTagText}>Active</Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// ==================== NAVIGATION ====================
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
<Stack.Screen name="WebView" component={WebViewScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

// ==================== MAIN APP ====================
const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#4F46E5"/>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  // Splash Screen
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  splashLogo: {
    fontSize: 48,
    marginBottom: 10,
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  splashSubtitle: {
    fontSize: 18,
    color: '#E0E7FF',
    marginBottom: 8,
  },
  splashTagline: {
    fontSize: 14,
    color: '#C4B5FD',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
  // Onboarding
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 10,
  },
  headerLogo: {
    fontSize: 24,
    marginRight: 8,
  },
  headerLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  onboardingList: {
    flex: 1,
  },
  onboardingSlide: {
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  slideContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  onboardingIcon: {
    fontSize: 60,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 16,
  },
  onboardingDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 24,
  },
  featureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureBadge: {
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    backgroundColor: 'white',
  },
  featureBadgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 20,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Auth Screens
  authContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  authLogo: {
    fontSize: 48,
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
    fontSize: 18,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    color: '#94A3B8',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  socialButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  socialButtonLabel: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  linkText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    marginTop: 16,
  },
  link: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  // Dashboard
  dashboardHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
    marginRight: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  dashboardContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: width > 380 ? '48%' : '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderTopWidth: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: width > 380 ? '48%' : '48%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  featureCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  featureTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default App;