const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('sewage_system');
        console.log('✅ Connected to MongoDB');
    } catch(e) {
        console.log('❌ MongoDB connection error:', e.message);
    }
}
connectDB();

// API endpoints
app.get('/api/stations', async (req, res) => {
    try {
        const data = await db.collection('stations').find().toArray();
        res.json(data);
    } catch(e) { res.json([]); }
});

app.post('/api/stations', async (req, res) => {
    try {
        await db.collection('stations').deleteMany({});
        if (req.body.length) await db.collection('stations').insertMany(req.body);
        res.json({ success: true });
    } catch(e) { res.json({ success: false, error: e.message }); }
});

app.get('/api/employees', async (req, res) => {
    try {
        const data = await db.collection('employees').find().toArray();
        res.json(data);
    } catch(e) { res.json([]); }
});

app.post('/api/employees', async (req, res) => {
    try {
        await db.collection('employees').deleteMany({});
        if (req.body.length) await db.collection('employees').insertMany(req.body);
        res.json({ success: true });
    } catch(e) { res.json({ success: false, error: e.message }); }
});

app.get('/api/faults', async (req, res) => {
    try {
        const data = await db.collection('faults').find().toArray();
        res.json(data);
    } catch(e) { res.json([]); }
});

app.post('/api/faults', async (req, res) => {
    try {
        await db.collection('faults').deleteMany({});
        if (req.body.length) await db.collection('faults').insertMany(req.body);
        res.json({ success: true });
    } catch(e) { res.json({ success: false, error: e.message }); }
});

app.get('/api/monthlyCosts', async (req, res) => {
    try {
        const data = await db.collection('monthlyCosts').find().toArray();
        res.json(data);
    } catch(e) { res.json([]); }
});

app.post('/api/monthlyCosts', async (req, res) => {
    try {
        await db.collection('monthlyCosts').deleteMany({});
        if (req.body.length) await db.collection('monthlyCosts').insertMany(req.body);
        res.json({ success: true });
    } catch(e) { res.json({ success: false, error: e.message }); }
});

app.get('/api/dailyReports', async (req, res) => {
    try {
        const data = await db.collection('dailyReports').find().toArray();
        res.json(data);
    } catch(e) { res.json([]); }
});

app.post('/api/dailyReports', async (req, res) => {
    try {
        await db.collection('dailyReports').deleteMany({});
        if (req.body.length) await db.collection('dailyReports').insertMany(req.body);
        res.json({ success: true });
    } catch(e) { res.json({ success: false, error: e.message }); }
});

app.get('/api/archive', async (req, res) => {
    try {
        const data = await db.collection('archive').find().toArray();
        res.json(data);
    } catch(e) { res.json([]); }
});

app.post('/api/archive', async (req, res) => {
    try {
        await db.collection('archive').deleteMany({});
        if (req.body.length) await db.collection('archive').insertMany(req.body);
        res.json({ success: true });
    } catch(e) { res.json({ success: false, error: e.message }); }
});

app.get('/api/users', async (req, res) => {
    try {
        const data = await db.collection('users').find().toArray();
        res.json(data);
    } catch(e) { res.json([]); }
});

app.post('/api/users', async (req, res) => {
    try {
        await db.collection('users').deleteMany({});
        if (req.body.length) await db.collection('users').insertMany(req.body);
        res.json({ success: true });
    } catch(e) { res.json({ success: false, error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
