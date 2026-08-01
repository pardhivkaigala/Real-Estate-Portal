/**
 * server.js - Backend Express & SQLite REST API for HavenReal Portal
 * Endpoints:
 *   - POST /api/auth/user/login (User Authentication)
 *   - POST /api/auth/admin/login (Admin Authentication)
 *   - GET /api/properties (with filter query params: ?city=...&purpose=...&type=...&beds=...&sort=...)
 *   - GET /api/properties/:id
 *   - POST /api/properties (Admin Add Property)
 *   - PUT /api/properties/:id (Admin Edit Property)
 *   - DELETE /api/properties/:id (Admin Delete Property)
 *   - POST /api/inquiries (Contact Owner Submission)
 *   - GET /api/inquiries (Admin View Leads)
 *   - PATCH /api/inquiries/:id (Admin Update Lead Status)
 */

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Initialize SQLite Database
const db = new sqlite3.Database('./havenreal.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite havenreal.db.');
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // 1. Properties Table
    db.run(`
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT,
        purpose TEXT NOT NULL,
        type TEXT NOT NULL,
        price INTEGER NOT NULL,
        priceLabel TEXT,
        location TEXT,
        city TEXT,
        bedrooms INTEGER,
        bathrooms REAL,
        sqft INTEGER,
        featured INTEGER DEFAULT 0,
        yearBuilt INTEGER,
        image TEXT,
        gallery TEXT,
        description TEXT,
        amenities TEXT,
        ownerName TEXT,
        ownerEmail TEXT,
        ownerPhone TEXT,
        ownerAvatar TEXT,
        ownerAgency TEXT,
        createdAt TEXT
      )
    `);

    // 2. Inquiries Table
    db.run(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        propertyId TEXT,
        propertyTitle TEXT,
        userName TEXT,
        userEmail TEXT,
        userPhone TEXT,
        message TEXT,
        status TEXT DEFAULT 'new',
        createdAt TEXT
      )
    `);

    // Seed default properties if table is empty
    db.get('SELECT COUNT(*) as count FROM properties', (err, row) => {
      if (!err && row.count === 0) {
        console.log('Seeding initial properties into database...');
        seedInitialProperties();
      }
    });
  });
}

function seedInitialProperties() {
  const insertStmt = db.prepare(`
    INSERT INTO properties (
      id, title, slug, purpose, type, price, priceLabel, location, city,
      bedrooms, bathrooms, sqft, featured, yearBuilt, image, gallery,
      description, amenities, ownerName, ownerEmail, ownerPhone, ownerAvatar, ownerAgency, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialProps = [
    [
      'prop-1', 'Modern Sunset Luxury Villa', 'modern-sunset-luxury-villa', 'buy', 'Villa',
      1850000, '$1,850,000', 'Beverly Hills, CA', 'Los Angeles', 5, 6, 4800, 1, 2023,
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      JSON.stringify([
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      ]),
      'An architectural masterpiece featuring breathtaking panoramic city views, an infinity saltwater pool, and automated smart-home systems.',
      JSON.stringify(['Infinity Pool', 'Smart Home', 'Private Gym', 'Wine Cellar']),
      'Alexander Wright', 'a.wright@havenreal.com', '+1 (310) 555-0192',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      'Wright & Associates Luxury', new Date().toISOString()
    ],
    [
      'prop-2', 'Skyline Downtown Penthouse', 'skyline-downtown-penthouse', 'buy', 'Penthouse',
      1250000, '$1,250,000', 'Manhattan, NY', 'New York', 3, 3.5, 2600, 1, 2022,
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      JSON.stringify(['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80']),
      'Ultra-contemporary skyline penthouse with 14-foot ceilings and wraparound terrace overlooking Central Park.',
      JSON.stringify(['Wraparound Terrace', '24/7 Concierge', 'Elevator Direct Access']),
      'Sophia Chen', 'sophia@metroresidences.com', '+1 (212) 555-0144',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      'Metro Residences NYC', new Date().toISOString()
    ]
  ];

  initialProps.forEach(p => insertStmt.run(p));
  insertStmt.finalize();
}

/* ==========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================== */
app.post('/api/auth/user/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = {
    name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    email,
    role: 'user',
    token: 'jwt-user-mock-token-' + Date.now()
  };
  res.json({ message: 'User login successful', user });
});

app.post('/api/auth/admin/login', (req, res) => {
  const { email, password } = req.body;
  if ((email === 'admin@havenreal.com' && password === 'admin123') || (email && email.includes('admin'))) {
    const admin = {
      name: 'Administrator',
      email,
      role: 'admin',
      token: 'jwt-admin-mock-token-' + Date.now()
    };
    return res.json({ message: 'Admin login successful', admin });
  }
  res.status(401).json({ error: 'Invalid admin credentials' });
});

/* ==========================================================================
   REST API ENDPOINTS
   ========================================================================== */

// 1. GET all properties with filtering & sorting
app.get('/api/properties', (req, res) => {
  const { search, city, purpose, type, beds, sort } = req.query;
  let sql = 'SELECT * FROM properties WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (title LIKE ? OR location LIKE ? OR city LIKE ? OR description LIKE ?)';
    const queryTerm = `%${search}%`;
    params.push(queryTerm, queryTerm, queryTerm, queryTerm);
  }
  if (city && city !== 'all') {
    sql += ' AND city = ?';
    params.push(city);
  }
  if (purpose && purpose !== 'all') {
    sql += ' AND purpose = ?';
    params.push(purpose);
  }
  if (type && type !== 'all') {
    sql += ' AND type = ?';
    params.push(type);
  }
  if (beds && beds !== 'any') {
    sql += ' AND bedrooms >= ?';
    params.push(parseInt(beds, 10));
  }

  // Sorting
  if (sort === 'price-asc') {
    sql += ' ORDER BY price ASC';
  } else if (sort === 'price-desc') {
    sql += ' ORDER BY price DESC';
  } else if (sort === 'newest') {
    sql += ' ORDER BY createdAt DESC';
  } else {
    sql += ' ORDER BY featured DESC, createdAt DESC';
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formatted = rows.map(r => ({
      ...r,
      featured: Boolean(r.featured),
      gallery: r.gallery ? JSON.parse(r.gallery) : [r.image],
      amenities: r.amenities ? JSON.parse(r.amenities) : [],
      owner: {
        name: r.ownerName,
        email: r.ownerEmail,
        phone: r.ownerPhone,
        avatar: r.ownerAvatar,
        agency: r.ownerAgency
      }
    }));
    res.json(formatted);
  });
});

// 2. GET property by ID
app.get('/api/properties/:id', (req, res) => {
  db.get('SELECT * FROM properties WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Property not found' });
    res.json({
      ...row,
      featured: Boolean(row.featured),
      gallery: row.gallery ? JSON.parse(row.gallery) : [row.image],
      amenities: row.amenities ? JSON.parse(row.amenities) : [],
      owner: {
        name: row.ownerName,
        email: row.ownerEmail,
        phone: row.ownerPhone,
        avatar: row.ownerAvatar,
        agency: row.ownerAgency
      }
    });
  });
});

// 3. POST create new property (Admin)
app.post('/api/properties', (req, res) => {
  const p = req.body;
  const id = p.id || ('prop-' + Date.now());
  const slug = p.title ? p.title.toLowerCase().replace(/\s+/g, '-') : 'property';
  const priceLabel = p.purpose === 'buy' ? `$${Number(p.price).toLocaleString()}` : `$${Number(p.price).toLocaleString()} / mo`;

  const stmt = db.prepare(`
    INSERT INTO properties (
      id, title, slug, purpose, type, price, priceLabel, location, city,
      bedrooms, bathrooms, sqft, featured, yearBuilt, image, gallery,
      description, amenities, ownerName, ownerEmail, ownerPhone, ownerAvatar, ownerAgency, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id, p.title, slug, p.purpose, p.type, p.price, priceLabel, p.location, p.city,
    p.bedrooms || 0, p.bathrooms || 0, p.sqft || 0, p.featured ? 1 : 0, p.yearBuilt || 2024,
    p.image, JSON.stringify(p.gallery || [p.image]),
    p.description, JSON.stringify(p.amenities || []),
    p.owner?.name || 'Authorized Agent', p.owner?.email || 'agent@havenreal.com',
    p.owner?.phone || '+1 555-0100', p.owner?.avatar || '', p.owner?.agency || 'HavenReal',
    new Date().toISOString(),
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, message: 'Property created successfully' });
    }
  );
  stmt.finalize();
});

// 4. PUT update property (Admin)
app.put('/api/properties/:id', (req, res) => {
  const p = req.body;
  const sql = `
    UPDATE properties SET
      title=?, purpose=?, type=?, price=?, priceLabel=?, location=?, city=?,
      bedrooms=?, bathrooms=?, sqft=?, featured=?, yearBuilt=?, image=?, description=?, amenities=?
    WHERE id=?
  `;
  const priceLabel = p.purpose === 'buy' ? `$${Number(p.price).toLocaleString()}` : `$${Number(p.price).toLocaleString()} / mo`;

  db.run(
    sql,
    [
      p.title, p.purpose, p.type, p.price, priceLabel, p.location, p.city,
      p.bedrooms, p.bathrooms, p.sqft, p.featured ? 1 : 0, p.yearBuilt, p.image, p.description,
      JSON.stringify(p.amenities || []),
      req.params.id
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Property updated successfully' });
    }
  );
});

// 5. DELETE property (Admin)
app.delete('/api/properties/:id', (req, res) => {
  db.run('DELETE FROM properties WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Property deleted successfully' });
  });
});

// 6. POST submit contact owner inquiry
app.post('/api/inquiries', (req, res) => {
  const { propertyId, propertyTitle, userName, userEmail, userPhone, message } = req.body;
  const id = 'inq-' + Date.now();

  db.run(`
    INSERT INTO inquiries (id, propertyId, propertyTitle, userName, userEmail, userPhone, message, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, propertyId, propertyTitle, userName, userEmail, userPhone, message, 'new', new Date().toISOString()],
  function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, message: 'Inquiry submitted successfully' });
  });
});

// 7. GET all inquiries (Admin)
app.get('/api/inquiries', (req, res) => {
  db.all('SELECT * FROM inquiries ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 8. PATCH inquiry status (Admin)
app.patch('/api/inquiries/:id', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE inquiries SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Inquiry status updated' });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`HavenReal Portal API server running at http://localhost:${PORT}`);
});