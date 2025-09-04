import dotenv from 'dotenv';
import OpenAI from 'openai';
import { BibleVerse } from '@/lib/models/bible-verse';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  similarity: number;
}

/**
 * 성경 구절에 대한 임베딩을 생성합니다.
 */
export async function generateBibleEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('임베딩 생성에 실패했습니다.');
  }
}

/**
 * 사용자 입력과 관련된 성경 구절을 검색합니다.
 */
export async function searchRelevantVerses(
  userInput: string,
  limit: number = 5
): Promise<BibleSearchResult[]> {
  try {
    // 사용자 입력에 대한 임베딩 생성
    const userEmbedding = await generateBibleEmbedding(userInput);
    
    // MongoDB에서 임베딩이 있는 성경 구절들을 가져와서 코사인 유사도 계산
    const verses = await BibleVerse.find({ 
      embeddings: { $exists: true, $ne: null } 
    }).limit(1000); // 성능을 위해 제한
    
    if (verses.length === 0) {
      return [];
    }
    
    // 코사인 유사도 계산
    const similarities = verses.map(verse => {
      if (!verse.embeddings || verse.embeddings.length === 0) {
        return { verse, similarity: 0 };
      }
      
      const similarity = cosineSimilarity(userEmbedding, verse.embeddings);
      return { verse, similarity };
    });
    
    // 유사도 순으로 정렬하고 상위 결과 반환
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ verse, similarity }) => ({
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        similarity,
      }));
  } catch (error) {
    console.error('Error searching verses:', error);
    return [];
  }
}

/**
 * 코사인 유사도를 계산합니다.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('벡터의 차원이 일치하지 않습니다.');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

/**
 * 성경 구절의 임베딩을 업데이트합니다.
 */
export async function updateVerseEmbedding(verseId: string): Promise<void> {
  try {
    const verse = await BibleVerse.findById(verseId);
    if (!verse) {
      throw new Error('성경 구절을 찾을 수 없습니다.');
    }
    
    const embedding = await generateBibleEmbedding(verse.text);
    verse.embeddings = embedding;
    await verse.save();
  } catch (error) {
    console.error('Error updating verse embedding:', error);
    throw error;
  }
}

/**
 * 모든 성경 구절의 임베딩을 일괄 생성합니다.
 */
export async function generateAllVerseEmbeddings(): Promise<void> {
  try {
    const verses = await BibleVerse.find({ 
      embeddings: { $exists: false } 
    });
    
    console.log(`${verses.length}개의 성경 구절에 대한 임베딩을 생성합니다...`);
    
    for (let i = 0; i < verses.length; i++) {
      const verse = verses[i];
      try {
        const embedding = await generateBibleEmbedding(verse.text);
        verse.embeddings = embedding;
        await verse.save();
        
        if ((i + 1) % 10 === 0) {
          console.log(`${i + 1}/${verses.length} 완료`);
        }
        
        // API 호출 제한을 위한 지연
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`구절 ${verse.book} ${verse.chapter}:${verse.verse} 임베딩 생성 실패:`, error);
      }
    }
    
    console.log('모든 임베딩 생성이 완료되었습니다.');
  } catch (error) {
    console.error('Error generating all embeddings:', error);
    throw error;
  }
}
