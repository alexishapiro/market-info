import {
    Home as HomeIcon,
    Calendar as CalendarIcon,
    MapPin as MapPinIcon,
    CreditCard as CreditCardIcon,
    UserPlus as UserPlusIcon,
    DollarSign as DollarSignIcon,
    BarChart as BarChartIcon,
    Settings as SettingsIcon,
    Menu as MenuIcon,
    X as XIcon,
    ArrowRight as ArrowRightIcon,
    CircleUserRound as UserIcon,
    LogOut as LogOutIcon,
    DoorOpen as DoorOpenIcon,
    Castle as CastleIcon,
    ArrowLeftRight as ArrowLeftRightIcon,
    Package as PackageIcon,
    SquareUser as SquareUserIcon,
    Scroll as ScrollIcon,
    Plus as PlusIcon,
    Minus as MinusIcon,
    BookOpen as BookOpenIcon,
    SquareActivity as SquareActivityIcon
  } from "lucide-react";
   // Import necessary icons

// Create a mapping for icons
const iconMap: { [key: string]: React.ElementType } = {
    HomeIcon,
    CalendarIcon,
    MapPinIcon,
    CreditCardIcon,
    UserPlusIcon,
    DollarSignIcon,
    BarChartIcon,
    SettingsIcon,
    MenuIcon,
    XIcon,
    ArrowRightIcon,
    UserIcon,
    LogOutIcon,
    DoorOpenIcon,
    CastleIcon,
    ArrowLeftRightIcon,
    PackageIcon,
    SquareUserIcon,
    ScrollIcon,
    PlusIcon,
    MinusIcon,
    BookOpenIcon,
    SquareActivityIcon
    
  };

interface IconComponentProps {
  iconName: string;
  className:string | '';
   
}

const IconComponent: React.FC<IconComponentProps> = ({ iconName ,className }) => {
  const Icon = iconMap[iconName]; // Select the correct icon component
  return Icon ? <Icon className={className + ""} /> : null; // Render the icon or nothing if not found
};

export default IconComponent;