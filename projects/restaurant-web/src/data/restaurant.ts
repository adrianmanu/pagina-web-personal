export interface MenuItem {
  name: string;
  description: string;
  price: number;
  tag?: string;
  imageUrl?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Promotion {
  title: string;
  description: string;
  validUntil: string;
  badge?: string;
  imageUrl?: string;
}

export interface GalleryItem {
  id: string;
  label: string;
  imageUrl: string;
}

export interface DeliveryPartner {
  name: string;
  url: string;
  logoUrl?: string;
}

export interface ScheduleBlock {
  days: string;
  hours: string;
  note?: string;
}

const unsplash = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const asset = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

export const restaurant = {
  name: 'Mi Restaurante',
  tagline: 'Gastronomía de altura en Quito',
  description:
    'Cocina ecuatoriana contemporánea con ingredientes de la región, en un ambiente cálido con vista a la ciudad.',
  heroImage: unsplash('photo-1517248135467-4c7edcad34c4', 1600),
  aboutImage: unsplash('photo-1552566626-52f8b828add9', 900),
  about: [
    'En Mi Restaurante celebramos los sabores de la sierra con recetas de autor y productos locales seleccionados. Nacimos con la idea de compartir la cocina de altura en un espacio acogedor, ideal para almuerzos de familia, cenas especiales y encuentros con amigos.',
    'Nuestro equipo combina técnica, tradición y presentación cuidada en cada plato. Creemos en la hospitalidad ecuatoriana: buena mesa, atención cercana y momentos que se quedan en la memoria.',
  ],
  highlights: ['Cocina de autor', 'Productos locales', 'Vista panorámica', 'Reservas por WhatsApp'],
  phone: '+593 99 123 4567',
  whatsapp: '593991234567',
  email: 'hola@mirestaurante.demo',
  address: 'Av. González Suárez N32-120, Quito, Ecuador',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.752!2d-78.48!3d-0.18!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMMKwMTAnNDguMCJTIDc4wrAyOCc0OC4wIlc!5e0!3m2!1ses!2sec!4v1700000000000',
  social: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    tiktok: 'https://tiktok.com',
  },
  schedule: [
    { days: 'Lunes – Jueves', hours: '12:00 – 22:00' },
    { days: 'Viernes – Sábado', hours: '12:00 – 23:30', note: 'Música en vivo los viernes' },
    { days: 'Domingo', hours: '11:30 – 21:00', note: 'Brunch de 11:30 a 14:00' },
  ] as ScheduleBlock[],
  menu: [
    {
      id: 'entradas',
      name: 'Entradas',
      items: [
        {
          name: 'Locro de papa',
          description: 'Con queso, aguacate y maíz tostado',
          price: 6.5,
          tag: 'Tradicional',
          imageUrl: unsplash('photo-1546069901-ba9599a7e63c', 400),
        },
        {
          name: 'Ceviche de chochos',
          description: 'Cítrico, cilantro y popcorn andino',
          price: 8.0,
          imageUrl: unsplash('photo-1565299624946-b28f40a0ae38', 400),
        },
        {
          name: 'Empanadas de viento',
          description: 'Relleno de queso, ají de la casa',
          price: 7.5,
          imageUrl: unsplash('photo-1621996346565-e3dbc646d9a9', 400),
        },
      ],
    },
    {
      id: 'fuertes',
      name: 'Platos fuertes',
      items: [
        {
          name: 'Seco de chivo',
          description: 'Arroz, maduros y curtido',
          price: 14.5,
          tag: 'Favorito',
          imageUrl: unsplash('photo-1544025162-d76694265947', 400),
        },
        {
          name: 'Trucha a la plancha',
          description: 'Verduras de estación y mantequilla de hierbas',
          price: 16.0,
          imageUrl: unsplash('photo-1546833999-b9f581a1996d', 400),
        },
        {
          name: 'Lomo fino alto',
          description: 'Papas rústicas y reducción de vino tinto',
          price: 22.0,
          tag: 'Chef',
          imageUrl: unsplash('photo-1546833999-b9f581a1996d', 400),
        },
        {
          name: 'Arroz marinero',
          description: 'Mariscos frescos y sofrito criollo',
          price: 18.5,
          imageUrl: unsplash('photo-1565299624946-b28f40a0ae38', 400),
        },
      ],
    },
    {
      id: 'postres',
      name: 'Postres',
      items: [
        {
          name: 'Helado de paila',
          description: 'Sabores del día',
          price: 5.5,
          imageUrl: unsplash('photo-1563805042-7684c019e1cb', 400),
        },
        {
          name: 'Torta de tres leches',
          description: 'Receta de la casa',
          price: 6.0,
          imageUrl: unsplash('photo-1578985545062-69928b1d9587', 400),
        },
        {
          name: 'Chocolate caliente artesanal',
          description: 'Con queso y pan',
          price: 5.0,
          imageUrl: unsplash('photo-1578985545062-69928b1d9587', 400),
        },
      ],
    },
    {
      id: 'bebidas',
      name: 'Bebidas',
      items: [
        {
          name: 'Jugos naturales',
          description: 'Maracuyá, naranjilla o tomate de árbol',
          price: 3.5,
          imageUrl: asset('b1-jugo.jpg'),
        },
        {
          name: 'Canelazo de la casa',
          description: 'Ideal para noches frías',
          price: 4.5,
          tag: 'Caliente',
          imageUrl: unsplash('photo-1514362545857-3bc16c4c7d1b', 400),
        },
        {
          name: 'Cerveza artesanal',
          description: 'Selección local',
          price: 5.0,
          imageUrl: asset('b2-cerveza.jpg'),
        },
      ],
    },
  ] as MenuCategory[],
  promotions: [
    {
      title: 'Almuerzo ejecutivo',
      description: 'Entrada + plato fuerte + bebida por $12.50. De lunes a viernes, 12:00 a 15:00.',
      validUntil: 'Vigente todo el mes',
      badge: 'Mediodía',
      imageUrl: unsplash('photo-1504674900247-0877df9cc836', 600),
    },
    {
      title: 'Noche de parejas',
      description: '2 platos fuertes + postre para compartir + copa de vino. $38 por pareja.',
      validUntil: 'Miércoles y jueves en la noche',
      badge: 'Promo',
      imageUrl: unsplash('photo-1414235077428-338989a2e8c0', 600),
    },
    {
      title: 'Brunch dominical',
      description: 'Huevos benedictinos, pancakes o waffles con café americano incluido.',
      validUntil: 'Domingos 11:30 – 14:00',
      badge: 'Domingo',
      imageUrl: unsplash('photo-1525351484163-7529414344d8', 600),
    },
  ] as Promotion[],
  gallery: [
    { id: '1', label: 'Salón principal', imageUrl: unsplash('photo-1552566626-52f8b828add9', 800) },
    { id: '2', label: 'Plato de autor', imageUrl: unsplash('photo-1546069901-ba9599a7e63c', 800) },
    { id: '3', label: 'Ambiente nocturno', imageUrl: unsplash('photo-1555396273-367ea4eb4db5', 800) },
    { id: '4', label: 'Barra y cocteles', imageUrl: unsplash('photo-1514362545857-3bc16c4c7d1b', 800) },
    { id: '5', label: 'Cocina abierta', imageUrl: unsplash('photo-1556910103-1c02745aae4d', 800) },
    { id: '6', label: 'Terraza', imageUrl: unsplash('photo-1590846407962-a0acbdea6be3', 800) },
  ] as GalleryItem[],
  delivery: [
    { name: 'Uber Eats', url: 'https://www.ubereats.com' },
    { name: 'Rappi', url: 'https://www.rappi.com.ec' },
    { name: 'PedidosYa', url: 'https://www.pedidosya.com.ec' },
  ] as DeliveryPartner[],
};

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}
