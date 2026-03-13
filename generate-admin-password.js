// generate-admin-password.js - Script to generate admin password hash
import bcrypt from 'bcryptjs';
import readline from 'readline';
import process from 'process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function generatePasswordHash() {
  try {
    rl.question('Enter admin password (minimum 6 characters): ', async (password) => {
      if (password.length < 6) {
        console.log('Password must be at least 6 characters long.');
        rl.close();
        return;
      }

      const saltRounds = 12;
      const hash = await bcrypt.hash(password, saltRounds);
      
      console.log('\n=== Admin Password Hash Generated ===');
      console.log('Add this to your .env file:');
      console.log(`ADMIN_PASSWORD_HASH=${hash}`);
      console.log('\nAlso add a secure JWT secret:');
      console.log(`JWT_SECRET=${generateSecureSecret()}`);
      console.log('\n=== IMPORTANT ===');
      console.log('Remember your password - you will need it to login to the admin dashboard.');
      console.log('Keep your .env file secure and never commit it to version control.');
      
      rl.close();
    });
  } catch (error) {
    console.error('Error generating password hash:', error);
    rl.close();
  }
}

function generateSecureSecret() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

generatePasswordHash();
