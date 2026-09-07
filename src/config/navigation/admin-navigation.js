import {
  AlertIcon,
  HomeIcon,
  ReceiptIcon,
  SettingsIcon,
  UsersIcon,
  WalletIcon,
} from "../../components/icons";
import { UserRole } from "../../enums/roles";

export const adminNavigationSections = [
  {
    label: "Operations",
    translationKey: "operations",
    items: [
      { label: "Overview", 
        translationKey: "overview",
        path: "/admin", 
        icon: HomeIcon, 
        end: true 
      },

      { label: "Users", 
        translationKey: "users",
        path: "/admin/users", 
        icon: UsersIcon 
      },

      { label: "Ajos", 
        translationKey: "ajos",
        path: "/admin/ajos", 
        icon: UsersIcon 
      },
    ],
  },
  {
    label: "Finance",
    translationKey: "finance",
    items: [
      { label: "Transactions", translationKey: "transactions", path: "/admin/transactions", icon: ReceiptIcon },
      {
        label: "Withdrawals",
        translationKey: "withdrawals",
        path: "/admin/withdrawals",
        icon: WalletIcon,
        badgeKey: "withdrawals",
      },
    ],
  },
  {
    label: "Platform",
    translationKey: "platform",
    items: [
      { label: "Settings", translationKey: "settings", path: "/admin/settings", icon: SettingsIcon },
      { label: "Administrators", path: "/admin/admins", icon: UsersIcon, roles: [UserRole.SUPER_ADMIN] },
      {
        label: "System issues",
        translationKey: "systemIssues",
        path: "/admin/system-issues",
        icon: AlertIcon,
        badgeKey: "issues",
      },
    ],
  },
];
