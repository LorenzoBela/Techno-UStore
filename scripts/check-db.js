const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      // Remove quotes if present
      const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
      process.env[key] = value;
    }
  });
} else {
    console.log('.env file not found!');
}

const connectionString = process.env.DATABASE_URL;
// Mask password for logging
const maskedUrl = connectionString 
  ? connectionString.replace(/(:)([^:@]+)(@)/, '$1****$3') 
  : 'UNDEFINED';

console.log('DATABASE_URL:', maskedUrl);

if (!connectionString) {
  console.error('DATABASE_URL is missing!');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  connectionTimeoutMillis: 10000, // 10s timeout
});

console.log('Attempting to connect...');
const start = Date.now();

client.connect()
  .then(() => {
    const duration = Date.now() - start;
    console.log(`✅ Successfully connected to database in ${duration}ms!`);
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Server time:', res.rows[0].now);
    return client.end();
  })
  .catch(err => {
    const duration = Date.now() - start;
    console.error(`❌ Connection failed after ${duration}ms:`);
    console.error(err);
    process.exit(1);
  });
