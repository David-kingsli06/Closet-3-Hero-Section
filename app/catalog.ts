export type Variant = {
  id: number;
  a: boolean; // availability
  o: string[]; // options e.g. ["M", "US 9"]
};

export type CatalogItem = {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  sizes: string[];
  variants: Variant[];
  url: string;
  width?: number;
  height?: number;
  sheetHeight?: number;
};

export type Look = {
  name: string;
  description: string;
  model640: string;
  model1080: string;
  original: string;
  products: string[];
  pins: {
    productName: string;
    x: number; // percentage (e.g. 47)
    y: number; // percentage (e.g. 27)
    pinNumber: number; // 1, 2, 3
  }[];
  newProduct?: string; // product name that carries 'New' tag
};

export type Catalog = {
  source: string;
  looks: Look[];
  items: CatalogItem[];
};

export const CATALOG: Catalog = {
  source: "https://reel-ref-try-the-look.vercel.app/native-catalog.json",
  items: [
    {
      id: "air-jordan-12-retro",
      name: "Air Jordan 12 Retro",
      type: "Men's Shoes",
      price: 149.0,
      image: "https://reel-ref-try-the-look.vercel.app/assets/source-tatum-5-orbit-copy.webp",
      sizes: ["US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 12"],
      variants: [
        { id: 4901, a: true, o: ["US 8"] },
        { id: 4902, a: true, o: ["US 8.5"] },
        { id: 4903, a: true, o: ["US 9"] },
        { id: 4904, a: true, o: ["US 9.5"] },
        { id: 4905, a: true, o: ["US 10"] },
        { id: 4906, a: true, o: ["US 10.5"] },
        { id: 4907, a: true, o: ["US 11"] },
        { id: 4908, a: false, o: ["US 12"] },
      ],
      url: "https://nike-makknzjs.myshopify.com/products/air-jordan-12-retro",
      width: 400,
      height: 400,
      sheetHeight: 160,
    },
    {
      id: "tatum-5-orbit",
      name: "Tatum 5 Orbit",
      type: "Basketball Shoes",
      price: 149.0,
      image: "https://reel-ref-try-the-look.vercel.app/assets/source-tatum-5-orbit.webp",
      sizes: ["US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11"],
      variants: [
        { id: 4911, a: true, o: ["US 8"] },
        { id: 4912, a: true, o: ["US 8.5"] },
        { id: 4913, a: true, o: ["US 9"] },
        { id: 4914, a: true, o: ["US 9.5"] },
        { id: 4915, a: true, o: ["US 10"] },
        { id: 4916, a: true, o: ["US 10.5"] },
        { id: 4917, a: true, o: ["US 11"] },
      ],
      url: "https://nike-makknzjs.myshopify.com/products/tatum-5-orbit",
      width: 400,
      height: 400,
      sheetHeight: 160,
    },
    {
      id: "luka-5",
      name: "Luka 5",
      type: "Basketball Shoes",
      price: 149.0,
      image: "https://reel-ref-try-the-look.vercel.app/assets/source-air-jordan-12-retro-copy.webp",
      sizes: ["US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11"],
      variants: [
        { id: 4921, a: true, o: ["US 8"] },
        { id: 4922, a: true, o: ["US 8.5"] },
        { id: 4923, a: true, o: ["US 9"] },
        { id: 4924, a: true, o: ["US 9.5"] },
        { id: 4925, a: true, o: ["US 10"] },
        { id: 4926, a: true, o: ["US 10.5"] },
        { id: 4927, a: true, o: ["US 11"] },
      ],
      url: "https://nike-makknzjs.myshopify.com/products/luka-5",
      width: 400,
      height: 400,
      sheetHeight: 160,
    },
    {
      id: "tshirt",
      name: "Tshirt",
      type: "Men's T-Shirt",
      price: 199.0,
      image: "https://reel-ref-try-the-look.vercel.app/assets/source-tshirt.webp",
      sizes: ["S", "M", "L", "XL", "2XL"],
      variants: [
        { id: 4931, a: true, o: ["S"] },
        { id: 4932, a: true, o: ["M"] },
        { id: 4933, a: true, o: ["L"] },
        { id: 4934, a: true, o: ["XL"] },
        { id: 4935, a: true, o: ["2XL"] },
      ],
      url: "https://nike-makknzjs.myshopify.com/products/tshirt",
      width: 400,
      height: 563,
      sheetHeight: 225,
    },
    {
      id: "sweatshirt",
      name: "Sweatshirt",
      type: "Men's Crewneck Sweatshirt",
      price: 199.0,
      image: "https://reel-ref-try-the-look.vercel.app/assets/source-sweatshirt.webp",
      sizes: ["S", "M", "L", "XL"],
      variants: [
        { id: 4941, a: true, o: ["S"] },
        { id: 4942, a: true, o: ["M"] },
        { id: 4943, a: true, o: ["L"] },
        { id: 4944, a: true, o: ["XL"] },
      ],
      url: "https://nike-makknzjs.myshopify.com/products/sweatshirt",
      width: 400,
      height: 581,
      sheetHeight: 232,
    },
    {
      id: "sweatshirt-plus",
      name: "Sweatshirt Plus",
      type: "Men's Premium Sweatshirt",
      price: 199.0,
      image: "https://reel-ref-try-the-look.vercel.app/assets/source-sweatshirt-plus.webp",
      sizes: ["S", "M", "L", "XL"],
      variants: [
        { id: 4951, a: true, o: ["S"] },
        { id: 4952, a: true, o: ["M"] },
        { id: 4953, a: true, o: ["L"] },
        { id: 4954, a: true, o: ["XL"] },
      ],
      url: "https://nike-makknzjs.myshopify.com/products/sweatshirt-plus",
      width: 393,
      height: 600,
      sheetHeight: 244,
    },
    {
      id: "hoodie",
      name: "Hoodie",
      type: "Men's Fleece Pullover Hoodie",
      price: 199.0,
      image: "https://reel-ref-try-the-look.vercel.app/assets/source-hoodie.webp",
      sizes: ["S", "M", "L", "XL", "2XL"],
      variants: [
        { id: 4961, a: true, o: ["S"] },
        { id: 4962, a: true, o: ["M"] },
        { id: 4963, a: true, o: ["L"] },
        { id: 4964, a: true, o: ["XL"] },
        { id: 4965, a: true, o: ["2XL"] },
      ],
      url: "https://nike-makknzjs.myshopify.com/products/hoodie",
      width: 400,
      height: 555,
      sheetHeight: 222,
    },
    {
      id: "hoodie-black",
      name: "Hoodie Black",
      type: "Men's Fleece Pullover Hoodie",
      price: 199.0,
      image: "https://reel-ref-try-the-look.vercel.app/assets/source-hoodie-black.webp",
      sizes: ["S", "M", "L", "XL", "2XL"],
      variants: [
        { id: 4971, a: true, o: ["S"] },
        { id: 4972, a: true, o: ["M"] },
        { id: 4973, a: true, o: ["L"] },
        { id: 4974, a: true, o: ["XL"] },
        { id: 4975, a: true, o: ["2XL"] },
      ],
      url: "https://nike-makknzjs.myshopify.com/products/hoodie-black",
      width: 400,
      height: 536,
      sheetHeight: 214,
    },
  ],
  looks: [
    {
      name: "The City Edit",
      description: "A charcoal knit and easy denim.",
      model640: "https://reel-ref-try-the-look.vercel.app/assets/model-1-640.webp",
      model1080: "https://reel-ref-try-the-look.vercel.app/assets/model-1-1080.webp",
      original: "https://reel-ref-try-the-look.vercel.app/assets/original-look-1.webp",
      products: ["Air Jordan 12 Retro", "Tshirt", "Sweatshirt"],
      pins: [
        { productName: "Air Jordan 12 Retro", x: 47, y: 27, pinNumber: 1 },
        { productName: "Tshirt", x: 48, y: 58, pinNumber: 2 },
        { productName: "Sweatshirt", x: 45, y: 96, pinNumber: 3 },
      ],
    },
    {
      name: "Gallery Opening",
      description: "A clean white tee and relaxed denim.",
      model640: "https://reel-ref-try-the-look.vercel.app/assets/model-5-640.webp",
      model1080: "https://reel-ref-try-the-look.vercel.app/assets/model-5-1080.webp",
      original: "https://reel-ref-try-the-look.vercel.app/assets/original-look-5.webp",
      products: ["Tatum 5 Orbit", "Hoodie Black", "Tshirt"],
      pins: [
        { productName: "Tatum 5 Orbit", x: 50, y: 28, pinNumber: 1 },
        { productName: "Hoodie Black", x: 48, y: 58, pinNumber: 2 },
        { productName: "Tshirt", x: 45, y: 88, pinNumber: 3 },
      ],
      newProduct: "Hoodie Black",
    },
    {
      name: "Gallery Opening",
      description: "Olive knitwear. A grounded palette.",
      model640: "https://reel-ref-try-the-look.vercel.app/assets/model-4-640.webp",
      model1080: "https://reel-ref-try-the-look.vercel.app/assets/model-4-1080.webp",
      original: "https://reel-ref-try-the-look.vercel.app/assets/original-look-4.webp",
      products: ["Sweatshirt Plus", "Tatum 5 Orbit", "Tshirt"],
      pins: [
        { productName: "Sweatshirt Plus", x: 50, y: 28, pinNumber: 1 },
        { productName: "Tatum 5 Orbit", x: 48, y: 58, pinNumber: 2 },
        { productName: "Tshirt", x: 45, y: 88, pinNumber: 3 },
      ],
      newProduct: "Tatum 5 Orbit",
    },
    {
      name: "Studio Day",
      description: "Black, white and laid-back denim.",
      model640: "https://reel-ref-try-the-look.vercel.app/assets/model-6-640.webp",
      model1080: "https://reel-ref-try-the-look.vercel.app/assets/model-6-1080.webp",
      original: "https://reel-ref-try-the-look.vercel.app/assets/original-look-6.webp",
      products: ["Hoodie Black", "Air Jordan 12 Retro", "Tshirt"],
      pins: [
        { productName: "Hoodie Black", x: 50, y: 28, pinNumber: 1 },
        { productName: "Air Jordan 12 Retro", x: 48, y: 58, pinNumber: 2 },
        { productName: "Tshirt", x: 45, y: 88, pinNumber: 3 },
      ],
    },
    {
      name: "Studio Day",
      description: "Burgundy layers. A tailored perspective.",
      model640: "https://reel-ref-try-the-look.vercel.app/assets/model-3-640.webp",
      model1080: "https://reel-ref-try-the-look.vercel.app/assets/model-3-1080.webp",
      original: "https://reel-ref-try-the-look.vercel.app/assets/original-look-3.webp",
      products: ["Sweatshirt", "Tatum 5 Orbit", "Tshirt"],
      pins: [
        { productName: "Sweatshirt", x: 50, y: 28, pinNumber: 1 },
        { productName: "Tatum 5 Orbit", x: 48, y: 58, pinNumber: 2 },
        { productName: "Tshirt", x: 45, y: 88, pinNumber: 3 },
      ],
    },
    {
      name: "Studio Day",
      description: "A grey crew and your favourite denim.",
      model640: "https://reel-ref-try-the-look.vercel.app/assets/model-2-640.webp",
      model1080: "https://reel-ref-try-the-look.vercel.app/assets/model-2-1080.webp",
      original: "https://reel-ref-try-the-look.vercel.app/assets/original-look-2.webp",
      products: ["Hoodie", "Luka 5", "Tshirt"],
      pins: [
        { productName: "Hoodie", x: 50, y: 28, pinNumber: 1 },
        { productName: "Luka 5", x: 48, y: 58, pinNumber: 2 },
        { productName: "Tshirt", x: 45, y: 88, pinNumber: 3 },
      ],
    },
  ],
};
