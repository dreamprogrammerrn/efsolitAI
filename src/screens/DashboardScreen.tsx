import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  
  Alert,
  StatusBar,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }: any) => {
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => navigation.replace('Login'),
      },
    ]);
  };

  const openEfsolitaiWebsite = async () => {
    const url = 'https://efsolitai.in';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${url}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open the website');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View style={styles.headerGlow} />

        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Welcome back 👋</Text>
            <Text style={styles.userName}>User</Text>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Decorative card inside header */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardTop}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>EFSOLIT AI</Text>
            </View>
            <Text style={styles.heroCardIcon}>✨</Text>
          </View>
          <Text style={styles.heroCardTitle}>
            Your AI-powered outreach platform
          </Text>
          <Text style={styles.heroCardSubtitle}>
            Manage leads, schedule meetings, and grow faster
          </Text>
        </View>
      </View>

      {/* ===== MAIN CONTENT ===== */}
      <View style={styles.content}>
        <Text style={styles.sectionLabel}>QUICK ACCESS</Text>

        <TouchableOpacity
          style={styles.websiteButton}
          onPress={openEfsolitaiWebsite}
          activeOpacity={0.9}
        >
          {/* Soft glow behind button */}
          <View style={styles.websiteButtonGlow} />

          <View style={styles.websiteButtonIconWrap}>
            <Text style={styles.websiteButtonIcon}>🌐</Text>
          </View>

          <View style={styles.websiteButtonTextWrap}>
            <Text style={styles.websiteButtonText}>Open efsolitai.in</Text>
            <Text style={styles.websiteButtonSub}>
              Launch the official website
            </Text>
          </View>

          <View style={styles.websiteButtonArrowWrap}>
            <Text style={styles.websiteButtonArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Tip</Text>
            <Text style={styles.infoText}>
              Tap the button above to open the official Efsolit AI website in
              your browser.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Efsolit AI</Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  /* ============ HEADER ============ */
  header: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    color: '#C7D2FE',
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* Hero card inside header */
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroCardIcon: {
    fontSize: 20,
  },
  heroCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  heroCardSubtitle: {
    color: '#C7D2FE',
    fontSize: 12,
    lineHeight: 17,
  },

  /* ============ CONTENT ============ */
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  /* ============ WEBSITE BUTTON ============ */
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    overflow: 'hidden',
  },
  websiteButtonGlow: {
    position: 'absolute',
    left: -40,
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(79,70,229,0.06)',
  },
  websiteButtonIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  websiteButtonIcon: {
    fontSize: 26,
  },
  websiteButtonTextWrap: {
    flex: 1,
  },
  websiteButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.2,
  },
  websiteButtonSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },
  websiteButtonArrowWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  websiteButtonArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: -2,
  },

  /* ============ INFO CARD ============ */
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  infoIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
  },

  /* ============ FOOTER ============ */
  footer: {
    marginTop: 'auto',
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerVersion: {
    fontSize: 10,
    color: '#D1D5DB',
    marginTop: 2,
  },
});