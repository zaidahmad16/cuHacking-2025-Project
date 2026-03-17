const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const SHELTERS_FILE = path.join(DATA_DIR, 'shelters.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SWIPES_FILE = path.join(DATA_DIR, 'swipes.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper functions to read/write JSON files
const readJSON = (filepath, defaultValue = []) => {
  try {
    if (fs.existsSync(filepath)) {
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filepath}:`, error);
  }
  return defaultValue;
};

const writeJSON = (filepath, data) => {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filepath}:`, error);
    return false;
  }
};

// Initialize with sample shelter data if empty
const initializeShelters = () => {
  const shelters = readJSON(SHELTERS_FILE);
  if (shelters.length === 0) {
    const sampleShelters = [
      {
        id: "shelter-1",
        name: "Ottawa Mission",
        location: "35 Waller Street, Ottawa, ON",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
        amenities: ["Meals", "Beds", "Showers", "Laundry"],
        gender: "Men",
        capacity: 250,
        phone: "(613) 234-1144"
      },
      {
        id: "shelter-2",
        name: "Shepherds of Good Hope",
        location: "233 Murray Street, Ottawa, ON",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
        amenities: ["Meals", "Beds", "Medical Services", "Counseling"],
        gender: "All",
        capacity: 180,
        phone: "(613) 789-8210"
      },
      {
        id: "shelter-3",
        name: "Cornerstone Housing for Women",
        location: "292 Albert Street, Ottawa, ON",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
        amenities: ["Beds", "Meals", "Childcare", "Job Training"],
        gender: "Women",
        capacity: 60,
        phone: "(613) 254-6584"
      },
      {
        id: "shelter-4",
        name: "Salvation Army Booth Centre",
        location: "171 George Street, Ottawa, ON",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
        amenities: ["Beds", "Meals", "Addiction Recovery", "Chapel"],
        gender: "Men",
        capacity: 100,
        phone: "(613) 241-1573"
      },
      {
        id: "shelter-5",
        name: "Youth Services Bureau",
        location: "147 Besserer Street, Ottawa, ON",
        image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
        amenities: ["Beds", "Meals", "Education Programs", "Counseling"],
        gender: "Youth (16-24)",
        capacity: 40,
        phone: "(613) 729-1000"
      },
      {
        id: "shelter-6",
        name: "Union Mission",
        location: "148 King Edward Avenue, Ottawa, ON",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
        amenities: ["Beds", "Meals", "Showers", "Clothing"],
        gender: "All",
        capacity: 75,
        phone: "(613) 232-6350"
      }
    ];
    writeJSON(SHELTERS_FILE, sampleShelters);
    return sampleShelters;
  }
  return shelters;
};

// Initialize swipes file
const initializeSwipes = () => {
  if (!fs.existsSync(SWIPES_FILE)) {
    writeJSON(SWIPES_FILE, {});
  }
};

// Initialize users file
const initializeUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    writeJSON(USERS_FILE, {});
  }
};

// Run initialization
initializeShelters();
initializeSwipes();
initializeUsers();

// ============ AUTH ENDPOINTS ============

// Simple user registration/login
app.post('/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = readJSON(USERS_FILE, {});
    
    if (users[email]) {
      return res.status(400).json({ error: "User already exists" });
    }

    const userId = uuidv4();
    users[email] = {
      id: userId,
      email,
      password, // In production, hash this!
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    writeJSON(USERS_FILE, users);
    
    res.json({ 
      message: "User registered successfully",
      user: { id: userId, email, name: users[email].name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = readJSON(USERS_FILE, {});
    const user = users[email];

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ 
      message: "Login successful",
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SHELTER ENDPOINTS ============

// Fetch all shelters (with optional filters)
app.get('/shelters', (req, res) => {
  try {
    let shelters = readJSON(SHELTERS_FILE);
    const { gender, religion, demographics, interests } = req.query;

    if (gender && gender !== 'All') {
      shelters = shelters.filter(s =>
        s.gender === 'All' || s.gender.toLowerCase().includes(gender.toLowerCase())
      );
    }
    if (religion && religion !== 'Any') {
      shelters = shelters.filter(s =>
        s.religion && s.religion.toLowerCase().includes(religion.toLowerCase()) || s.religion === 'None'
      );
    }
    if (demographics) {
      shelters = shelters.filter(s =>
        s.demographics && (
          s.demographics.includes('All Races') ||
          s.demographics.some(d => d.toLowerCase().includes(demographics.toLowerCase()))
        )
      );
    }
    if (interests) {
      const interestList = interests.split(',').map(i => i.trim().toLowerCase());
      shelters = shelters.filter(s =>
        s.interests && s.interests.some(si => interestList.some(i => si.toLowerCase().includes(i)))
      );
    }

    res.json(shelters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single shelter
app.get('/shelters/:id', (req, res) => {
  try {
    const shelters = readJSON(SHELTERS_FILE);
    const shelter = shelters.find(s => s.id === req.params.id);
    
    if (!shelter) {
      return res.status(404).json({ error: "Shelter not found" });
    }
    
    res.json(shelter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SWIPE ENDPOINTS ============

// Save shelter (Swipe Right / Like)
app.post('/swipe-right', (req, res) => {
  try {
    const { userId, shelterId } = req.body;
    if (!userId || !shelterId) {
      return res.status(400).json({ error: "userId and shelterId are required" });
    }

    const swipes = readJSON(SWIPES_FILE, {});
    
    if (!swipes[userId]) {
      swipes[userId] = { likedShelters: [], skippedShelters: [] };
    }

    // Add to liked if not already there
    if (!swipes[userId].likedShelters.includes(shelterId)) {
      swipes[userId].likedShelters.push(shelterId);
    }
    
    // Remove from skipped if it was there
    swipes[userId].skippedShelters = swipes[userId].skippedShelters.filter(id => id !== shelterId);

    writeJSON(SWIPES_FILE, swipes);
    res.json({ message: "Shelter saved!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Skip shelter (Swipe Left)
app.post('/swipe-left', (req, res) => {
  try {
    const { userId, shelterId } = req.body;
    if (!userId || !shelterId) {
      return res.status(400).json({ error: "userId and shelterId are required" });
    }

    const swipes = readJSON(SWIPES_FILE, {});
    
    if (!swipes[userId]) {
      swipes[userId] = { likedShelters: [], skippedShelters: [] };
    }

    // Add to skipped if not already there
    if (!swipes[userId].skippedShelters.includes(shelterId)) {
      swipes[userId].skippedShelters.push(shelterId);
    }

    writeJSON(SWIPES_FILE, swipes);
    res.json({ message: "Shelter skipped!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch saved shelters for a user
app.get('/saved-shelters', (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const swipes = readJSON(SWIPES_FILE, {});
    const userSwipes = swipes[userId];

    if (!userSwipes || !userSwipes.likedShelters || userSwipes.likedShelters.length === 0) {
      return res.json([]);
    }

    const shelters = readJSON(SHELTERS_FILE);
    const savedShelters = shelters.filter(shelter => 
      userSwipes.likedShelters.includes(shelter.id)
    );

    res.json(savedShelters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a saved shelter
app.delete('/saved-shelters/:shelterId', (req, res) => {
  try {
    const { userId } = req.query;
    const { shelterId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const swipes = readJSON(SWIPES_FILE, {});
    
    if (swipes[userId]) {
      swipes[userId].likedShelters = swipes[userId].likedShelters.filter(id => id !== shelterId);
      writeJSON(SWIPES_FILE, swipes);
    }

    res.json({ message: "Shelter removed from saved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🏠 ShelterMatch Ottawa Server running on http://localhost:${PORT}`);
  console.log(`📁 Data stored in: ${DATA_DIR}`);
});
