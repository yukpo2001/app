const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
require('dotenv').config();

// If modifying these scopes, delete token.json.
// https://www.googleapis.com/auth/gmail.modify allows reading, sending, deleting, and modifying labels.
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // 'http://localhost' could also be used depending on app type

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ ERROR: GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET is missing in .env file.");
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

function getNewToken() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // Crucial for receiving a refresh_token
    scope: SCOPES,
    prompt: 'consent' // Forces consent screen to ensure refresh token is provided
  });
  console.log('🔗 1. 다음 URL을 브라우저에서 열어 Google 계정으로 로그인하세요:\n\n', authUrl, '\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('🔑 2. 인증 후 나타나는 인증 코드(Authorization code)를 여기에 붙여넣으세요: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('❌ 인증 코드를 교환하는 중 오류 발생:', err.message);
      
      console.log('\n✅ 인증 성공! 토큰 정보를 파일로 저장합니다...');
      
      const fs = require('fs');
      let envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
      if (envContent.includes('GMAIL_REFRESH_TOKEN=')) {
          envContent = envContent.replace(/GMAIL_REFRESH_TOKEN=.*/g, `GMAIL_REFRESH_TOKEN="${token.refresh_token}"`);
      } else {
          envContent += `\nGMAIL_REFRESH_TOKEN="${token.refresh_token}"\n`;
      }
      fs.writeFileSync('.env', envContent);
      console.log('✅ GMAIL_REFRESH_TOKEN이 .env 파일에 성공적으로 저장되었습니다!');
      
      if(!token.refresh_token) {
          console.log('\n⚠️ 주의: Refresh Token이 발급되지 않았습니다. 이전에 권한을 부여한 적이 있다면 https://myaccount.google.com/permissions 에서 앱의 권한을 취소하고 이 스크립트를 다시 실행해주세요.');
      }
    });
  });
}

getNewToken();
