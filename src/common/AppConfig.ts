const AppConfig = {
  baseUrl: 'https://api.buidler.app/',
  stagingBaseUrl: 'https://testnet.buidler.app/',
  tempToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYjk4ZjIwMmYtNmU4ZS00ODc0LWExMzItMjIxZWY0Yjg2ZTg1IiwiZW1haWwiOiJiYW9odW5nMjQxMkBnbWFpbC5jb20iLCJ0aW1lIjoiMjAyMS0wOS0wOVQwMTo0NTowOS44OThaIiwiaWF0IjoxNjMxMTUxOTA5LCJleHAiOjE2NjI2ODc5MDl9.KFK79kfJGX0VVRmCRmAamztLuuSmpOClOqATnbi3w-M',
  maximumFileSize: 100000000,
};

export const whiteListRefreshTokenApis = [
  'get-initial',
  'post-user/refresh',
  'post-user/address',
  'post-user',
];

export default AppConfig;
