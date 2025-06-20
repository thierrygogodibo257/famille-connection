export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FAMILY_AUTH: '/family-auth',
  },
  DASHBOARD: {
    ROOT: '/dashboard',
    PROFILE: '/dashboard/profile',
    TREE: '/dashboard/tree',
    MEMBERS: '/dashboard/members',
    SETTINGS: '/dashboard/settings',
    INVITE: '/dashboard/invite',
    REPORT: '/dashboard/report',
    CHAT: '/dashboard/chat',
    ADMIN: '/dashboard/admin',
  },
  FAMILY: {
    TREE: '/family/tree',
    MEMBERS: '/family/members',
  },
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.FAMILY_AUTH,
];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD.ROOT,
  ROUTES.DASHBOARD.PROFILE,
  ROUTES.DASHBOARD.TREE,
  ROUTES.DASHBOARD.MEMBERS,
  ROUTES.DASHBOARD.SETTINGS,
  ROUTES.DASHBOARD.INVITE,
  ROUTES.FAMILY.TREE,
  ROUTES.FAMILY.MEMBERS,
];
