// server/config.js
import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const isPilot = process.env.NODE_ENV === 'pilot';

export const config = {
    isProduction,
    isPilot,
    port: process.env.PORT || 5000,
    mongodbUri: isProduction
        ? process.env.PROD_MONGODB_URI
        : isPilot ? process.env.PILOT_MONGODB_URI : process.env.DEV_MONGODB_URI,

    odex: {
        baseUrl: isProduction
            ? process.env.PROD_ODEX_BASE_URL
            : isPilot ? process.env.PILOT_ODEX_BASE_URL : process.env.DEV_ODEX_BASE_URL,
        hashKey: isProduction
            ? process.env.PROD_HASHKEY
            : isPilot ? process.env.PILOT_HASHKEY : process.env.DEV_HASHKEY,
        pyrCode: isProduction
            ? process.env.PROD_PYRCODE
            : isPilot ? process.env.PILOT_PYRCODE : process.env.DEV_PYRCODE,
        // Default production pyrCode provided by user
        productionPyrCode: "ODeX/IN/SHP/2510/00001",
        email: isPilot ? process.env.PILOT_EMAIL : process.env.ODEX_EMAIL,
        password: isPilot ? process.env.PILOT_PASSWORD : process.env.ODEX_PASSWORD,
        secretKey: process.env.ODEX_SECRET_KEY
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiration: process.env.JWT_EXPIRATION || '24h'
    },

    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
};

export default config;
