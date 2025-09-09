import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="heart" size={32} color="#7B9EBE" />
              </View>
            </View>
            
            <Text style={styles.appTitle}>Logos</Text>
            <Text style={styles.subtitle}>마음의 평화를 찾아보세요.</Text>
            
            <Text style={styles.description}>
              로고스 AI 챗봇과 함께 당신의 고민을 나누고, 성경적 지혜를 통해 위로와 해답을 얻으세요.
            </Text>
            
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate('Chat')}
            >
              <Text style={styles.startButtonText}>대화 시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>성찰을 위한 안전한 공간</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  heroContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(123, 158, 190, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 16,
    fontFamily: 'Lora',
  },
  subtitle: {
    fontSize: 24,
    color: '#343a40',
    marginBottom: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(52, 58, 64, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  startButton: {
    backgroundColor: '#7B9EBE',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(52, 58, 64, 0.6)',
    textAlign: 'center',
  },
});