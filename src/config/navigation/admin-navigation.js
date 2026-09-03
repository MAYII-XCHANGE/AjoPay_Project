import {
  AlertIcon,
  HomeIcon,
  ReceiptIcon,
  SettingsIcon,
  UserPlusIcon,
  UsersIcon,
  WalletIcon,
} from "../../components/icons";

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
      {
        label: "Join requests",
        translationKey: "joinRequests",
        path: "/admin/join-requests",
        icon: UserPlusIcon,
        badgeKey: "joinRequests",
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
