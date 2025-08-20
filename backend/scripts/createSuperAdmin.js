const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sivoham', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ isSuperAdmin: true });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.mobile);
    } else {
      // Create new super admin user with mobile 9999999999
      const superAdmin = new User({
        mobile: '9999999999',
        firstName: 'Super',
        lastName: 'Admin',
        comment: 'System Super Administrator',
        isSelected: true,
        isAdmin: true,
        isSuperAdmin: true,
        role: 'superadmin',
        place: 'System',
        gender: 'Other',
        age: 30,
        preferredLang: 'English',
        refSource: 'System',
        referrerInfo: 'System Generated',
        country: 'India',
        profession: 'Administrator',
        address: 'System',
        email: 'superadmin@sivoham.com'
      });
      
      await superAdmin.save();
      console.log('Super admin created successfully with mobile:', superAdmin.mobile);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();