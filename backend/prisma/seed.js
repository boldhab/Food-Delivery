const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for Food Hub Delivery...');

  const hashPassword = async (pwd) => bcrypt.hash(pwd, 10);

  // 1. Seed Admin Account
  const adminPassword = await hashPassword('Admin@123456');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@foodiehub.com' },
    update: { isActive: true, password: adminPassword },
    create: {
      name: 'System Administrator',
      email: 'admin@foodiehub.com',
      password: adminPassword,
      role: 'admin',
      phone: '+251 91 100 0001',
      street: 'Bole Road, Mega Building',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      zipCode: '1000',
      isActive: true
    }
  });
  console.log('✅ Admin user ready:', admin.email);

  // 2. Seed Fleet of Active Couriers / Drivers
  const driverPassword = await hashPassword('Driver@123456');
  const driverDefs = [
    {
      name: 'Abebe Bikila',
      email: 'driver@foodiehub.com',
      phone: '+251 91 101 0001',
      street: 'Bole Atlas, Street 12',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      zipCode: '1000',
      vehicleType: 'Electric Scooter (Lifan E3)',
      plateNumber: 'AA-3-A1245',
      licenseNumber: 'ET-DRV-987654',
      rating: 4.9,
      completedDeliveries: 128
    },
    {
      name: 'Dawit Alemu',
      email: 'marcus.driver@foodiehub.com',
      phone: '+251 91 101 0002',
      street: 'Kazanchis, Guinea Conakry St',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      zipCode: '1000',
      vehicleType: 'E-Bike Express (RadPower)',
      plateNumber: 'AA-3-B8841',
      licenseNumber: 'ET-DRV-552190',
      rating: 4.85,
      completedDeliveries: 94
    },
    {
      name: 'Tigist Mengistu',
      email: 'elena.driver@foodiehub.com',
      phone: '+251 91 101 0003',
      street: 'Sarbet, South Africa St',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      zipCode: '1000',
      vehicleType: 'Compact Hatchback (Toyota Vitz)',
      plateNumber: 'AA-2-C7892',
      licenseNumber: 'ET-DRV-341908',
      rating: 4.96,
      completedDeliveries: 215
    },
    {
      name: 'Henok Girma',
      email: 'carlos.driver@foodiehub.com',
      phone: '+251 91 101 0004',
      street: 'Piassa, Churchill Avenue',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      zipCode: '1000',
      vehicleType: 'Motorcycle (Bajaj Boxer 150)',
      plateNumber: 'AA-3-M7731',
      licenseNumber: 'ET-DRV-778219',
      rating: 4.9,
      completedDeliveries: 167
    }
  ];

  const drivers = [];
  for (const def of driverDefs) {
    const driver = await prisma.user.upsert({
      where: { email: def.email },
      update: {
        name: def.name,
        password: driverPassword,
        isActive: true,
        driverProfile: {
          upsert: {
            create: {
              vehicleType: def.vehicleType,
              plateNumber: def.plateNumber,
              licenseNumber: def.licenseNumber,
              isAvailable: true,
              rating: def.rating,
              completedDeliveries: def.completedDeliveries
            },
            update: {
              vehicleType: def.vehicleType,
              isAvailable: true,
              rating: def.rating
            }
          }
        }
      },
      create: {
        name: def.name,
        email: def.email,
        password: driverPassword,
        role: 'driver',
        phone: def.phone,
        street: def.street,
        city: def.city,
        state: def.state,
        zipCode: def.zipCode,
        isActive: true,
        driverProfile: {
          create: {
            vehicleType: def.vehicleType,
            plateNumber: def.plateNumber,
            licenseNumber: def.licenseNumber,
            isAvailable: true,
            rating: def.rating,
            completedDeliveries: def.completedDeliveries
          }
        }
      }
    });
    drivers.push(driver);
  }
  console.log(`✅ Seeded ${drivers.length} active couriers`);

  // 3. Seed Customers
  const userPassword = await hashPassword('User@123456');
  const customerDefs = [
    {
      name: 'Demo Habos',
      email: 'demo@habos.dev',
      phone: '+251 92 201 0000',
      street: 'Bole Medhanealem, House 100',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      zipCode: '1000'
    },
    {
      name: 'Selamawit Desta',
      email: 'user@foodiehub.com',
      phone: '+251 92 201 0001',
      street: 'Bole Medhanealem, House 402',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      zipCode: '1000'
    },
    {
      name: 'Tewodros Kassahun',
      email: 'david.miller@foodiehub.com',
      phone: '+251 92 201 0002',
      street: 'CMC Michael, Building B, Apt 14',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      zipCode: '1000'
    },
    {
      name: 'Bethlehem Tilahun',
      email: 'emily.watson@foodiehub.com',
      phone: '+251 92 201 0003',
      street: 'Gerji Sunshine Condominium, Blk 12',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      zipCode: '1000'
    }
  ];

  const customers = [];
  for (const def of customerDefs) {
    const customer = await prisma.user.upsert({
      where: { email: def.email },
      update: {
        name: def.name,
        password: userPassword,
        isActive: true
      },
      create: {
        name: def.name,
        email: def.email,
        password: userPassword,
        role: 'user',
        phone: def.phone,
        street: def.street,
        city: def.city,
        state: def.state,
        zipCode: def.zipCode,
        isActive: true,
        cart: {
          create: {
            subtotal: 0,
            totalItems: 0
          }
        }
      }
    });
    customers.push(customer);
  }
  console.log(`✅ Seeded ${customers.length} customer accounts`);

  // 4. Seed Delicious & Diverse Ethiopian Cuisine Across 6 Categories
  const foodDefs = [
    // Wat & Stews
    {
      name: 'Special Doro Wat with Boiled Egg',
      description: 'Slow-simmered tender chicken leg gently stewed in rich, fiery berbere sauce, caramelized onions, and spiced clarified butter (niter kibbeh), served with hard-boiled eggs and fresh teff injera.',
      price: 420.00,
      category: 'Wat & Stews',
      image: '/images/foods/doro_wat.jpg',
      isAvailable: true,
      isVegetarian: false,
      isPopular: true,
      isFeatured: true,
      rating: 4.95,
      numReviews: 142,
      preparationTime: 25,
      ingredients: ['Free-Range Chicken', 'Berbere Spice', 'Niter Kibbeh', 'Red Onions', 'Hard-Boiled Egg', 'Teff Injera'],
      allergens: ['Egg', 'Dairy'],
      calories: 680
    },
    {
      name: 'Sega Wat (Spicy Beef Stew)',
      description: 'Succulent prime beef simmered to melt-in-your-mouth tenderness in a fragrant berbere reduction with garlic, ginger, and cardamom.',
      price: 380.00,
      category: 'Wat & Stews',
      image: '/images/foods/sega_wat.jpg',
      isAvailable: true,
      isVegetarian: false,
      isPopular: true,
      isFeatured: false,
      rating: 4.88,
      numReviews: 98,
      preparationTime: 20,
      ingredients: ['Prime Beef', 'Berbere', 'Garlic', 'Ginger', 'Cardamom', 'Niter Kibbeh'],
      allergens: ['Dairy'],
      calories: 620
    },
    {
      name: 'Alicha Sega Wat',
      description: 'Mild, golden beef stew slow-cooked with fresh turmeric, ginger, garlic, and sweet onions for a rich and comforting aromatic flavor profile.',
      price: 360.00,
      category: 'Wat & Stews',
      image: '/images/foods/alicha_wat.jpg',
      isAvailable: true,
      isVegetarian: false,
      isPopular: false,
      isFeatured: true,
      rating: 4.82,
      numReviews: 76,
      preparationTime: 20,
      ingredients: ['Beef Cubes', 'Turmeric', 'Ginger', 'Garlic', 'Sweet Onions', 'Injera'],
      allergens: [],
      calories: 580
    },

    // Tibs & Grills
    {
      name: 'Shekla Tibs (Sizzling Beef)',
      description: 'Sizzling prime beef cubes pan-seared over flaming clay charcoal shekla with rosemary sprigs, sweet jalapeños, red onions, and hot awaze dip.',
      price: 450.00,
      category: 'Tibs & Grills',
      image: '/images/foods/shekla_tibs.jpg',
      isAvailable: true,
      isVegetarian: false,
      isPopular: true,
      isFeatured: true,
      rating: 4.96,
      numReviews: 185,
      preparationTime: 18,
      ingredients: ['Tenderloin Beef', 'Fresh Rosemary', 'Jalapeño Peppers', 'Red Onions', 'Garlic', 'Awaze Sauce'],
      allergens: [],
      calories: 720
    },
    {
      name: 'Dereq Tibs (Crispy Lamb)',
      description: 'Crispy pan-fried lamb chunks seared with fragrant niter kibbeh, garlic, black pepper, and whole green chilies, served with freshly rolled injera.',
      price: 480.00,
      category: 'Tibs & Grills',
      image: '/images/foods/dereq_tibs.jpg',
      isAvailable: true,
      isVegetarian: false,
      isPopular: true,
      isFeatured: false,
      rating: 4.9,
      numReviews: 112,
      preparationTime: 15,
      ingredients: ['Lamb Chunks', 'Spiced Butter', 'Green Chili', 'Black Pepper', 'Garlic'],
      allergens: ['Dairy'],
      calories: 760
    },
    {
      name: 'Awaze Beef Tibs',
      description: 'Juicy seared beef tenderloin strips tossed in house-blended fiery awaze paste, sweet shallots, and fragrant Ethiopian basil.',
      price: 430.00,
      category: 'Tibs & Grills',
      image: '/images/foods/awaze_tibs.jpg',
      isAvailable: true,
      isVegetarian: false,
      isPopular: true,
      isFeatured: false,
      rating: 4.87,
      numReviews: 89,
      preparationTime: 16,
      ingredients: ['Beef Strips', 'Awaze Chili Paste', 'Shallots', 'Niter Kibbeh', 'Ethiopian Basil'],
      allergens: ['Dairy'],
      calories: 690
    },

    // Kitfo & Specialties
    {
      name: 'Special Kitfo with Ayib & Gomen',
      description: 'Finely minced lean beef seasoned with warm niter kibbeh and hot mitmita chili powder, served with fresh cottage cheese (ayib) and collard greens (gomen).',
      price: 520.00,
      category: 'Kitfo & Specialties',
      image: '/images/foods/kitfo.jpg',
      isAvailable: true,
      isVegetarian: false,
      isPopular: true,
      isFeatured: true,
      rating: 4.98,
      numReviews: 194,
      preparationTime: 15,
      ingredients: ['Lean Minced Beef', 'Mitmita Chili', 'Niter Kibbeh', 'Ayib Cottage Cheese', 'Steamed Gomen', 'Kocho'],
      allergens: ['Dairy'],
      calories: 780
    },
    {
      name: 'Gored Gored',
      description: 'Prime raw beef cubes lightly seasoned in warmed spiced clarified butter and fiery mitmita, served with awaze dipping sauce.',
      price: 490.00,
      category: 'Kitfo & Specialties',
      image: '/images/foods/gored_gored.jpg',
      isAvailable: true,
      isVegetarian: false,
      isPopular: false,
      isFeatured: true,
      rating: 4.91,
      numReviews: 73,
      preparationTime: 12,
      ingredients: ['Top Round Raw Beef', 'Niter Kibbeh', 'Mitmita', 'Awaze'],
      allergens: ['Dairy'],
      calories: 640
    },

    // Vegetarian & Fasting
    {
      name: 'Yetsom Beyaynetu (Fasting Veggie Platter)',
      description: 'A colorful royal feast featuring misir wat, kik alicha, gomen, shiro, atkilt wat, and beetroot salad gracefully arranged over fresh teff injera.',
      price: 320.00,
      category: 'Vegetarian & Fasting',
      image: '/images/foods/beyaynetu.jpg',
      isAvailable: true,
      isVegetarian: true,
      isPopular: true,
      isFeatured: true,
      rating: 4.94,
      numReviews: 168,
      preparationTime: 15,
      ingredients: ['Red Lentils', 'Split Yellow Peas', 'Collard Greens', 'Cabbage & Carrots', 'Beetroot', 'Injera'],
      allergens: [],
      calories: 540
    },
    {
      name: 'Shiro Tegabino (Claypot Chickpea Stew)',
      description: 'Finely ground sun-dried chickpeas and broad beans simmered in seasoned clay pot with garlic, ginger, and berbere until bubbling thick and fragrant.',
      price: 260.00,
      category: 'Vegetarian & Fasting',
      image: '/images/foods/shiro.jpg',
      isAvailable: true,
      isVegetarian: true,
      isPopular: true,
      isFeatured: false,
      rating: 4.89,
      numReviews: 145,
      preparationTime: 14,
      ingredients: ['Chickpea Flour', 'Berbere', 'Garlic', 'Ginger', 'Shallots', 'Green Chili'],
      allergens: [],
      calories: 460
    },
    {
      name: 'Misir Wat (Spicy Red Lentils)',
      description: 'Slow-simmered red lentils in a robust and spicy berbere sauce with caramelized onions and aromatic herbs.',
      price: 240.00,
      category: 'Vegetarian & Fasting',
      image: '/images/foods/misir_wat.jpg',
      isAvailable: true,
      isVegetarian: true,
      isPopular: false,
      isFeatured: false,
      rating: 4.78,
      numReviews: 82,
      preparationTime: 12,
      ingredients: ['Red Lentils', 'Berbere', 'Onions', 'Garlic', 'Vegetable Oil'],
      allergens: [],
      calories: 410
    },

    // Traditional Breakfast
    {
      name: 'Special Chechebsa with Pure Honey',
      description: 'Torn shredded flatbread lightly fried in fragrant spiced clarified butter (niter kibbeh) and berbere, drizzled with pure highland organic honey.',
      price: 220.00,
      category: 'Traditional Breakfast',
      image: '/images/foods/chechebsa.jpg',
      isAvailable: true,
      isVegetarian: true,
      isPopular: true,
      isFeatured: true,
      rating: 4.93,
      numReviews: 126,
      preparationTime: 12,
      ingredients: ['Kita Flatbread', 'Niter Kibbeh', 'Berbere', 'Organic Highland Honey'],
      allergens: ['Dairy', 'Gluten'],
      calories: 520
    },
    {
      name: 'Quanta Firfir',
      description: 'Seasoned sun-dried beef strips (quanta) and soft injera pieces soaked in a rich and savory berbere sauce, garnished with boiled egg.',
      price: 310.00,
      category: 'Traditional Breakfast',
      image: '/images/foods/quanta_firfir.jpg',
      isAvailable: true,
      isVegetarian: false,
      isPopular: true,
      isFeatured: false,
      rating: 4.86,
      numReviews: 94,
      preparationTime: 15,
      ingredients: ['Sun-Dried Beef', 'Teff Injera', 'Berbere Stew', 'Boiled Egg', 'Niter Kibbeh'],
      allergens: ['Egg', 'Dairy'],
      calories: 610
    },

    // Beverages & Coffee
    {
      name: 'Ethiopian Traditional Coffee (Jebena Buna)',
      description: 'Freshly roasted green Arabica coffee beans brewed to perfection in a traditional black clay jebena, served with aromatic frankincense and popped corn.',
      price: 120.00,
      category: 'Beverages & Coffee',
      image: '/images/foods/jebena_buna.jpg',
      isAvailable: true,
      isVegetarian: true,
      isPopular: true,
      isFeatured: true,
      rating: 4.99,
      numReviews: 210,
      preparationTime: 10,
      ingredients: ['Highland Arabica Beans', 'Water', 'Rue Herb (Tenadam)', 'Popped Corn'],
      allergens: [],
      calories: 15
    },
    {
      name: 'Fresh Spris Layered Juice',
      description: 'A vibrant triple-layered tropical smoothie made with pure fresh avocado, mango, and papaya puree, garnished with a squeeze of fresh lime.',
      price: 150.00,
      category: 'Beverages & Coffee',
      image: '/images/foods/spris_juice.jpg',
      isAvailable: true,
      isVegetarian: true,
      isPopular: true,
      isFeatured: false,
      rating: 4.91,
      numReviews: 130,
      preparationTime: 8,
      ingredients: ['Hass Avocado', 'Fresh Mango Puree', 'Ripe Papaya', 'Fresh Lime', 'Vimto Drizzle'],
      allergens: [],
      calories: 230
    }
  ];

  // Remove any legacy foods not in the current seed definitions
  const validFoodNames = foodDefs.map((f) => f.name);
  await prisma.food.deleteMany({
    where: { name: { notIn: validFoodNames } }
  });

  const foods = [];
  for (const food of foodDefs) {
    const item = await prisma.food.upsert({
      where: { name: food.name },
      update: food,
      create: food
    });
    foods.push(item);
  }
  console.log(`✅ Seeded ${foods.length} culinary menu items across 6 categories`);

  // Map foods by name for easy reference
  const foodMap = {};
  for (const f of foods) {
    foodMap[f.name] = f;
  }

  // 5. Seed Customer Food Reviews
  const reviewsData = [
    {
      userEmail: 'user@foodiehub.com',
      foodName: 'Special Doro Wat with Boiled Egg',
      rating: 5,
      comment: 'Authentic taste just like homemade! The berbere spice and tender chicken with fresh injera was phenomenal.'
    },
    {
      userEmail: 'david.miller@foodiehub.com',
      foodName: 'Shekla Tibs (Sizzling Beef)',
      rating: 5,
      comment: 'The sizzling shekla arrived hot with fresh rosemary aroma and perfect awaze dip. Best tibs in Addis!'
    },
    {
      userEmail: 'emily.watson@foodiehub.com',
      foodName: 'Special Kitfo with Ayib & Gomen',
      rating: 5,
      comment: 'Tender kitfo with perfectly seasoned niter kibbeh, fresh ayib, and warm gomen. Outstanding flavor.'
    },
    {
      userEmail: 'user@foodiehub.com',
      foodName: 'Yetsom Beyaynetu (Fasting Veggie Platter)',
      rating: 5,
      comment: 'Generous portions, vibrant fasting combo with delicious shiro and misir wat. 10/10.'
    }
  ];

  for (const rev of reviewsData) {
    const user = customers.find((c) => c.email === rev.userEmail);
    const food = foodMap[rev.foodName];
    if (user && food) {
      await prisma.review.upsert({
        where: {
          userId_foodId: {
            userId: user.id,
            foodId: food.id
          }
        },
        update: {
          rating: rev.rating,
          comment: rev.comment
        },
        create: {
          userId: user.id,
          foodId: food.id,
          rating: rev.rating,
          comment: rev.comment
        }
      });
    }
  }
  console.log('✅ Seeded authentic customer reviews');

  // 6. Seed Realistic Orders Across the 4 Kanban Dispatch Board Lanes
  const now = new Date();
  const minutesAgo = (m) => new Date(now.getTime() - m * 60 * 1000);

  const sampleOrders = [
    // Lane 1: Incoming / Pending Orders
    {
      orderNumber: 'ORD-9101',
      customer: customers[0],
      driver: null,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash_on_delivery',
      subtotal: 570.00,
      tax: 85.50,
      deliveryFee: 80.00,
      totalAmount: 735.50,
      specialInstructions: 'Extra spicy awaze on the side please!',
      deliveryInstructions: 'House 402, ring gate bell',
      createdAt: minutesAgo(6),
      items: [
        { food: foodMap['Special Doro Wat with Boiled Egg'], quantity: 1, price: 420.00 },
        { food: foodMap['Fresh Spris Layered Juice'], quantity: 1, price: 150.00 }
      ],
      history: [
        { status: 'pending', note: 'Order placed by customer via mobile checkout', timestamp: minutesAgo(6) }
      ]
    },
    {
      orderNumber: 'ORD-9102',
      customer: customers[1],
      driver: null,
      orderStatus: 'confirmed',
      paymentStatus: 'completed',
      paymentMethod: 'card',
      subtotal: 690.00,
      tax: 103.50,
      deliveryFee: 80.00,
      totalAmount: 873.50,
      specialInstructions: 'Please include extra green chili peppers.',
      deliveryInstructions: 'Leave with reception at Building B',
      createdAt: minutesAgo(12),
      items: [
        { food: foodMap['Shekla Tibs (Sizzling Beef)'], quantity: 1, price: 450.00 },
        { food: foodMap['Ethiopian Traditional Coffee (Jebena Buna)'], quantity: 2, price: 120.00 }
      ],
      history: [
        { status: 'pending', note: 'Order placed with Stripe Card Payment', timestamp: minutesAgo(12) },
        { status: 'confirmed', note: 'Payment verified and order confirmed', timestamp: minutesAgo(11) }
      ]
    },

    // Lane 2: In Kitchen / Preparing Orders
    {
      orderNumber: 'ORD-9088',
      customer: customers[2],
      driver: null,
      orderStatus: 'preparing',
      paymentStatus: 'completed',
      paymentMethod: 'card',
      subtotal: 780.00,
      tax: 117.00,
      deliveryFee: 0.00, // Free delivery promo above 750 ETB
      totalAmount: 897.00,
      specialInstructions: 'Kitfo leb-leb (lightly warmed) please.',
      deliveryInstructions: 'Call upon arrival at Sunshine Condominium',
      createdAt: minutesAgo(22),
      items: [
        { food: foodMap['Special Kitfo with Ayib & Gomen'], quantity: 1, price: 520.00 },
        { food: foodMap['Shiro Tegabino (Claypot Chickpea Stew)'], quantity: 1, price: 260.00 }
      ],
      history: [
        { status: 'pending', note: 'Order placed', timestamp: minutesAgo(22) },
        { status: 'confirmed', note: 'Confirmed by kitchen dispatch', timestamp: minutesAgo(20) },
        { status: 'preparing', note: 'Kitchen started preparation', timestamp: minutesAgo(16) }
      ]
    },

    // Lane 3: Out for Delivery / In Transit
    {
      orderNumber: 'ORD-9075',
      customer: customers[0],
      driver: drivers[0], // Abebe Bikila
      orderStatus: 'out_for_delivery',
      paymentStatus: 'completed',
      paymentMethod: 'card',
      subtotal: 870.00,
      tax: 130.50,
      deliveryFee: 80.00,
      totalAmount: 1080.50,
      specialInstructions: 'Please pack injera rolls separately.',
      deliveryInstructions: 'Gate code is #4042. House 402.',
      createdAt: minutesAgo(38),
      estimatedDeliveryTime: new Date(now.getTime() + 10 * 60 * 1000),
      driverWorkflow: {
        driverLat: 9.0125,
        driverLng: 38.7802,
        heading: 45,
        speed: 28,
        etaMinutes: 8,
        assignedAt: minutesAgo(25).toISOString(),
        pickedUpAt: minutesAgo(10).toISOString()
      },
      items: [
        { food: foodMap['Shekla Tibs (Sizzling Beef)'], quantity: 1, price: 450.00 },
        { food: foodMap['Special Doro Wat with Boiled Egg'], quantity: 1, price: 420.00 }
      ],
      history: [
        { status: 'pending', note: 'Order placed', timestamp: minutesAgo(38) },
        { status: 'confirmed', note: 'Confirmed', timestamp: minutesAgo(35) },
        { status: 'preparing', note: 'Cooking in kitchen', timestamp: minutesAgo(30) },
        { status: 'ready_for_pickup', note: 'Food packaged and waiting for courier', timestamp: minutesAgo(15) },
        { status: 'out_for_delivery', note: 'Courier Abebe Bikila picked up order', timestamp: minutesAgo(10) }
      ],
      communications: [
        {
          sender: drivers[0],
          role: 'driver',
          message: 'Hi Selamawit! I picked up your order from the restaurant and am heading to Bole Medhanealem now.',
          createdAt: minutesAgo(9)
        },
        {
          sender: customers[0],
          role: 'customer',
          message: 'Thank you Abebe! The gate code is #4042 if the compound guard asks.',
          createdAt: minutesAgo(7)
        },
        {
          sender: drivers[0],
          role: 'driver',
          message: 'Got it, see you in about 7 minutes!',
          createdAt: minutesAgo(5)
        }
      ]
    },

    // Lane 4: Delivered / Completed Today
    {
      orderNumber: 'ORD-9052',
      customer: customers[1],
      driver: drivers[1], // Dawit Alemu
      orderStatus: 'delivered',
      paymentStatus: 'completed',
      paymentMethod: 'card',
      subtotal: 560.00,
      tax: 84.00,
      deliveryFee: 80.00,
      totalAmount: 724.00,
      createdAt: minutesAgo(95),
      actualDeliveryTime: minutesAgo(55),
      items: [
        { food: foodMap['Yetsom Beyaynetu (Fasting Veggie Platter)'], quantity: 1, price: 320.00 },
        { food: foodMap['Misir Wat (Spicy Red Lentils)'], quantity: 1, price: 240.00 }
      ],
      history: [
        { status: 'pending', note: 'Order placed', timestamp: minutesAgo(95) },
        { status: 'confirmed', note: 'Order confirmed', timestamp: minutesAgo(90) },
        { status: 'preparing', note: 'Kitchen preparing fasting platter', timestamp: minutesAgo(85) },
        { status: 'out_for_delivery', note: 'Out with Dawit Alemu', timestamp: minutesAgo(70) },
        { status: 'delivered', note: 'Delivered securely to customer at CMC Michael', timestamp: minutesAgo(55) }
      ]
    },
    {
      orderNumber: 'ORD-9030',
      customer: customers[2],
      driver: drivers[2], // Tigist Mengistu
      orderStatus: 'delivered',
      paymentStatus: 'completed',
      paymentMethod: 'card',
      subtotal: 680.00,
      tax: 102.00,
      deliveryFee: 80.00,
      totalAmount: 862.00,
      createdAt: minutesAgo(180),
      actualDeliveryTime: minutesAgo(140),
      items: [
        { food: foodMap['Special Chechebsa with Pure Honey'], quantity: 2, price: 220.00 },
        { food: foodMap['Ethiopian Traditional Coffee (Jebena Buna)'], quantity: 2, price: 120.00 }
      ],
      history: [
        { status: 'pending', note: 'Order placed', timestamp: minutesAgo(180) },
        { status: 'out_for_delivery', note: 'Courier on way', timestamp: minutesAgo(155) },
        { status: 'delivered', note: 'Package handed directly to customer at Gerji Sunshine', timestamp: minutesAgo(140) }
      ]
    }
  ];

  // Remove any legacy orders not in the sample orders list
  const validOrderNumbers = sampleOrders.map((o) => o.orderNumber);
  await prisma.order.deleteMany({
    where: { orderNumber: { notIn: validOrderNumbers } }
  });

  for (const ord of sampleOrders) {
    // Delete existing if re-seeding to ensure clean history & items
    await prisma.order.deleteMany({
      where: { orderNumber: ord.orderNumber }
    });

    await prisma.order.create({
      data: {
        orderNumber: ord.orderNumber,
        userId: ord.customer.id,
        driverId: ord.driver ? ord.driver.id : null,
        customerName: ord.customer.name,
        customerEmail: ord.customer.email,
        customerPhone: ord.customer.phone,
        deliveryStreet: ord.customer.street,
        deliveryCity: ord.customer.city,
        deliveryState: ord.customer.state,
        deliveryZipCode: ord.customer.zipCode,
        deliveryInstructions: ord.deliveryInstructions || null,
        subtotal: ord.subtotal,
        tax: ord.tax,
        deliveryFee: ord.deliveryFee,
        totalAmount: ord.totalAmount,
        paymentMethod: ord.paymentMethod,
        paymentStatus: ord.paymentStatus,
        orderStatus: ord.orderStatus,
        specialInstructions: ord.specialInstructions || null,
        estimatedDeliveryTime: ord.estimatedDeliveryTime || null,
        actualDeliveryTime: ord.actualDeliveryTime || null,
        driverWorkflow: ord.driverWorkflow || null,
        createdAt: ord.createdAt,
        items: {
          create: ord.items.map((item) => ({
            foodId: item.food.id,
            name: item.food.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: Number((item.quantity * item.price).toFixed(2))
          }))
        },
        statusHistory: {
          create: ord.history.map((h) => ({
            status: h.status,
            note: h.note,
            timestamp: h.timestamp
          }))
        },
        communications: ord.communications
          ? {
              create: ord.communications.map((c) => ({
                senderId: c.sender.id,
                senderRole: c.role,
                message: c.message,
                createdAt: c.createdAt
              }))
            }
          : undefined
      }
    });
  }
  console.log(`✅ Seeded ${sampleOrders.length} live and historic orders with workflow & chat data`);

  // 7. Seed Active Promo Codes
  const promotions = [
    {
      code: 'WELCOME20',
      title: '20% Off Your First Order',
      description: 'Enjoy 20% discount on orders over 600 ETB for new accounts.',
      type: 'percent',
      value: 20,
      minOrderAmount: 600,
      maxUses: 1000,
      isActive: true,
      ctaLabel: 'Apply 20% Off'
    },
    {
      code: 'FREESHIP',
      title: 'Free Delivery Anywhere in Addis',
      description: 'Zero delivery charges on all orders above 750 ETB.',
      type: 'fixed',
      value: 80.00,
      minOrderAmount: 750,
      maxUses: 500,
      isActive: true,
      ctaLabel: 'Claim Free Delivery'
    },
    {
      code: 'TASTY15',
      title: '15% Traditional Feast Special',
      description: '15% discount on traditional Ethiopian dishes over 500 ETB.',
      type: 'percent',
      value: 15,
      minOrderAmount: 500,
      maxUses: 300,
      isActive: true,
      ctaLabel: 'Apply 15% Off'
    },
    {
      code: 'WEEKEND100',
      title: '100 ETB Off Weekend Feast',
      description: 'Get 100 ETB instant cash discount on any order above 800 ETB.',
      type: 'fixed',
      value: 100.0,
      minOrderAmount: 800,
      maxUses: 200,
      isActive: true,
      ctaLabel: 'Apply 100 ETB Coupon'
    }
  ];

  for (const promo of promotions) {
    await prisma.promotion.upsert({
      where: { code: promo.code },
      update: promo,
      create: promo
    });
  }
  console.log(`✅ Seeded ${promotions.length} active promotions`);

  // 8. Seed Admin Settings
  await prisma.adminSetting.upsert({
    where: { key: 'admin' },
    update: {
      general: {
        businessName: 'Food Hub Delivery',
        supportEmail: 'support@foodiehub.com',
        supportPhone: '+251 91 100 0001',
        timezone: 'Africa/Addis_Ababa',
        currency: 'ETB'
      },
      payment: {
        taxRate: 15.0,
        deliveryFee: 80.00,
        minimumOrder: 200.0,
        allowCashOnDelivery: true,
        autoCapturePayments: true
      }
    },
    create: {
      key: 'admin',
      general: {
        businessName: 'Food Hub Delivery',
        supportEmail: 'support@foodiehub.com',
        supportPhone: '+251 91 100 0001',
        timezone: 'Africa/Addis_Ababa',
        currency: 'ETB'
      },
      payment: {
        taxRate: 15.0,
        deliveryFee: 80.00,
        minimumOrder: 200.0,
        allowCashOnDelivery: true,
        autoCapturePayments: true
      },
      notifications: {
        emailOnNewOrder: true,
        emailOnCancelledOrder: true,
        smsOnNewOrder: true,
        pushOnDriverAssigned: true,
        dailySummary: true
      }
    }
  });
  console.log('✅ Admin settings initialized');

  console.log('\n🎉 Comprehensive database seeding completed successfully!');
  console.log('───────────────────────────────────────────────────────');
  console.log('Credentials Summary:');
  console.log('  👑 Admin:    admin@foodiehub.com   / Admin@123456');
  console.log('  🛵 Couriers: driver@foodiehub.com  / Driver@123456 (Abebe)');
  console.log('              marcus.driver@foodiehub.com / Driver@123456 (Dawit)');
  console.log('              elena.driver@foodiehub.com  / Driver@123456 (Tigist)');
  console.log('              carlos.driver@foodiehub.com / Driver@123456 (Henok)');
  console.log('  👤 Client:   user@foodiehub.com    / User@123456 (Selamawit)');
  console.log('              david.miller@foodiehub.com  / User@123456 (Tewodros)');
  console.log('              emily.watson@foodiehub.com  / User@123456 (Bethlehem)');
  console.log('───────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
