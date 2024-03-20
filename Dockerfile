# 기본 이미지 설정 (Node.js)
FROM node:20

# 앱 디렉토리 생성 및 설정
WORKDIR /usr/src/app

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 앱 빌드
RUN npm install --production=false
RUN npx prisma generate --schema=src/db/prisma/schema.prisma
RUN npm run build \
    rm -rf node_modules \
    npm install --production=true

# 컨테이너 실행 시 실행될 명령어
CMD ["npm", "run", "start"]