export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateMenuItemDto = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;