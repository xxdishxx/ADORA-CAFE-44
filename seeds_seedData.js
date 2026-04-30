const mongoose = require('mongoose');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Settings.deleteMany({});

    // Seed products
    const products = [
      {
        name: 'Espresso',
        basePreparationTime: 2,
        price: 3.5,
        category: 'coffee',
        description: 'Single shot of rich espresso',
        isActive: true,
      },
      {
        name: 'Cappuccino',
        basePreparationTime: 4,
        price: 5.0,
        category: 'coffee',
        description: 'Espresso with steamed milk and foam',
        isActive: true,
      },
      {
        name: 'Latte',
        basePreparationTime: 4,
        price: 5.5,
        category: 'coffee',
        description: 'Espresso with plenty of steamed milk',
        isActive: true,
      },
      {
        name: 'Americano',
        basePreparationTime: 3,
        price: 4.0,
        category: 'coffee',
        description: 'Espresso diluted with hot water',
        isActive: true,
      },
      {
        name: 'Mocha',
        basePreparationTime: 5,
        price: 6.0,
        category: 'coffee',
        description: 'Espresso with chocolate and milk',
        isActive: true,
      },
      {
        name: 'Green Tea',
        basePreparationTime: 3,
        price: 3.0,
        category: 'tea',
        description: 'Fresh green tea',
        isActive: true,
      },
      {
        name: 'Berry Smoothie',
        basePreparationTime: 4,
        price: 6.5,
        category: 'smoothie',
        description: 'Mixed berries blended smoothie',
        isActive: true,
      },
    ];

    await Product.insertMany(products);
    console.log('✅ Products seeded successfully');

    // Seed settings
    const settings = new Settings({
      maxActiveOrders: 4,
      rushMode: false,
      shopStatus: 'open',
    });

    await settings.save();
    console.log('✅ Settings seeded successfully');

    console.log('
╔════════════════════════════════╗
║  Database seeded successfully! ║
╚════════════════════════════════╝
    ');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();