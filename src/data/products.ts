
export interface Product {
    id: string
    name: string
    price: number
    image: string
    category: 'Tech' | 'Fashion' | 'Beauty' | 'Home' | 'Travel'
    merchant: string
    cashbackRate: number
    description: string
    offers: {
        merchant: string
        price: number
        cashbackRate: number
        link: string
    }[]
}

export const PRODUCTS: Product[] = [
    // --- TECH (Phones, Headphones, Laptops) ---
    {
        id: 'iphone-16-pro-max',
        name: 'iPhone 16 Pro Max 256GB Black Titanium',
        price: 1199,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Apple',
        cashbackRate: 0.03,
        description: 'The ultimate iPhone. Featuring the A18 Pro chip, Camera Control, and a stunning titanium design.',
        offers: [
            { merchant: 'Apple', price: 1199, cashbackRate: 0.03, link: 'https://www.apple.com/iphone' },
            { merchant: 'Amazon', price: 1199, cashbackRate: 0.05, link: 'https://www.amazon.com/s?k=iphone+16' },
            { merchant: 'Best Buy', price: 1199, cashbackRate: 0.02, link: 'https://www.bestbuy.com/' }
        ]
    },
    {
        id: 'samsung-s24-ultra',
        name: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray',
        price: 1419,
        image: 'https://images.unsplash.com/photo-1706606991536-e325d274d5d3?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Samsung',
        cashbackRate: 0.06,
        description: 'Galaxy AI is here. The S24 Ultra sets a new standard for mobile photography and productivity with the Snapdragon 8 Gen 3.',
        offers: [
            { merchant: 'Samsung', price: 1419, cashbackRate: 0.06, link: 'https://www.samsung.com/' },
            { merchant: 'Amazon', price: 1299, cashbackRate: 0.05, link: 'https://www.amazon.com/' },
            { merchant: 'JB Hi-Fi', price: 1419, cashbackRate: 0.03, link: 'https://www.jbhifi.com.au/' }
        ]
    },
    {
        id: 'sony-wh1000xm5',
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling',
        price: 348,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Amazon',
        cashbackRate: 0.05,
        description: 'Industry-leading noise cancellation. Two processors control 8 microphones for unprecedented noise cancellation.',
        offers: [
            { merchant: 'Amazon', price: 348, cashbackRate: 0.05, link: 'https://www.amazon.com/' },
            { merchant: 'Sony Store', price: 399, cashbackRate: 0.04, link: 'https://www.sony.com/' }
        ]
    },
    {
        id: 'macbook-air-m3',
        name: 'MacBook Air 15-inch M3 Chip',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Apple',
        cashbackRate: 0.02,
        description: 'Supercharged by M3. The world’s thinnest 15-inch laptop is now even faster and more power-efficient.',
        offers: [
            { merchant: 'Apple', price: 1299, cashbackRate: 0.02, link: 'https://www.apple.com/macbook-air/' },
            { merchant: 'Amazon', price: 1249, cashbackRate: 0.05, link: 'https://www.amazon.com/' }
        ]
    },
    {
        id: 'ipad-pro-m4',
        name: 'iPad Pro 13-inch (M4)',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Apple',
        cashbackRate: 0.02,
        description: 'The thinnest Apple product ever. Crushing performance with the M4 chip and Ultra Retina XDR display.',
        offers: [
            { merchant: 'Best Buy', price: 1299, cashbackRate: 0.01, link: 'https://www.bestbuy.com/' },
            { merchant: 'Apple', price: 1299, cashbackRate: 0.02, link: 'https://www.apple.com/' },
            { merchant: 'Amazon', price: 1199, cashbackRate: 0.05, link: 'https://www.amazon.com/' }
        ]
    },
    {
        id: 'ps5-slim',
        name: 'PlayStation 5 Slim Console',
        price: 499,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'GameStop',
        cashbackRate: 0.04,
        description: 'The PS5 Slim packs powerful gaming technology into a sleek and compact console design.',
        offers: [
            { merchant: 'GameStop', price: 499, cashbackRate: 0.04, link: 'https://www.gamestop.com/' },
            { merchant: 'Target', price: 499, cashbackRate: 0.02, link: 'https://www.target.com/' },
            { merchant: 'Amazon', price: 499, cashbackRate: 0.05, link: 'https://www.amazon.com/' }
        ]
    },
    {
        id: 'switch-oled',
        name: 'Nintendo Switch - OLED Model',
        price: 349,
        image: 'https://images.unsplash.com/photo-1578632749014-ca77efd052eb?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Nintendo',
        cashbackRate: 0.01,
        description: 'Feast your eyes on vivid colors and crisp contrast when you play on-the-go with the OLED model.',
        offers: [
            { merchant: 'Nintendo', price: 349, cashbackRate: 0.01, link: 'https://www.nintendo.com/' },
            { merchant: 'Amazon', price: 349, cashbackRate: 0.05, link: 'https://www.amazon.com/' },
            { merchant: 'Best Buy', price: 349, cashbackRate: 0.03, link: 'https://www.bestbuy.com/' }
        ]
    },
    {
        id: 'camera-canon-r6-ii',
        name: 'Canon EOS R6 Mark II',
        price: 2499,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Canon',
        cashbackRate: 0.03,
        description: 'Never miss a moment. High-speed continuous shooting of up to 40 fps and advanced subject detection.',
        offers: [
            { merchant: 'Canon', price: 2499, cashbackRate: 0.03, link: 'https://www.usa.canon.com/' },
            { merchant: 'B&H', price: 2399, cashbackRate: 0.02, link: 'https://www.bhphotovideo.com/' }
        ]
    },
    {
        id: 'kindle-scribe',
        name: 'Kindle Scribe',
        price: 339,
        image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Amazon',
        cashbackRate: 0.08,
        description: 'Read and write on the world’s best 10.2” 300 ppi Paperwhite display.',
        offers: [
            { merchant: 'Amazon', price: 339, cashbackRate: 0.08, link: 'https://www.amazon.com/' },
            { merchant: 'Target', price: 339, cashbackRate: 0.02, link: 'https://www.target.com/' }
        ]
    },
    // --- FASHION (Shoes, Clothing, Bags) ---
    {
        id: 'nike-air-max-dn',
        name: 'Nike Air Max Dn',
        price: 160,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
        merchant: 'Nike',
        cashbackRate: 0.10,
        description: 'Feel the unreal. Our new Dynamic Air unit system delivers an energizing sensation with every step.',
        offers: [
            { merchant: 'Nike', price: 160, cashbackRate: 0.10, link: 'https://www.nike.com/' },
            { merchant: 'Foot Locker', price: 160, cashbackRate: 0.05, link: 'https://www.footlocker.com/' },
            { merchant: 'JD Sports', price: 160, cashbackRate: 0.06, link: 'https://www.jdsports.com/' }
        ]
    },
    {
        id: 'new-balance-1906r',
        name: 'New Balance 1906R Silver Metallic',
        price: 155,
        image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
        merchant: 'New Balance',
        cashbackRate: 0.08,
        description: 'A 2000s running shoe reissued for the modern era. ABZORB and N-ergy cushioning for responsive comfort.',
        offers: [
            { merchant: 'New Balance', price: 155, cashbackRate: 0.08, link: 'https://www.newbalance.com/' },
            { merchant: 'The Iconic', price: 160, cashbackRate: 0.12, link: 'https://www.theiconic.com.au/' },
            { merchant: 'ASOS', price: 155, cashbackRate: 0.05, link: 'https://www.asos.com/' }
        ]
    },
    {
        id: 'adidas-samba-decon',
        name: 'adidas Samba Decon',
        price: 150,
        image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
        merchant: 'adidas',
        cashbackRate: 0.10,
        description: 'A deconstructed, lighter version of the icon. Premium leather and a collapsible heel for versatile style.',
        offers: [
            { merchant: 'adidas', price: 150, cashbackRate: 0.10, link: 'https://www.adidas.com/' },
            { merchant: 'Nordstrom', price: 150, cashbackRate: 0.06, link: 'https://www.nordstrom.com/' }
        ]
    },
    {
        id: 'dr-martens-jadon',
        name: 'Dr. Martens Jadon Platform Boots',
        price: 210,
        image: 'https://images.unsplash.com/photo-1628253747716-0c4f5c90fdda?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
        merchant: 'Dr. Martens',
        cashbackRate: 0.07,
        description: 'A full-volume evolution of our original silhouette. Standing on a 2 inch Quad Retro sole.',
        offers: [
            { merchant: 'Dr. Martens', price: 210, cashbackRate: 0.07, link: 'https://www.drmartens.com/' },
            { merchant: 'ASOS', price: 210, cashbackRate: 0.05, link: 'https://www.asos.com/' }
        ]
    },
    {
        id: 'levi-501-90s',
        name: 'Levi\'s 501 \'90s Women\'s Jeans',
        price: 98,
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
        merchant: 'Levi\'s',
        cashbackRate: 0.09,
        description: 'A vintage-inspired fit with a mid-rise and just the right amount of bagginess in the leg.',
        offers: [
            { merchant: 'Levi\'s', price: 98, cashbackRate: 0.09, link: 'https://www.levi.com/' },
            { merchant: 'Macy\'s', price: 98, cashbackRate: 0.05, link: 'https://www.macys.com/' }
        ]
    },
    {
        id: 'patagonia-nano-puff',
        name: 'Patagonia Nano Puff Jacket',
        price: 239,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
        merchant: 'Patagonia',
        cashbackRate: 0.05,
        description: 'Warm, windproof, water-resistant—the Nano Puff® Jacket uses incredibly lightweight and highly compressible Eco insulation.',
        offers: [
            { merchant: 'Patagonia', price: 239, cashbackRate: 0.05, link: 'https://www.patagonia.com/' },
            { merchant: 'REI', price: 239, cashbackRate: 0.04, link: 'https://www.rei.com/' }
        ]
    },
    {
        id: 'lululemon-scuba-hoodie',
        name: 'Lululemon Scuba Oversized Half-Zip',
        price: 118,
        image: 'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
        merchant: 'Lululemon',
        cashbackRate: 0.04,
        description: 'With an oversized fit and the soft, cozy fabric you love, this new half-zip Scuba silhouette keeps your post-practice comfort at its peak.',
        offers: [
            { merchant: 'Lululemon', price: 118, cashbackRate: 0.04, link: 'https://shop.lululemon.com/' }
        ]
    },
    {
        id: 'rayban-meta-smart',
        name: 'Ray-Ban Meta Smart Glasses',
        price: 299,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
        merchant: 'Ray-Ban',
        cashbackRate: 0.08,
        description: 'The next generation of smart glasses. Capture, share, and listen, all while staying present in the moment.',
        offers: [
            { merchant: 'Ray-Ban', price: 299, cashbackRate: 0.08, link: 'https://www.ray-ban.com/' },
            { merchant: 'Amazon', price: 299, cashbackRate: 0.05, link: 'https://www.amazon.com/' }
        ]
    },
    {
        id: 'herschel-kaslo',
        name: 'Herschel Kaslo Backpack Tech',
        price: 130,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
        merchant: 'Herschel',
        cashbackRate: 0.06,
        description: 'Designed for the daily commute. The Kaslo Backpack Tech features a separate laptop compartment and trolley sleeve.',
        offers: [
            { merchant: 'Herschel', price: 130, cashbackRate: 0.06, link: 'https://herschel.com/' },
            { merchant: 'Amazon', price: 110, cashbackRate: 0.05, link: 'https://www.amazon.com/' }
        ]
    },

    // --- BEAUTY (Skincare, Makeup) ---
    {
        id: 'dyson-airstrait',
        name: 'Dyson Airstrait Straightener',
        price: 499,
        image: 'https://images.unsplash.com/photo-1623945033703-a1c97a892701?auto=format&fit=crop&w=800&q=80',
        category: 'Beauty',
        merchant: 'Dyson',
        cashbackRate: 0.04,
        description: 'Wet to dry straightening, with air. No hot plates. No heat damage. Simplified routine.',
        offers: [
            { merchant: 'Dyson', price: 499, cashbackRate: 0.04, link: 'https://www.dyson.com/' },
            { merchant: 'Sephora', price: 499, cashbackRate: 0.05, link: 'https://www.sephora.com/' },
            { merchant: 'Ulta', price: 499, cashbackRate: 0.03, link: 'https://www.ulta.com/' }
        ]
    },
    {
        id: 'sol-de-janeiro-bum-bum',
        name: 'Sol de Janeiro Brazilian Bum Bum Cream',
        price: 48,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        category: 'Beauty',
        merchant: 'Sephora',
        cashbackRate: 0.05,
        description: 'A fast-absorbing body cream with an addictive scent and a visibly tightening, smoothing formula.',
        offers: [
            { merchant: 'Sephora', price: 48, cashbackRate: 0.05, link: 'https://www.sephora.com/' },
            { merchant: 'Sol de Janeiro', price: 48, cashbackRate: 0.06, link: 'https://soldejaneiro.com/' }
        ]
    },
    {
        id: 'rare-beauty-blush',
        name: 'Rare Beauty Soft Pinch Liquid Blush',
        price: 23,
        image: 'https://images.unsplash.com/photo-1631730486784-5456119f69ae?auto=format&fit=crop&w=800&q=80',
        category: 'Beauty',
        merchant: 'Sephora',
        cashbackRate: 0.05,
        description: 'A weightless, long-lasting liquid blush that blends and builds beautifully for a soft, healthy flush.',
        offers: [
            { merchant: 'Sephora', price: 23, cashbackRate: 0.05, link: 'https://www.sephora.com/' },
            { merchant: 'Rare Beauty', price: 23, cashbackRate: 0.04, link: 'https://www.rarebeauty.com/' }
        ]
    },
    {
        id: 'laneige-lip-mask',
        name: 'Laneige Lip Sleeping Mask',
        price: 24,
        image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=800&q=80',
        category: 'Beauty',
        merchant: 'Sephora',
        cashbackRate: 0.05,
        description: 'A leave-on lip mask that delivers intense moisture and antioxidants while you sleep.',
        offers: [
            { merchant: 'Sephora', price: 24, cashbackRate: 0.05, link: 'https://www.sephora.com/' },
            { merchant: 'Amazon', price: 24, cashbackRate: 0.05, link: 'https://www.amazon.com/' }
        ]
    },
    {
        id: 'fenty-skin-tint',
        name: 'Fenty Beauty Eaze Drop Blurring Skin Tint',
        price: 35,
        image: 'https://images.unsplash.com/photo-1631730486784-5456119f69ae?auto=format&fit=crop&w=800&q=80',
        category: 'Beauty',
        merchant: 'Fenty Beauty',
        cashbackRate: 0.06,
        description: 'A blurring skin tint that delivers smooth, instantly blurred skin in just a few easy drops.',
        offers: [
            { merchant: 'Fenty Beauty', price: 35, cashbackRate: 0.06, link: 'https://fentybeauty.com/' },
            { merchant: 'Sephora', price: 35, cashbackRate: 0.05, link: 'https://www.sephora.com/' }
        ]
    },
    {
        id: 'chanel-coco-mademoiselle',
        name: 'CHANEL Coco Mademoiselle Eau de Parfum',
        price: 172,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
        category: 'Beauty',
        merchant: 'Nordstrom',
        cashbackRate: 0.06,
        description: 'Irresistibly sexy, irrepressibly spirited. A sparkling Amber fragrance that recalls a daring young Coco Chanel.',
        offers: [
            { merchant: 'Nordstrom', price: 172, cashbackRate: 0.06, link: 'https://www.nordstrom.com/' },
            { merchant: 'Macy\'s', price: 172, cashbackRate: 0.08, link: 'https://www.macys.com/' }
        ]
    },

    // --- HOME (Appliances, Decor) ---
    {
        id: 'ninja-creami',
        name: 'Ninja CREAMi Ice Cream Maker',
        price: 199,
        image: 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&w=800&q=80',
        category: 'Home',
        merchant: 'Ninja',
        cashbackRate: 0.05,
        description: 'Turn almost anything into ice cream, sorbet, milkshakes, and more. Create completely customizable treats.',
        offers: [
            { merchant: 'Ninja Kitchen', price: 199, cashbackRate: 0.05, link: 'https://www.ninjakitchen.com/' },
            { merchant: 'Amazon', price: 179, cashbackRate: 0.05, link: 'https://www.amazon.com/' },
            { merchant: 'Target', price: 199, cashbackRate: 0.02, link: 'https://www.target.com/' }
        ]
    },
    {
        id: 'vitamix-a3500',
        name: 'Vitamix A3500 Ascent Series Blender',
        price: 649,
        image: 'https://images.unsplash.com/photo-1570222094114-28a9d8894b74?auto=format&fit=crop&w=800&q=80',
        category: 'Home',
        merchant: 'Vitamix',
        cashbackRate: 0.04,
        description: 'Five program settings (for Smoothies, Hot Soups, Dips & Spreads, Frozen Desserts, and Self-Cleaning) ensure walk-away convenience.',
        offers: [
            { merchant: 'Vitamix', price: 649, cashbackRate: 0.04, link: 'https://www.vitamix.com/' },
            { merchant: 'Amazon', price: 620, cashbackRate: 0.05, link: 'https://www.amazon.com/' }
        ]
    },
    {
        id: 'breville-barista-touch',
        name: 'Breville Barista Touch Impress',
        price: 1499,
        image: 'https://images.unsplash.com/photo-1517604931442-71053e1e2c50?auto=format&fit=crop&w=800&q=80',
        category: 'Home',
        merchant: 'Breville',
        cashbackRate: 0.03,
        description: 'Swipe, select, and enjoy. Now with the Impress™ Puck System for the perfect dose and tamp every time.',
        offers: [
            { merchant: 'Breville', price: 1499, cashbackRate: 0.03, link: 'https://www.breville.com/' },
            { merchant: 'Amazon', price: 1499, cashbackRate: 0.05, link: 'https://www.amazon.com/' }
        ]
    },
    {
        id: 'roborock-s8-maxv',
        name: 'Roborock S8 MaxV Ultra',
        price: 1799,
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        category: 'Home',
        merchant: 'Roborock',
        cashbackRate: 0.03,
        description: 'Corner-to-edge cleaning technology. The smartest, most powerful robot vacuum we’ve ever built.',
        offers: [
            { merchant: 'Roborock', price: 1799, cashbackRate: 0.03, link: 'https://us.roborock.com/' },
            { merchant: 'Amazon', price: 1799, cashbackRate: 0.05, link: 'https://www.amazon.com/' }
        ]
    },
    {
        id: 'herman-miller-embody',
        name: 'Herman Miller Embody Chair',
        price: 1895,
        image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80',
        category: 'Home',
        merchant: 'Herman Miller',
        cashbackRate: 0.03,
        description: 'Designed specifically for people who work or game for hours at a time. Embody promotes health and keeps you focused.',
        offers: [
            { merchant: 'Herman Miller', price: 1895, cashbackRate: 0.03, link: 'https://store.hermanmiller.com/' },
            { merchant: 'Design Within Reach', price: 1895, cashbackRate: 0.02, link: 'https://www.dwr.com/' }
        ]
    },

    // --- TRAVEL (Luggage, Accessories) ---
    {
        id: 'rimowa-hybrid-cabin',
        name: 'Rimowa Hybrid Cabin',
        price: 1150,
        image: 'https://images.unsplash.com/photo-1565026057447-bc804a15a8d7?auto=format&fit=crop&w=800&q=80',
        category: 'Travel',
        merchant: 'Rimowa',
        cashbackRate: 0.02,
        description: 'The best of both worlds. A unique combination of aluminium-magnesium alloy and ultra-lightweight polycarbonate.',
        offers: [
            { merchant: 'Rimowa', price: 1150, cashbackRate: 0.02, link: 'https://www.rimowa.com/' }
        ]
    },
    {
        id: 'sony-a7r-v',
        name: 'Sony Alpha 7R V',
        price: 3898,
        image: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Amazon',
        cashbackRate: 0.05,
        description: 'A new era of resolution. 61.0 MP full-frame Exmor R™ CMOS sensor with next-generation AI processing.',
        offers: [
            { merchant: 'Amazon', price: 3898, cashbackRate: 0.05, link: 'https://www.amazon.com/' },
            { merchant: 'B&H', price: 3898, cashbackRate: 0.02, link: 'https://www.bhphotovideo.com/' }
        ]
    },
    {
        id: 'dji-neo',
        name: 'DJI Neo Drone',
        price: 199,
        image: 'https://images.unsplash.com/photo-1588483977959-58b385f91759?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'DJI',
        cashbackRate: 0.03,
        description: 'DJI\'s lightest and most compact drone ever. Palm takeoff and landing. AI subject tracking. 4K ultra-stabilized video.',
        offers: [
            { merchant: 'DJI', price: 199, cashbackRate: 0.03, link: 'https://www.dji.com/' },
            { merchant: 'Amazon', price: 199, cashbackRate: 0.05, link: 'https://www.amazon.com/' }
        ]
    },
    {
        id: 'steam-deck-2',
        name: 'Steam Deck 2 OLED',
        price: 549,
        image: 'https://images.unsplash.com/photo-1697635565554-7933b9aa5299?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Valve',
        cashbackRate: 0.02,
        description: 'The next generation of handheld gaming. Featuring a 90Hz OLED screen, longer battery life, and faster downloads.',
        offers: [
            { merchant: 'Steam', price: 549, cashbackRate: 0.02, link: 'https://store.steampowered.com/' }
        ]
    },
    {
        id: 'sonos-era-300',
        name: 'Sonos Era 300 Smart Speaker',
        price: 449,
        image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Sonos',
        cashbackRate: 0.08,
        description: 'With next-level audio that hits from every direction, the Era 300 doesn’t just surround you, it puts you inside the music.',
        offers: [
            { merchant: 'Sonos', price: 449, cashbackRate: 0.08, link: 'https://www.sonos.com/' },
            { merchant: 'Best Buy', price: 449, cashbackRate: 0.04, link: 'https://www.bestbuy.com/' }
        ]
    },
    {
        id: 'on-cloudmonster',
        name: 'On Cloudmonster 2',
        price: 180,
        image: 'https://images.unsplash.com/photo-1628253747716-0c4f5c90fdda?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
        merchant: 'On Running',
        cashbackRate: 0.10,
        description: 'Monster CloudTec® for a massive sensation. The biggest Cloud elements ever meet an ultra-powerful Speedboard®.',
        offers: [
            { merchant: 'On', price: 180, cashbackRate: 0.10, link: 'https://www.on-running.com/' },
            { merchant: 'Dick\'s SG', price: 180, cashbackRate: 0.05, link: 'https://www.dickssportinggoods.com/' }
        ]
    },
    {
        id: 'oura-ring-4',
        name: 'Oura Ring 4 Titanium',
        price: 349,
        image: 'https://images.unsplash.com/photo-1618453292453-e3e78440787e?auto=format&fit=crop&w=800&q=80',
        category: 'Tech',
        merchant: 'Oura',
        cashbackRate: 0.05,
        description: 'Smart titanium ring for monitoring sleep, readiness, and activity. New sleeker design with undetectable sensors.',
        offers: [
            { merchant: 'Oura', price: 349, cashbackRate: 0.05, link: 'https://ouraring.com/' }
        ]
    },
    {
        id: 'monos-carry-on',
        name: 'Monos Carry-On Pro Plus',
        price: 295,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        category: 'Travel',
        merchant: 'Monos',
        cashbackRate: 0.08,
        description: 'Featuring a built-in front compartment for easy access to your laptop, passport, and other essentials.',
        offers: [
            { merchant: 'Monos', price: 295, cashbackRate: 0.08, link: 'https://monos.com/' }
        ]
    }
]

// --- BOUNTIES (Bank & Signup Bonuses) ---
export const BOUNTIES: any[] = [
    {
        id: '1',
        title: 'ING Bank',
        description: 'Open Orange Everyday + Deposit $1000',
        reward_amount: 7500,
        difficulty: 'EASY',
        steps: ['Open account', 'Deposit $1000', 'Make 5 txns'],
        link: 'https://ing.com.au',
        is_pro_exclusive: false
    },
    {
        id: '2',
        title: 'Moomoo Trading',
        description: 'Deposit $2000 & hold for 30 days',
        reward_amount: 5000,
        difficulty: 'MEDIUM',
        steps: ['Register', 'Deposit funds', 'Get free stock'],
        link: 'https://moomoo.com',
        is_pro_exclusive: true
    }
]

// --- GLITCHES (Price Errors) ---
export const GLITCHES: any[] = [
    {
        id: '1',
        title: 'Sony WH-1000XM5',
        description: 'Price error at Officeworks',
        original_price: 549,
        glitch_price: 129,
        retailer: 'Officeworks',
        link: '#',
        found_at: { seconds: Date.now() / 1000, nanoseconds: 0 },
        is_active: true
    },
    {
        id: '2',
        title: 'Dyson Airwrap',
        description: 'Mispriced bundle',
        original_price: 899,
        glitch_price: 450,
        retailer: 'Myer',
        link: '#',
        found_at: { seconds: Date.now() / 1000, nanoseconds: 0 },
        is_active: true
    }
]

// --- BOOST OFFERS (Timed Exclusive Rates) ---

export interface Boost {
    id: string
    merchant: string
    rate: number
    endsIn: number // Hours remaining
    color: string
    textColor: string
    logo?: string
}

export const BOOSTS: Boost[] = [
    {
        id: 'boost-iconic',
        merchant: 'The Iconic',
        rate: 0.15,
        endsIn: 4,
        color: 'bg-[#ff5588]',
        textColor: 'text-white'
    },
    {
        id: 'boost-myer',
        merchant: 'Myer',
        rate: 0.10,
        endsIn: 6,
        color: 'bg-black',
        textColor: 'text-white'
    },
    {
        id: 'boost-amazon',
        merchant: 'Amazon',
        rate: 0.12,
        endsIn: 2,
        color: 'bg-[#FF9900]',
        textColor: 'text-gray-900'
    },
    {
        id: 'boost-sephora',
        merchant: 'Sephora',
        rate: 0.08,
        endsIn: 12,
        color: 'bg-gray-900',
        textColor: 'text-white'
    },
    {
        id: 'boost-chemist',
        merchant: 'Chemist Warehouse',
        rate: 0.05,
        endsIn: 8,
        color: 'bg-[#005DAA]',
        textColor: 'text-white'
    }
]
