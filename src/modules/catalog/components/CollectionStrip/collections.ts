import { Compass, Gem, Shapes } from 'lucide-react';

export const collections = [
  {
    category: '',
    label: 'Todas as coleções',
    description: 'Encontre seu próximo tesouro',
    icon: Compass,
  },
  {
    category: 'Art',
    label: 'Arte digital',
    description: 'Novos mundos, novas histórias',
    icon: Gem,
  },
  { category: 'Abstract', label: 'Arte abstrata', description: 'Além da imaginação', icon: Shapes },
] as const;
