export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  category: 'Equipamiento' | 'Consumibles' | 'Instrumental' | 'Primeros Auxilios';
  color?: string;
  size?: string;
  price: number;
  stock: number;
  imageUrl: string;
  images: string[];
  technicalSheetUrl?: string; // URL for the PDF
  createdAt: Date;
};

// This is now just mock data, the real data will come from Firestore.
export const products: Omit<Product, 'createdAt'>[] = [
  {
    id: '1',
    name: 'Guantes de Nitrilo',
    brand: 'MedSafe',
    description: 'Caja de 100 guantes de nitrilo sin polvo, hipoalergénicos y de alta resistencia. Ideales para exámenes médicos.',
    category: 'Consumibles',
    size: 'M',
    price: 15.99,
    stock: 250,
    imageUrl: 'https://picsum.photos/400/400?random=1',
    images: ['https://picsum.photos/600/600?random=1', 'https://picsum.photos/600/600?random=2'],
  },
  {
    id: '2',
    name: 'Mascarillas Quirúrgicas',
    brand: 'ProtectWell',
    description: 'Paquete de 50 mascarillas quirúrgicas de 3 capas, con ajuste nasal y alta eficiencia de filtración bacteriana.',
    category: 'Consumibles',
    price: 9.50,
    stock: 800,
    imageUrl: 'https://picsum.photos/400/400?random=2',
    images: ['https://picsum.photos/600/600?random=3', 'https://picsum.photos/600/600?random=4'],
  },
  {
    id: '3',
    name: 'Estetoscopio Profesional',
    brand: 'CardioPro',
    description: 'Estetoscopio de doble campana para auscultación precisa en adultos y niños. Acústica superior y diseño ergonómico.',
    category: 'Equipamiento',
    color: 'Negro',
    price: 89.90,
    stock: 50,
    imageUrl: 'https://picsum.photos/400/400?random=3',
    images: ['https://picsum.photos/600/600?random=5', 'https://picsum.photos/600/600?random=6'],
  },
  {
    id: '4',
    name: 'Kit de Primeros Auxilios',
    brand: 'LifeKit',
    description: 'Completo kit de primeros auxilios con 150 piezas esenciales para el hogar, oficina o coche. Incluye vendas, antisépticos, y más.',
    category: 'Primeros Auxilios',
    price: 34.99,
    stock: 120,
    imageUrl: 'https://picsum.photos/400/400?random=4',
    images: ['https://picsum.photos/600/600?random=7', 'https://picsum.photos/600/600?random=8'],
  },
  {
    id: '5',
    name: 'Termómetro Digital',
    brand: 'QuickRead',
    description: 'Termómetro digital de lectura rápida (10 segundos) con punta flexible. Apto para uso oral, rectal y axilar.',
    category: 'Equipamiento',
    price: 12.00,
    stock: 300,
    imageUrl: 'https://picsum.photos/400/400?random=5',
    images: ['https://picsum.photos/600/600?random=9', 'https://picsum.photos/600/600?random=10'],
  },
  {
    id: '6',
    name: 'Tijeras de Botón',
    brand: 'DuraCut',
    description: 'Tijeras de acero inoxidable de grado quirúrgico, diseñadas para cortar vendajes y ropa de forma segura.',
    category: 'Instrumental',
    price: 7.80,
    stock: 150,
    imageUrl: 'https://picsum.photos/400/400?random=6',
    images: ['https://picsum.photos/600/600?random=11', 'https://picsum.photos/600/600?random=12'],
  },
  {
    id: '7',
    name: 'Gasas Estériles',
    brand: 'CleanWound',
    description: 'Caja con 100 apósitos de gasa estéril de 12 capas, 10x10 cm. Altamente absorbentes y suaves.',
    category: 'Consumibles',
    price: 11.25,
    stock: 500,
    imageUrl: 'https://picsum.photos/400/400?random=7',
    images: ['https://picsum.photos/600/600?random=13', 'https://picsum.photos/600/600?random=14'],
  },
    {
    id: '8',
    name: 'Oxímetro de Pulso',
    brand: 'OxyCheck',
    description: 'Oxímetro de pulso de dedo para medir la saturación de oxígeno en sangre (SpO2) y la frecuencia del pulso. Pantalla OLED.',
    category: 'Equipamiento',
    price: 28.50,
    stock: 90,
    imageUrl: 'https://picsum.photos/400/400?random=8',
    images: ['https://picsum.photos/600/600?random=15', 'https://picsum.photos/600/600?random=16'],
  },
];

export const categories = Array.from(new Set(products.map(p => p.category)));
