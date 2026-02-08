# ... အပေါ်က base image အပိုင်း ...

COPY package*.json ./

# ဒီနေရာမှာ flag ထည့်ပေးဖို့ လိုပါတယ်
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# ... ကျန်တဲ့အပိုင်း ...