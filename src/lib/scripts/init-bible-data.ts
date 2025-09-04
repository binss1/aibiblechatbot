import dotenv from 'dotenv';
import { connectToDatabase } from '@/lib/mongodb';
import { BibleVerse } from '@/lib/models/bible-verse';
import { generateAllVerseEmbeddings } from '@/lib/services/bible-embedding';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

// 개역개정 성경 주요 구절들
const BIBLE_VERSES = [
  // 위로와 평안
  { book: '마태복음', chapter: 11, verse: 28, text: '수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라' },
  { book: '요한복음', chapter: 14, verse: 27, text: '평안을 너희에게 끼치노니 곧 나의 평안을 너희에게 주노라 내가 너희에게 주는 것은 세상이 주는 것과 같지 아니하니라 너희는 마음에 근심하지도 말고 두려워하지도 말라' },
  { book: '시편', chapter: 23, verse: 1, text: '여호와는 나의 목자시니 내게 부족함이 없으리로다' },
  { book: '시편', chapter: 46, verse: 1, text: '하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 수 있는 도움이시라' },
  { book: '이사야', chapter: 41, verse: 10, text: '두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 내가 너를 굳세게 하리라 참으로 너를 도와주리라 참으로 나의 의로운 오른손으로 너를 붙들리라' },
  
  // 사랑과 용서
  { book: '요한복음', chapter: 3, verse: 16, text: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라' },
  { book: '고린도전서', chapter: 13, verse: 4, text: '사랑은 오래 참고 사랑은 온유하며 시기하지 아니하며 사랑은 자랑하지 아니하며 교만하지 아니하며' },
  { book: '마태복음', chapter: 6, verse: 14, text: '너희가 사람의 과실을 용서하면 너희 하늘 아버지도 너희를 용서하시려니와' },
  { book: '에베소서', chapter: 4, verse: 32, text: '서로 인자하게 하며 불쌍히 여기며 서로 용서하기를 하나님이 그리스도 안에서 너희를 용서하심과 같이 하라' },
  
  // 믿음과 소망
  { book: '히브리서', chapter: 11, verse: 1, text: '믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니' },
  { book: '로마서', chapter: 8, verse: 28, text: '우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라' },
  { book: '예레미야', chapter: 29, verse: 11, text: '여호와의 말씀이니라 너희를 향한 나의 생각은 내가 아나니 재앙이 아니라 곧 평안이요 너희에게 미래와 소망을 주는 것이니라' },
  { book: '빌립보서', chapter: 4, verse: 13, text: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라' },
  
  // 지혜와 인내
  { book: '잠언', chapter: 3, verse: 5, text: '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라' },
  { book: '야고보서', chapter: 1, verse: 5, text: '너희 중에 누구든지 지혜가 부족하거든 모든 사람에게 후히 주시고 꾸짖지 아니하시는 하나님께 구하라 그리하면 주시리라' },
  { book: '로마서', chapter: 12, verse: 12, text: '소망 중에 즐거워하며 환난 중에 참으며 기도에 항상 힘쓰며' },
  { book: '갈라디아서', chapter: 6, verse: 9, text: '우리가 선을 행하되 낙심하지 말지니 피곤하지 아니하면 때가 이르매 거두리라' },
  
  // 가족과 관계
  { book: '에베소서', chapter: 5, verse: 25, text: '남편들아 아내 사랑하기를 그리스도께서 교회를 사랑하시고 위하여 자신을 주심 같이 하라' },
  { book: '에베소서', chapter: 6, verse: 1, text: '자녀들아 너희 부모를 주 안에서 순종하라 이것이 옳으니라' },
  { book: '골로새서', chapter: 3, verse: 13, text: '누가 누구에게 불만이 있거든 서로 용납하여 피차 용서하되 주께서 너희를 용서하신 것 같이 너희도 그리하고' },
  
  // 직장과 일
  { book: '골로새서', chapter: 3, verse: 23, text: '무엇을 하든지 마음을 다하여 주께 하듯 하고 사람에게 하듯 하지 말라' },
  { book: '잠언', chapter: 16, verse: 3, text: '너의 행사를 여호와께 맡기라 그리하면 너의 경영하는 것이 이루어지리라' },
  { book: '전도서', chapter: 9, verse: 10, text: '무엇이든지 네 손이 할 일을 힘을 다하여 하라 네가 가는 음부에는 일도 없고 계획도 없고 지식도 없고 지혜도 없음이니라' },
  
  // 재정과 물질
  { book: '마태복음', chapter: 6, verse: 33, text: '그런즉 너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라' },
  { book: '잠언', chapter: 22, verse: 7, text: '부자는 가난한 자를 주관하고 빚진 자는 빌려 준 자의 종이 되느니라' },
  { book: '디모데전서', chapter: 6, verse: 10, text: '돈을 사랑함이 일만 악의 뿌리가 되나니 이것을 탐내는 자들은 미혹을 받아 믿음에서 떠나 많은 근심으로써 자기를 찔렀도다' },
  
  // 건강과 질병
  { book: '시편', chapter: 103, verse: 3, text: '저가 네 모든 죄악을 사하시며 네 모든 병을 고치시며' },
  { book: '야고보서', chapter: 5, verse: 16, text: '그러므로 너희 죄를 서로 고백하며 병이 낫기를 위하여 서로 기도하라 의인의 간구는 역사하는 힘이 큼이니라' },
  { book: '이사야', chapter: 53, verse: 5, text: '그가 찔림은 우리의 허물 때문이요 그가 상함은 우리의 죄악 때문이라 그가 징계를 받으므로 우리가 평화를 누리고 그가 채찍에 맞으므로 우리가 나음을 받았도다' },
  
  // 두려움과 걱정
  { book: '시편', chapter: 27, verse: 1, text: '여호와는 나의 빛이요 나의 구원이시니 내가 누구를 두려워하리요 여호와는 내 생명의 능력이시니 내가 누구를 무서워하리요' },
  { book: '마태복음', chapter: 6, verse: 34, text: '그러므로 내일 일을 위하여 염려하지 말라 내일 일은 내일이 염려할 것이요 한 날의 괴로움은 그 날에 족하니라' },
  { book: '빌립보서', chapter: 4, verse: 6, text: '아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로, 그리고 감사함으로 너희 구할 것을 하나님께 아뢰라' },
  
  // 감사와 찬양
  { book: '데살로니가전서', chapter: 5, verse: 18, text: '범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라' },
  { book: '시편', chapter: 100, verse: 4, text: '감사함으로 그 문에 들어가며 찬송함으로 그 궁정에 들어가서 그를 송축하며 그의 이름을 찬송할지어다' },
  { book: '시편', chapter: 34, verse: 1, text: '내가 여호와를 항상 송축함이여 그를 송축함이 내 입에 계속하리로다' },
];

async function initBibleData() {
  try {
    await connectToDatabase();
    console.log('데이터베이스에 연결되었습니다.');
    
    // 기존 데이터 삭제
    await BibleVerse.deleteMany({});
    console.log('기존 성경 구절 데이터를 삭제했습니다.');
    
    // 새로운 데이터 삽입
    const verses = BIBLE_VERSES.map(verse => ({
      ...verse,
      translation: '개역개정',
    }));
    
    await BibleVerse.insertMany(verses);
    console.log(`${verses.length}개의 성경 구절을 삽입했습니다.`);
    
    // 임베딩 생성
    if (process.env.OPENAI_API_KEY) {
      console.log('성경 구절에 대한 임베딩을 생성합니다...');
      await generateAllVerseEmbeddings();
    } else {
      console.log('OPENAI_API_KEY가 설정되지 않아 임베딩을 생성하지 않습니다.');
    }
    
    console.log('성경 데이터 초기화가 완료되었습니다.');
  } catch (error) {
    console.error('성경 데이터 초기화 중 오류 발생:', error);
  } finally {
    process.exit(0);
  }
}

// 스크립트가 직접 실행될 때만 함수 호출
if (require.main === module) {
  initBibleData();
}

export { initBibleData };
