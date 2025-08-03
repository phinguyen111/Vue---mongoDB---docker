const User = require('../server/models/User');
const connectDB = require('../server/config/database');
const auth = require('../server/middleware/auth');

// CORS helper function
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
}

// Get current user profile
async function getUserProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('favorites', 'title author cover')
      .populate('history.book', 'title author cover');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Update user profile
async function updateUserProfile(req, res) {
  try {
    const { name, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get all users (admin only)
async function getAllUsers(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const {
      search,
      role,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get user by ID (admin only)
async function getUserById(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('favorites', 'title author cover')
      .populate('history.book', 'title author cover');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Update user (admin only)
async function updateUser(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Delete user (admin only)
async function deleteUser(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Add book to favorites
async function addToFavorites(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.favorites.includes(req.params.bookId)) {
      user.favorites.push(req.params.bookId);
      await user.save();
    }

    res.json({ message: 'Book added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Remove book from favorites
async function removeFromFavorites(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    
    user.favorites = user.favorites.filter(
      bookId => bookId.toString() !== req.params.bookId
    );
    await user.save();

    res.json({ message: 'Book removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Main handler for Vercel
export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Connect to database
  await connectDB();

  const { url, method } = req;
  const userIdMatch = url.match(/\/api\/users\/([^/]+)$/);
  const favoritesMatch = url.match(/\/api\/users\/favorites\/([^/]+)$/);
  
  if (url === '/api/users/profile' && method === 'GET') {
    return auth(req, res, () => getUserProfile(req, res));
  } else if (url === '/api/users/profile' && method === 'PUT') {
    return auth(req, res, () => updateUserProfile(req, res));
  } else if (url === '/api/users' && method === 'GET') {
    return auth(req, res, () => getAllUsers(req, res));
  } else if (userIdMatch && method === 'GET') {
    req.params = { id: userIdMatch[1] };
    return auth(req, res, () => getUserById(req, res));
  } else if (userIdMatch && method === 'PUT') {
    req.params = { id: userIdMatch[1] };
    return auth(req, res, () => updateUser(req, res));
  } else if (userIdMatch && method === 'DELETE') {
    req.params = { id: userIdMatch[1] };
    return auth(req, res, () => deleteUser(req, res));
  } else if (favoritesMatch && method === 'POST') {
    req.params = { bookId: favoritesMatch[1] };
    return auth(req, res, () => addToFavorites(req, res));
  } else if (favoritesMatch && method === 'DELETE') {
    req.params = { bookId: favoritesMatch[1] };
    return auth(req, res, () => removeFromFavorites(req, res));
  } else {
    return res.status(404).json({ message: 'Not found' });
  }
}