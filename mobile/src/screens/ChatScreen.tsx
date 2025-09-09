import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Message, ChatResponse } from '../types';
import { chatApi } from '../services/api';

interface ChatScreenProps {
  navigation: any;
}

export default function ChatScreen({ navigation }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `mobile-${Date.now()}`);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    const message = inputText.trim();
    if (!message || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await chatApi.sendMessage({
        sessionId,
        message,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        verses: response.verses,
        prayer: response.prayer,
        counselingStep: response.counselingStep,
        isQuestionPhase: response.isQuestionPhase,
        progress: response.progress,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('오류', '메시지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    const isLastMessage = index === messages.length - 1;

    return (
      <View style={styles.messageContainer}>
        {!isUser && (
          <View style={styles.assistantMessage}>
            <View style={styles.assistantAvatar}>
              <Text style={styles.assistantAvatarText}>L</Text>
            </View>
            <View style={styles.assistantBubble}>
              <Text style={styles.assistantText}>{item.content}</Text>
              
              {/* 상담 진행 상황 표시 */}
              {item.isQuestionPhase && item.progress && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Ionicons name="help-circle" size={16} color="#7B9EBE" />
                    <Text style={styles.progressText}>
                      상담 진행 중 ({item.progress.current + 1}/{item.progress.total})
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${((item.progress.current + 1) / item.progress.total) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              )}

              {/* 상담 완료 표시 */}
              {item.counselingStep === 'followup' && !item.isQuestionPhase && (
                <View style={styles.completionContainer}>
                  <View style={styles.completionHeader}>
                    <Ionicons name="checkmark-circle" size={16} color="#A3B899" />
                    <Text style={styles.completionText}>상담이 완료되었습니다</Text>
                  </View>
                </View>
              )}

              {item.verses && item.verses.length > 0 && (
                <View style={styles.versesContainer}>
                  {item.verses.map((verse, idx) => (
                    <View key={idx} style={styles.verseBadge}>
                      <Ionicons name="bookmark" size={12} color="#A3B899" />
                      <Text style={styles.verseText}>
                        {verse.book} {verse.chapter}:{verse.verse}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {item.prayer && (
                <View style={styles.prayerContainer}>
                  <View style={styles.prayerHeader}>
                    <Ionicons name="heart" size={16} color="#A3B899" />
                    <Text style={styles.prayerTitle}>오늘의 기도</Text>
                  </View>
                  <Text style={styles.prayerText}>{item.prayer}</Text>
                </View>
              )}

              {isLoading && isLastMessage && (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingDots}>
                    {[1, 2, 3].map((dot) => (
                      <View
                        key={dot}
                        style={[styles.loadingDot, { animationDelay: `${dot * 0.15}s` }]}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>오후 2:30</Text>
          </View>
        )}

        {isUser && (
          <View style={styles.userMessage}>
            <View style={styles.userBubble}>
              <Text style={styles.userText}>{item.content}</Text>
            </View>
            <Text style={styles.timestamp}>오후 2:31</Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="heart" size={32} color="#7B9EBE" />
      </View>
      <Text style={styles.emptyTitle}>안녕하세요!</Text>
      <Text style={styles.emptyDescription}>
        무엇이든 편하게 말씀해주세요. 성경적 관점에서 답변해 드리겠습니다.
      </Text>
      <View style={styles.examplePrompts}>
        <TouchableOpacity
          style={styles.examplePrompt}
          onPress={() => setInputText('요즘 너무 지쳐요. 성경적 위로가 필요해요.')}
        >
          <Text style={styles.examplePromptText}>"요즘 너무 지쳐요. 성경적 위로가 필요해요."</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.examplePrompt}
          onPress={() => setInputText('하나님의 뜻을 어떻게 알 수 있을까요?')}
        >
          <Text style={styles.examplePromptText}>"하나님의 뜻을 어떻게 알 수 있을까요?"</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={styles.headerTitle}>로고스</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Ionicons name="time" size={24} color="#343a40" />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messagesContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="메시지를 입력하세요..."
              multiline
              maxLength={1000}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={!inputText.trim() || isLoading ? '#9CA3AF' : 'white'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343a40',
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  assistantMessage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userMessage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    maxWidth: '85%',
    alignSelf: 'flex-end',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7B9EBE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  assistantAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  assistantBubble: {
    backgroundColor: '#7B9EBE',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    flex: 1,
  },
  userBubble: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  assistantText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#343a40',
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: '#6c757d',
    marginHorizontal: 8,
    marginTop: 4,
  },
  versesContainer: {
    marginTop: 8,
  },
  verseBadge: {
    backgroundColor: 'rgba(163, 184, 153, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#A3B899',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    position: 'relative',
  },
  verseText: {
    fontSize: 14,
    color: '#343a40',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  prayerContainer: {
    backgroundColor: 'rgba(163, 184, 153, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#A3B899',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    position: 'relative',
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  prayerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343a40',
    marginLeft: 6,
  },
  prayerText: {
    fontSize: 14,
    color: '#343a40',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  loadingContainer: {
    marginTop: 8,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7B9EBE',
    marginHorizontal: 2,
  },
  progressContainer: {
    backgroundColor: 'rgba(163, 184, 153, 0.3)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#A3B899',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#343a40',
    marginLeft: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(163, 184, 153, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A3B899',
    borderRadius: 2,
  },
  completionContainer: {
    backgroundColor: 'rgba(163, 184, 153, 0.3)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#A3B899',
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#343a40',
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(123, 158, 190, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  examplePrompts: {
    width: '100%',
    gap: 8,
  },
  examplePrompt: {
    backgroundColor: 'rgba(233, 236, 239, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  examplePromptText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#E9ECEF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#343a40',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A3B899',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E9ECEF',
  },
});