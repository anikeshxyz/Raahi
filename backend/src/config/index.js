import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/raahi_cafe',
  jwtSecret: process.env.JWT_SECRET || 'raahi_cafe_default_jwt_secret',
  frontendWebsiteUrl: process.env.FRONTEND_WEBSITE_URL || 'http://localhost:3000',
  frontendAdminUrl: process.env.FRONTEND_ADMIN_URL || 'http://localhost:5173',
};
