const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// --- IMPORTANT ---
// CONFIGURE YOUR ADMIN CREDENTIALS HERE BEFORE RUNNING THE SCRIPT
const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@school.com';
const ADMIN_PASSWORD = 'SecureAdminPassword123!'; // Change this to a strong password

// --- Import User Model ---
// This requires the schema definition. Make sure it matches your server.js
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    studentId: { type: String, default: '' },
    className: { type: String, default: '' },
    section: { type: String, default: '' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// --- Database Connection and Seeding ---
const seedAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully.');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
        if (existingAdmin) {
            console.log('Admin user with this email already exists.');
            return;
        }

        // Hash the password
        console.log('Hashing admin password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // Create new admin user
        const adminUser = new User({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin'
        });

        await adminUser.save();
        console.log('--- ADMIN USER CREATED SUCCESSFULLY! ---');
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD} (Use this to log in)`);
        console.log('------------------------------------------');

    } catch (error) {
        console.error('Error during admin seeding:', error.message);
    } finally {
        // Close the connection
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

// Run the script
seedAdmin();
