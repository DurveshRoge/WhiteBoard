import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    // Check if password placeholder exists
    if (process.env.MONGODB_URI.includes('<db_password>')) {
      throw new Error('Please replace <db_password> with your actual MongoDB password in .env file');
    }
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log(`📍 Connected to: ${mongoose.connection.host}`);
    console.log(`🗄️  Database: ${mongoose.connection.name}`);
    
    // Test other environment variables
    console.log('\n📧 Email configuration:');
    console.log(`   Service: ${process.env.EMAIL_SERVICE || 'Not configured'}`);
    console.log(`   User: ${process.env.EMAIL_USER || 'Not configured'}`);
    console.log(`   Password: ${process.env.EMAIL_PASS ? '✅ Configured' : '❌ Not configured'}`);
    
    console.log('\n🤖 AI API Keys:');
    console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   Gemini: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    
    console.log('\n🔐 Security:');
    console.log(`   JWT Secret: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Not configured'}`);
    
    console.log('\n🎉 Setup verification complete!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    process.exit(0);
  }
};

testConnection();
