const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// --- CORS Configuration for Deployment ---
// This allows your Netlify frontend and your local machine to talk to this server.
const whitelist = [
    'http://localhost:5173', // For local development
    'https://internedvirondharunkumar.netlify.app' // Your live Netlify URL
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
app.use(express.json());


// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Database Schemas ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    studentId: { type: String },
    className: { type: String },
    section: { type: String },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
    school_id: { type: String },
    student_info: {
        name: String,
        id: String,
        email: String
    },
    collectRequestId: { type: String, unique: true, required: true },
}, { timestamps: true });

const orderStatusSchema = new mongoose.Schema({
    collect_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    order_amount: Number,
    transaction_amount: Number,
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    details: { type: Object }
});

const User = mongoose.model('User', UserSchema);
const Order = mongoose.model('Order', orderSchema);
const OrderStatus = mongoose.model('OrderStatus', orderStatusSchema);

// --- Middleware ---
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

// --- API Routes ---
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    if (role === 'admin') return res.status(400).json({ message: 'Admin registration is not allowed.' });
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({ username, email, password: hashedPassword, role: 'student' });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const payload = { userId: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { _id: user._id, username: user.username, email: user.email, role: user.role, studentId: user.studentId } });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.put('/api/student/details', authMiddleware, async (req, res) => {
    const { studentId, className, section } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.user.userId, { studentId, className, section }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) { res.status(500).json({ message: 'Server error while updating details.' }); }
});

app.get('/api/admin/transactions', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status && ['pending', 'success', 'failed'].includes(status)) { query.status = status; }
        const transactions = await OrderStatus.find(query).populate({ path: 'collect_id', select: 'student_info collectRequestId createdAt' }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// --- Payment Route ---
app.post('/api/payment/create-payment', authMiddleware, async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'student') {
            return res.status(403).json({ message: 'User not authorized.' });
        }
        
        const callback_url = `${process.env.FRONTEND_URL}/payment-callback`;
        
        const signPayload = {
            school_id: process.env.SCHOOL_ID,
            amount: String(amount),
            callback_url: callback_url,
        };
        const sign = jwt.sign(signPayload, process.env.PG_KEY);

        const requestBody = {
            school_id: process.env.SCHOOL_ID,
            amount: String(amount),
            callback_url: callback_url,
            sign: sign,
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_KEY}`
        };

        const gatewayResponse = await axios.post('https://dev-vanilla.edviron.com/erp/create-collect-request', requestBody, { headers });
        
        if (!gatewayResponse.data || !gatewayResponse.data.collect_request_url) {
            console.error('Invalid response from payment gateway:', gatewayResponse.data);
            throw new Error('Payment gateway did not return a valid payment URL.');
        }
        
        const { collect_request_id, collect_request_url } = gatewayResponse.data;

        const newOrder = new Order({
            school_id: process.env.SCHOOL_ID,
            student_info: { name: user.username, id: user.studentId, email: user.email },
            collectRequestId: collect_request_id,
        });
        await newOrder.save();
        
        const orderStatus = new OrderStatus({
            collect_id: newOrder._id,
            order_amount: amount,
            transaction_amount: amount,
            status: 'success',
            details: { message: "Marked as success for development." }
        });
        await orderStatus.save();
        
        console.log(`Transaction ${collect_request_id} immediately marked as SUCCESS for development.`);
        
        res.json({ paymentUrl: collect_request_url });

    } catch (error) {
        console.error('Payment creation error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to create payment request.' });
    }
});

// --- Start Server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

