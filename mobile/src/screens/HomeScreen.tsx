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
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const features = [
    {
      icon: 'shield-checkmark' as const,
      title: '익명 상담',
      description: '개인정보 없이 안전하게 상담받으세요',
      color: '#3B82F6',
    },
    {
      icon: 'time' as const,
      title: '24시간 상담',
      description: '언제든지 고민을 털어놓으세요',
      color: '#10B981',
    },
    {
      icon: 'heart' as const,
      title: '성경적 조언',
      description: '성경 말씀을 바탕으로 한 정확한 조언',
      color: '#8B5CF6',
    },
  ];

  const testimonials = [
    {
      quote: "직장에서의 갈등으로 힘들었는데, 성경적 지혜를 통해 새로운 관점을 얻었습니다.",
      name: "김민수",
      role: "회사원, 35세"
    },
    {
      quote: "자녀 양육의 어려움 속에서 성경적 원리를 적용할 수 있는 실질적인 조언을 받았습니다.",
      name: "이지영", 
      role: "주부, 42세"
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#EBF8FF', '#F0F9FF', '#E0F2FE']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={16} color="#1E40AF" />
              <Text style={styles.badgeText}>성경 기반 AI 상담</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              당신의 고민에{'\n'}
              <Text style={styles.heroTitleHighlight}>성경적 답변</Text>을
            </Text>
            
            <Text style={styles.heroDescription}>
              30대 이상 직장인·가정을 위한 AI 상담 챗봇.{'\n'}
              성경 말씀을 바탕으로 한 따뜻한 조언과 기도 제목을 제공합니다.
            </Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Chat')}
              >
                <Ionicons name="chatbubbles" size={20} color="white" />
                <Text style={styles.primaryButtonText}>지금 상담 시작하기</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('History')}
              >
                <Ionicons name="book" size={20} color="#3B82F6" />
                <Text style={styles.secondaryButtonText}>상담 기록 보기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>성경적 지혜로 당신의 고민을 해결하세요</Text>
          <Text style={styles.sectionDescription}>
            성경 말씀을 바탕으로 한 AI 상담 서비스는 당신의 일상에 실질적인 도움을 드립니다
          </Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { borderLeftColor: feature.color }]}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <Ionicons name={feature.icon} size={24} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Testimonials Section */}
        <View style={styles.testimonialsSection}>
          <Text style={styles.sectionTitle}>사용자들의 이야기</Text>
          <Text style={styles.sectionDescription}>
            성경 기반 AI 상담을 통해 위로와 지혜를 얻은 분들의 소중한 경험
          </Text>
          
          <View style={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.quoteIcon}>
                  <Ionicons name="chatbubble" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.testimonialQuote}>{testimonial.quote}</Text>
                <View style={styles.testimonialAuthor}>
                  <Text style={styles.testimonialName}>{testimonial.name}</Text>
                  <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={['#3B82F6', '#1E40AF']}
          style={styles.ctaSection}
        >
          <Text style={styles.ctaTitle}>성경적 지혜로 더 나은 삶을 살아가세요</Text>
          <Text style={styles.ctaDescription}>
            매일의 고민과 결정에 성경의 지혜를 적용하여 더 풍요로운 삶을 경험하세요
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <Ionicons name="chatbubbles" size={20} color="#3B82F6" />
            <Text style={styles.ctaButtonText}>무료로 상담 시작하기</Text>
            <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  heroTitleHighlight: {
    color: '#3B82F6',
    position: 'relative',
  },
  heroDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  testimonialsSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#F8FAFC',
  },
  testimonialsGrid: {
    gap: 16,
  },
  testimonialCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteIcon: {
    marginBottom: 12,
  },
  testimonialQuote: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  testimonialAuthor: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  testimonialRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});
