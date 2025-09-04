import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatRecord } from '../types';
import { chatApi } from '../services/api';

interface HistoryScreenProps {
  navigation: any;
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [sessionId, setSessionId] = useState('');
  const [history, setHistory] = useState<ChatRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadHistory = async (sessionIdToLoad: string) => {
    if (!sessionIdToLoad.trim()) {
      Alert.alert('알림', '세션 ID를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await chatApi.getHistory(sessionIdToLoad);
      setHistory(data.records || []);
    } catch (error) {
      console.error('History load error:', error);
      Alert.alert('오류', '상담 기록을 불러오는데 실패했습니다.');
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!sessionId.trim()) return;
    
    setIsRefreshing(true);
    await loadHistory(sessionId);
    setIsRefreshing(false);
  };

  const renderHistoryItem = ({ item }: { item: ChatRecord }) => {
    const isUser = item.role === 'user';
    const date = new Date(item.createdAt).toLocaleString('ko-KR');

    return (
      <View style={[styles.historyItem, isUser ? styles.userItem : styles.assistantItem]}>
        <View style={styles.historyHeader}>
          <View style={[styles.roleBadge, isUser ? styles.userBadge : styles.assistantBadge]}>
            <Text style={[styles.roleText, isUser ? styles.userRoleText : styles.assistantRoleText]}>
              {isUser ? '나' : 'AI'}
            </Text>
          </View>
          <Text style={styles.timestamp}>{date}</Text>
        </View>
        
        <Text style={[styles.content, isUser ? styles.userContent : styles.assistantContent]}>
          {item.content}
        </Text>
        
        {!isUser && item.verses && item.verses.length > 0 && (
          <View style={styles.versesContainer}>
            {item.verses.map((verse, idx) => (
              <View key={idx} style={styles.verseBadge}>
                <Ionicons name="book" size={12} color="#3B82F6" />
                <Text style={styles.verseText}>
                  {verse.book} {verse.chapter}:{verse.verse}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {!isUser && item.prayer && (
          <View style={styles.prayerContainer}>
            <View style={styles.prayerHeader}>
              <Ionicons name="heart" size={14} color="#F59E0B" />
              <Text style={styles.prayerTitle}>오늘의 기도</Text>
            </View>
            <Text style={styles.prayerText}>{item.prayer}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time" size={48} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>상담 기록이 없습니다</Text>
      <Text style={styles.emptyDescription}>
        세션 ID를 입력하고 조회 버튼을 눌러 상담 기록을 확인하세요.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.textInput}
            value={sessionId}
            onChangeText={setSessionId}
            placeholder="세션 ID를 입력하세요 (예: web-1234567890)"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={[styles.searchButton, (!sessionId.trim() || isLoading) && styles.searchButtonDisabled]}
          onPress={() => loadHistory(sessionId)}
          disabled={!sessionId.trim() || isLoading}
        >
          <Ionicons
            name="search"
            size={20}
            color={(!sessionId.trim() || isLoading) ? '#9CA3AF' : 'white'}
          />
          <Text style={[styles.searchButtonText, (!sessionId.trim() || isLoading) && styles.searchButtonTextDisabled]}>
            조회
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>상담 기록을 불러오는 중...</Text>
        </View>
      )}

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item, index) => `${item.sessionId}-${index}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  searchButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButtonTextDisabled: {
    color: '#9CA3AF',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  assistantItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  userBadge: {
    backgroundColor: '#EBF8FF',
  },
  assistantBadge: {
    backgroundColor: '#ECFDF5',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userRoleText: {
    color: '#3B82F6',
  },
  assistantRoleText: {
    color: '#10B981',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  userContent: {
    color: '#1F2937',
  },
  assistantContent: {
    color: '#374151',
  },
  versesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  verseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  verseText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
    fontWeight: '500',
  },
  prayerContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  prayerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 6,
  },
  prayerText: {
    fontSize: 14,
    color: '#92400E',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
