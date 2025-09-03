export type ProductCategory = 
  'INSUMOS MÉDICOS Y OTROS' | 
  'AROMATERAPIA – BIOTERAPIA – ESTÉTICA' | 
  'EQUIPOS DE FISIOTERAPIA Y REHABILITACIÓN' | 
  'ORTOPÉDICOS PARA REHABILITACIÓN Y OTROS';

export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  category: ProductCategory;
  color?: string;
  size?: string;
  price: number;
  stock: number;
  imageUrl: string;
  images: string[];
  isFeatured?: boolean;
  technicalSheetUrl?: string; // URL for the PDF
  createdAt: Date;
};

export const categories: ProductCategory[] = [
  'INSUMOS MÉDICOS Y OTROS',
  'AROMATERAPIA – BIOTERAPIA – ESTÉTICA',
  'EQUIPOS DE FISIOTERAPIA Y REHABILITACIÓN',
  'ORTOPÉDICOS PARA REHABILITACIÓN Y OTROS',
];
