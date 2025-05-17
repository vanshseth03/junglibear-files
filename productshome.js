
// const products = [
//   {
//     id: 1,
//     title: "Elegant Glass Water Bottle",
//     price: 299,
//     description: "A beautifully designed glass water bottle with a bamboo lid. Perfect for home or office use. Keeps beverages hot or cold for hours.",
//     category: "kitchen",
//     inStock: true,
//     images: [
//       "https://images.unsplash.com/photo-1610631787813-9eeb1a2386cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
//       "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
//       "https://images.unsplash.com/photo-1578880051117-6e2c9e2e3674?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"
//     ]
//   },
//   {
//     id: 2,
//     title: "Minimalist Wall Clock",
//     price: 499,
//     description: "A sleek, minimalist wall clock with Japanese quartz movement. The perfect accent piece for any modern home or office.",
//     category: "decor",
//     inStock: true,
//     images: [
//       "https://images.unsplash.com/photo-1594387389288-396d889e019b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
//       "https://images.unsplash.com/photo-1550854535-a4451ec0b1ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
//       "https://images.unsplash.com/photo-1543059058-209ef057debb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"
//     ]
//   },
//   {
//     id: 3,
//     title: "Bamboo Kitchen Utensil Set",
//     price: 349,
//     description: "A complete set of 6 eco-friendly bamboo kitchen utensils with a matching holder. Durable, heat-resistant, and non-scratch.",
//     category: "kitchen",
//     inStock: true,
//     images: ["https://images.unsplash.com/photo-1612139270299-3dd349c19f33?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"]
//   },
//   {
//     id: 4,
//     title: "Decorative Throw Pillow Covers",
//     price: 249,
//     description: "Set of 2 cotton linen decorative throw pillow covers with modern geometric patterns. Available in multiple colors.",
//     category: "decor",
//     inStock: true,
//     images: ["https://images.unsplash.com/photo-1585412459212-8def26f7208c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"]
//   },
//   {
//     id: 5,
//     title: "Ceramic Planter with Wooden Stand",
//     price: 399,
//     description: "A beautiful ceramic planter with a sturdy wooden stand. Perfect for indoor plants and home décor.",
//     category: "decor",
//     inStock: false,
//     images: [
//       "https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
//       "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
//       "https://images.unsplash.com/photo-1463320898484-cdee8141c787?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"
//     ]
//   },
//   {
//     id: 6,
//     title: "Stainless Steel Measuring Cups",
//     price: 199,
//     description: "Set of 6 stainless steel measuring cups with engraved measurements. Dishwasher safe and built to last.",
//     category: "kitchen",
//     inStock: true,
//     images: ["https://images.unsplash.com/photo-1625944525873-504024e72265?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"]
//   },
//   {
//     id: 7,
//     title: "Organic Cotton Bath Towels",
//     price: 449,
//     description: "Set of 2 large organic cotton bath towels. Super soft, absorbent, and eco-friendly. Available in multiple colors.",
//     category: "bathroom",
//     inStock: true,
//     images: ["https://images.unsplash.com/photo-1626806787461-102c1a7f1c62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"]
//   },
//   {
//     id: 8,
//     title: "Decorative Wall Clock",
//     price: 349,
//     description: "A stylish decorative wall clock with a rustic design. Perfect for adding character to any room.",
//     category: "decor",
//     inStock: true,
//     images: [
//       "https://images.unsplash.com/photo-1581349485608-9469926a8e5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
//       "https://images.unsplash.com/photo-1557139355-453559ab725f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
//       "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"
//     ]
//   },
//   {
//     id: 9,
//     title: "LED Desk Lamp",
//     price: 299,
//     description: "An adjustable LED desk lamp with multiple brightness settings and a USB charging port. Energy-efficient and modern design.",
//     category: "lighting",
//     inStock: true,
//     images: ["https://images.unsplash.com/photo-1534073828943-f801091bb18e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"]
//   },
//   {
//     id: 10,
//     title: "Luxury Scented Candle",
//     price: 199,
//     description: "A long-lasting scented candle in a beautiful glass jar. Choose from multiple fragrances to create the perfect ambiance.",
//     category: "decor",
//     inStock: true,
//     images: ["https://images.unsplash.com/photo-1512207849709-d7b503a9061b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"]
//   },
//   {
//     id: 11,
//     title: "Wooden Cutting Board",
//     price: 349,
//     description: "A premium acacia wood cutting board with juice groove and handles. Perfect for food prep and serving.",
//     category: "kitchen",
//     inStock: true,
//     images: ["https://images.unsplash.com/photo-1544441892-794166f1e3be?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"]
//   },
//   {
//     id: 12,
//     title: "Cotton Bed Sheets Set",
//     price: 599,
//     description: "Premium 100% cotton bed sheet set including flat sheet, fitted sheet, and two pillowcases. Soft, breathable, and comfortable.",
//     category: "bedroom",
//     inStock: true,
//     images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500"]
//   }
// ];

// // Carousel items data
// const carouselItems = [
//   {
//     id: 1,
//     image: "https://pixabay.com/get/gcaa083d907b71d0db2bd759abcd2aa4c7ada86710258fe90a456b1f3dbc9f102d30f03e7f99eda0eeda489a0d36861283be4fe2434ed8111d11e999c4612b1c1_1280.jpg",
//     title: "Special Offer!",
//     subtitle: "Elegant Glass Water Bottle",
//     productId: 1
//   },
//   {
//     id: 2,
//     image: "https://images.unsplash.com/photo-1585412459212-8def26f7208c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
//     title: "New Arrival",
//     subtitle: "Decorative Throw Pillow Covers",
//     productId: 4
//   },
//   {
//     id: 3,
//     image: "https://images.unsplash.com/photo-1581349485608-9469926a8e5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500",
//     title: "Limited Edition",
//     subtitle: "Decorative Wall Clock",
//     productId: 8
//   }
// ];