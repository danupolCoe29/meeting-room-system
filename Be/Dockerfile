# 1. ใช้ Node.js version 20 (ถ้านิ่งและประหยัดพื้นที่ให้ใช้ alpine)
FROM node:20-alpine

# 2. กำหนดโฟลเดอร์หลักใน Container
WORKDIR /app

# 3. คัดลอก package.json และ package-lock.json เพื่อติดตั้ง dependencies ก่อน
# วิธีนี้ช่วยให้ Docker ทำงานเร็วขึ้นเวลาแก้โค้ดแต่ไม่ได้เพิ่ม library ใหม่ (Layer Caching)
COPY package*.json ./

# 4. ติดตั้ง dependencies
RUN npm install --production

# 5. คัดลอกโค้ดทั้งหมดในโฟลเดอร์ Be เข้าไปใน Container
COPY . .

# 6. กำหนด Port ที่ Backend รัน (ตามที่คุณตั้งไว้ใน index.js)
EXPOSE 3000

# 7. คำสั่งรัน Server
CMD ["node", "index.js"]