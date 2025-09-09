import dotenv from 'dotenv';
import { connectToDatabase } from '@/lib/mongodb';
import { BibleVerse } from '@/lib/models/bible-verse';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

async function clearBibleData() {
  try {
    await connectToDatabase();
    console.log('데이터베이스에 연결되었습니다.');

    // 컬렉션 삭제
    await BibleVerse.collection.drop();
    console.log('BibleVerse 컬렉션을 삭제했습니다.');

    console.log('성경 데이터 정리가 완료되었습니다.');
  } catch (error) {
    console.error('성경 데이터 정리 중 오류 발생:', error);
  } finally {
    process.exit(0);
  }
}

// 스크립트가 직접 실행될 때만 함수 호출
if (require.main === module) {
  clearBibleData();
}

export { clearBibleData };


