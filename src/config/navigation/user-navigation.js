import {
  AlertIcon,
  BellIcon,
  HomeIcon,
  ReceiptIcon,
  SearchIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
} from "../../components/icons";

export const userNavigationSections = [
  {
    label: "Overview",
    translationKey: "overview",
    items: [
      { label: "Dashboard", 
        translationKey: "dashboard",
        path: "/dashboard", 
        icon: HomeIcon, 
        end: true 
      },

      { label: "Find an Ajo", 
        translationKey: "findAjo",
        path: "/find-ajo", 
        icon: SearchIcon 
      },

      { label: "My Ajos", 
        translationKey: "myAjos",
        path: "/my-ajos", 
        icon: UsersIcon 
      },
      { label: "Wallet", 
        translationKey: "wallet",
        path: "/wallet", 
        icon: WalletIcon 
      },

      { label: "Transactions", 
        translationKey: "transactions",
        path: "/transactions", 
        icon: ReceiptIcon 
      },
    ],
  },
  {
    label: "Account",
    translationKey: "account",
    items: [
      {
        label: "Notifications",
        translationKey: "notifications",
        path: "/notifications",
        icon: BellIcon,
        badgeKey: "notifications",
      },
      { label: "Profile", 
        translationKey: "profile",
        path: "/profile", 
        icon: UserIcon 
      },
      {
        label: "Support",
        translationKey: "support",
        path: "/support",
        icon: AlertIcon,
      },
      
      {
        label: "Admin portal",
        translationKey: "adminPortal",
        path: "/admin",
        icon: ShieldIcon,
        roles: ["ADMIN"],
      },
    ],
  },
];
