import { Category } from '../models/Category.js';
import { MenuItem } from '../models/MenuItem.js';

export const defaultCategoriesData = [
  {
    name: 'Artisanal Coffee',
    slug: 'artisanal-coffee',
    description: 'Single-origin estate beans roasted to perfection, brewed with precision.',
    displayOrder: 1,
  },
  {
    name: 'Handcrafted Teas',
    slug: 'handcrafted-teas',
    description: 'Rare single-estate leaves, Kashmiri infusions, and vibrant matcha.',
    displayOrder: 2,
  },
  {
    name: 'Sourdough & Toasts',
    slug: 'sourdough-and-toasts',
    description: '36-hour slow-fermented organic sourdough with gourmet toppings.',
    displayOrder: 3,
  },
  {
    name: 'Gourmet Small Plates',
    slug: 'gourmet-small-plates',
    description: 'Chef-crafted appetizers, mezze plates, and savory bites.',
    displayOrder: 4,
  },
  {
    name: 'Fresh Bakery & Desserts',
    slug: 'bakery-and-desserts',
    description: 'Flaky viennoiserie, French pastries, and artisanal dark chocolate delights.',
    displayOrder: 5,
  },
];

export const defaultMenuItemsData = [
  // Artisanal Coffee
  {
    _id: '65f011111111111111110001',
    name: 'Chikmagalur Pour Over (V60)',
    categorySlug: 'artisanal-coffee',
    description: 'Medium roast single estate Arabica with notes of dark cocoa, dried cranberry, and roasted hazelnut.',
    price: 240,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
  },
  {
    _id: '65f011111111111111110002',
    name: 'Signature Flat White',
    categorySlug: 'artisanal-coffee',
    description: 'Double shot of velvety espresso layered with silky micro-foamed whole milk.',
    price: 220,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600',
  },
  {
    _id: '65f011111111111111110003',
    name: 'Iced Spanish Latte',
    categorySlug: 'artisanal-coffee',
    description: 'Rich espresso poured over condensed milk, chilled milk, and crushed ice.',
    price: 260,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
  },
  {
    _id: '65f011111111111111110004',
    name: 'Cold Brew Tonic & Citrus',
    categorySlug: 'artisanal-coffee',
    description: '18-hour slow steeped cold brew poured over sparkling tonic and fresh orange zest.',
    price: 250,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600',
  },

  // Handcrafted Teas
  {
    _id: '65f011111111111111110005',
    name: 'Darjeeling First Flush (Spring Pick)',
    categorySlug: 'handcrafted-teas',
    description: 'Delicate amber liquor with floral muscatel aroma and subtle astringency.',
    price: 210,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
  },
  {
    _id: '65f011111111111111110006',
    name: 'Kashmiri Saffron Kahwa',
    categorySlug: 'handcrafted-teas',
    description: 'Traditional green tea infused with whole saffron strands, crushed green cardamom, cinnamon, and slivered almonds.',
    price: 230,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600',
  },
  {
    _id: '65f011111111111111110007',
    name: 'Ceremonial Uji Matcha Latte',
    categorySlug: 'handcrafted-teas',
    description: 'Stone-ground ceremonial grade Japanese matcha whisked with oat or almond milk.',
    price: 280,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600',
  },

  // Sourdough & Toasts
  {
    _id: '65f011111111111111110008',
    name: 'Avocado & Truffle Mushroom Sourdough',
    categorySlug: 'sourdough-and-toasts',
    description: 'Hass avocado mash, sautéed wild mushrooms, white truffle oil, and toasted pumpkin seeds on crusty sourdough.',
    price: 360,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
  },
  {
    _id: '65f011111111111111110009',
    name: 'Burrata & Heirloom Tomato Tartine',
    categorySlug: 'sourdough-and-toasts',
    description: 'Creamy fresh burrata, marinated heirloom tomatoes, basil pesto drizzle, and aged balsamic glaze.',
    price: 390,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600',
  },

  // Gourmet Small Plates
  {
    _id: '65f011111111111111110010',
    name: 'Crispy Falafel & Mezze Board',
    categorySlug: 'gourmet-small-plates',
    description: 'Herb-crusted falafels served with smoked paprika hummus, beetroot mutabbal, pickled turnips, and warm pita.',
    price: 340,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600',
  },
  {
    _id: '65f011111111111111110011',
    name: 'Parmesan Herb Truffle Fries',
    categorySlug: 'gourmet-small-plates',
    description: 'Hand-cut russet fries tossed in aromatic truffle essence, fresh parsley, and aged Grana Padano.',
    price: 260,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600',
  },

  // Bakery & Desserts
  {
    _id: '65f011111111111111110012',
    name: 'French Butter Croissant',
    categorySlug: 'bakery-and-desserts',
    description: '27-layer laminated French butter croissant, golden baked and shatteringly crisp.',
    price: 180,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
  },
  {
    _id: '65f011111111111111110013',
    name: 'Belgian Dark Chocolate Ganache Tart',
    categorySlug: 'bakery-and-desserts',
    description: '70% single origin Callebaut dark chocolate silk ganache in a crisp sablé shell with Maldon sea salt.',
    price: 290,
    taxPercent: 5,
    isVegetarian: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=600',
  },
];

export const seedInitialMenu = async () => {
  const categoryCount = await Category.countDocuments();
  if (categoryCount > 0) {
    return;
  }

  console.log('[Seed] Seeding initial categories and menu items...');
  const createdCategories = await Category.insertMany(defaultCategoriesData);
  const catMap = {};
  createdCategories.forEach((c) => {
    catMap[c.slug] = c._id;
  });

  const menuItemsToInsert = defaultMenuItemsData.map((item) => {
    const { _id, categorySlug, ...rest } = item;
    return {
      ...rest,
      categoryId: catMap[categorySlug],
    };
  });

  await MenuItem.insertMany(menuItemsToInsert);
  console.log('[Seed] Menu seed successfully completed!');
};
