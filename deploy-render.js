const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const RENDER_API_KEY = process.env.RENDER_API_KEY;
const RENDER_API_BASE = 'https://api.render.com/v1';

if (!RENDER_API_KEY) {
  console.error('❌ RENDER_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

// Render API 요청 헬퍼 함수
function makeRenderRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.render.com',
      port: 443,
      path: `/v1${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${parsed.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// GitHub 저장소 정보 가져오기
async function getGitHubRepo() {
  try {
    const gitConfig = fs.readFileSync('.git/config', 'utf8');
    const urlMatch = gitConfig.match(/url = https:\/\/github\.com\/([^\/]+)\/([^\.]+)/);
    if (urlMatch) {
      return {
        owner: urlMatch[1],
        repo: urlMatch[2],
        url: `https://github.com/${urlMatch[1]}/${urlMatch[2]}`
      };
    }
  } catch (e) {
    console.log('⚠️  Git 설정에서 저장소 정보를 가져올 수 없습니다.');
  }
  
  // 기본값 반환
  return {
    owner: 'your-username',
    repo: 'aibiblechatbot',
    url: 'https://github.com/your-username/aibiblechatbot'
  };
}

// Render 서비스 생성
async function createRenderService() {
  try {
    console.log('🚀 Render 서비스 생성을 시작합니다...');
    
    // 먼저 owner 정보를 가져옵니다
    console.log('👤 사용자 정보를 가져오는 중...');
    const user = await makeRenderRequest('/owners');
    console.log('📋 사용자 정보 응답:', JSON.stringify(user, null, 2));
    
    // 응답 구조에 따라 ownerId 추출
    let ownerId;
    if (Array.isArray(user) && user.length > 0) {
      ownerId = user[0].owner.id;
    } else if (user.owner && user.owner.id) {
      ownerId = user.owner.id;
    } else if (user.id) {
      ownerId = user.id;
    } else {
      throw new Error('ownerId를 찾을 수 없습니다. 응답 구조를 확인해주세요.');
    }
    
    console.log(`✅ 사용자 ID: ${ownerId}`);
    
    const repo = await getGitHubRepo();
    console.log(`📦 저장소: ${repo.url}`);
    
    const serviceData = {
      type: 'web_service',
      name: 'aibiblechatbot',
      ownerId: ownerId,
      repo: repo.url,
      branch: 'main',
      serviceDetails: {
        runtime: 'node',
        buildCommand: 'npm install && npm run build',
        startCommand: 'npm start',
        plan: 'free',
        region: 'oregon',
        envSpecificDetails: {
          env: 'node',
          buildCommand: 'npm install && npm run build',
          startCommand: 'npm start'
        },
        envVars: [
          {
            key: 'NODE_ENV',
            value: 'production'
          },
          {
            key: 'PORT',
            value: '10000'
          }
        ]
      }
    };

    console.log('📝 서비스 설정:');
    console.log(`   - 이름: ${serviceData.name}`);
    console.log(`   - 빌드 명령어: ${serviceData.serviceDetails.buildCommand}`);
    console.log(`   - 시작 명령어: ${serviceData.serviceDetails.startCommand}`);
    console.log(`   - 플랜: ${serviceData.serviceDetails.plan}`);
    
    const service = await makeRenderRequest('/services', 'POST', serviceData);
    console.log('✅ 서비스가 생성되었습니다!');
    console.log(`   - 서비스 ID: ${service.service.id}`);
    console.log(`   - 서비스 URL: ${service.service.serviceDetails.url || '배포 중...'}`);
    
    return service.service;
  } catch (error) {
    console.error('❌ 서비스 생성 실패:', error.message);
    throw error;
  }
}

// 환경 변수 설정
async function setEnvironmentVariables(serviceId) {
  try {
    console.log('🔧 환경 변수를 설정합니다...');
    
    const envVars = [
      { key: 'MONGODB_URI', value: process.env.MONGODB_URI || 'your_mongodb_uri' },
      { key: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY || 'your_openai_key' },
      { key: 'NEXT_PUBLIC_APP_URL', value: `https://${serviceId}.onrender.com` }
    ];

    for (const envVar of envVars) {
      if (envVar.value.startsWith('your_')) {
        console.log(`⚠️  ${envVar.key}를 설정해주세요: ${envVar.value}`);
        continue;
      }
      
      try {
        await makeRenderRequest(`/services/${serviceId}/env-vars`, 'POST', envVar);
        console.log(`✅ ${envVar.key} 설정 완료`);
      } catch (error) {
        console.log(`⚠️  ${envVar.key} 설정 실패: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ 환경 변수 설정 실패:', error.message);
  }
}

// 배포 상태 확인
async function checkDeploymentStatus(serviceId) {
  try {
    console.log('📊 배포 상태를 확인합니다...');
    
    const deployments = await makeRenderRequest(`/services/${serviceId}/deploys`);
    if (deployments.length > 0) {
      const latestDeploy = deployments[0];
      console.log(`   - 최신 배포 ID: ${latestDeploy.id}`);
      console.log(`   - 상태: ${latestDeploy.status}`);
      console.log(`   - 생성 시간: ${latestDeploy.createdAt}`);
      
      if (latestDeploy.status === 'live') {
        console.log('🎉 배포가 완료되었습니다!');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ 배포 상태 확인 실패:', error.message);
    return false;
  }
}

// 메인 실행 함수
async function main() {
  try {
    console.log('🌟 AI 성경 챗봇 Render 배포를 시작합니다!\n');
    
    // 1. 서비스 생성
    const service = await createRenderService();
    const serviceId = service.id;
    
    // 2. 환경 변수 설정
    await setEnvironmentVariables(serviceId);
    
    // 3. 배포 상태 확인
    console.log('\n⏳ 배포가 진행 중입니다. 잠시 기다려주세요...');
    
    let attempts = 0;
    const maxAttempts = 30; // 5분 대기
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10초 대기
      attempts++;
      
      const isDeployed = await checkDeploymentStatus(serviceId);
      if (isDeployed) {
        console.log(`\n🎉 배포 완료!`);
        console.log(`🌐 서비스 URL: https://${serviceId}.onrender.com`);
        console.log(`🔍 Health Check: https://${serviceId}.onrender.com/api/health`);
        break;
      }
      
      console.log(`⏳ 배포 진행 중... (${attempts}/${maxAttempts})`);
    }
    
    if (attempts >= maxAttempts) {
      console.log('\n⏰ 배포 시간이 초과되었습니다. Render 대시보드에서 상태를 확인해주세요.');
      console.log(`🔗 Render 대시보드: https://dashboard.render.com/services/${serviceId}`);
    }
    
  } catch (error) {
    console.error('\n❌ 배포 실패:', error.message);
    process.exit(1);
  }
}

// 실행
main();
