import React from 'react';
import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  Store,
  Award,
  TrendingUp,
  Gift,
  PlusCircle,
  HelpCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface CategoryIconProps {
  iconName?: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-5 h-5', color }) => {
  const iconProps = { className, style: color ? { color } : undefined };

  switch (iconName) {
    case 'Utensils':
      return <Utensils {...iconProps} />;
    case 'Car':
      return <Car {...iconProps} />;
    case 'Home':
      return <Home {...iconProps} />;
    case 'ShoppingBag':
      return <ShoppingBag {...iconProps} />;
    case 'Film':
      return <Film {...iconProps} />;
    case 'HeartPulse':
      return <HeartPulse {...iconProps} />;
    case 'GraduationCap':
      return <GraduationCap {...iconProps} />;
    case 'Briefcase':
      return <Briefcase {...iconProps} />;
    case 'Store':
      return <Store {...iconProps} />;
    case 'Award':
      return <Award {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'Gift':
      return <Gift {...iconProps} />;
    case 'PlusCircle':
      return <PlusCircle {...iconProps} />;
    case 'ArrowUpRight':
      return <ArrowUpRight {...iconProps} />;
    case 'ArrowDownRight':
      return <ArrowDownRight {...iconProps} />;
    case 'Wallet':
      return <Wallet {...iconProps} />;
    case 'MoreHorizontal':
    default:
      return <MoreHorizontal {...iconProps} />;
  }
};
