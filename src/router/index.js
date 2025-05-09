import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

// Lazy load components
const Login = () => import('@/views/Login.vue');
const Dashboard = () => import('@/views/Dashboard.vue');
const Profile = () => import('@/views/Profile.vue');
const NotFound = () => import('@/views/NotFound.vue');

// Product routes
const ProductList = () => import('@/views/products/ProductList.vue');
const ProductCreate = () => import('@/views/products/ProductCreate.vue');
const ProductEdit = () => import('@/views/products/ProductEdit.vue');
const ProductDetail = () => import('@/views/products/ProductDetail.vue');

// Category routes
const CategoryList = () => import('@/views/categories/CategoryList.vue');
const CategoryCreate = () => import('@/views/categories/CategoryCreate.vue');
const CategoryEdit = () => import('@/views/categories/CategoryEdit.vue');

// Order routes
const OrderList = () => import('@/views/orders/OrderList.vue');
const OrderDetail = () => import('@/views/orders/OrderDetail.vue');

// Customer routes
const CustomerList = () => import('@/views/customers/CustomerList.vue');
const CustomerDetail = () => import('@/views/customers/CustomerDetail.vue');

// Discount routes
const DiscountList = () => import('@/views/discounts/DiscountList.vue');
const DiscountCreate = () => import('@/views/discounts/DiscountCreate.vue');
const DiscountEdit = () => import('@/views/discounts/DiscountEdit.vue');

// Report routes
const ReportList = () => import('@/views/reports/ReportList.vue');
const SalesReport = () => import('@/views/reports/SalesReport.vue');
const InventoryReport = () => import('@/views/reports/InventoryReport.vue');
const CustomerReport = () => import('@/views/reports/CustomerReport.vue');

// Settings routes
const Settings = () => import('@/views/settings/Settings.vue');
const GeneralSettings = () => import('@/views/settings/GeneralSettings.vue');
const UserSettings = () => import('@/views/settings/UserSettings.vue');
const NotificationSettings = () => import('@/views/settings/NotificationSettings.vue');
const SettingsView = () => import('@/views/SettingsView.vue');

// Inventory routes
const InventoryView = () => import('@/views/InventoryView.vue');

const PaymentView = () => import('@/views/PaymentView.vue');

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Đăng nhập',
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard'
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: {
          title: 'Hồ sơ',
          icon: 'mdi-account-circle'
        }
      },
      // Product routes
      {
        path: 'products',
        name: 'Products',
        component: ProductList,
        meta: { title: 'Sản phẩm', icon: 'mdi-package-variant' }
      },
      {
        path: 'products/create',
        name: 'ProductCreate',
        component: ProductCreate,
        meta: { title: 'Thêm sản phẩm', parent: 'Products' }
      },
      {
        path: 'products/:id',
        name: 'ProductDetail',
        component: ProductDetail,
        meta: { title: 'Chi tiết sản phẩm', parent: 'Products' }
      },
      {
        path: 'products/:id/edit',
        name: 'ProductEdit',
        component: ProductEdit,
        meta: { title: 'Sửa sản phẩm', parent: 'Products' }
      },
      // Category routes
      {
        path: 'categories',
        name: 'Categories',
        component: CategoryList,
        meta: { title: 'Danh mục', icon: 'mdi-tag' }
      },
      {
        path: 'categories/create',
        name: 'CategoryCreate',
        component: CategoryCreate,
        meta: { title: 'Thêm danh mục', parent: 'Categories' }
      },
      {
        path: 'categories/:id/edit',
        name: 'CategoryEdit',
        component: CategoryEdit,
        meta: { title: 'Sửa danh mục', parent: 'Categories' }
      },
      // Order routes
      {
        path: 'orders',
        name: 'Orders',
        component: OrderList,
        meta: {
          title: 'Đơn hàng',
          icon: 'mdi-cart'
        }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: OrderDetail,
        meta: {
          title: 'Chi tiết đơn hàng',
          parent: 'Orders'
        }
      },
      // Customer routes
      {
        path: 'customers',
        name: 'Customers',
        component: CustomerList,
        meta: {
          title: 'Khách hàng',
          icon: 'mdi-account-group'
        }
      },
      {
        path: 'customers/:id',
        name: 'CustomerDetail',
        component: CustomerDetail,
        meta: {
          title: 'Chi tiết khách hàng',
          parent: 'Customers'
        }
      },
      // Discount routes
      {
        path: 'discounts',
        name: 'Discounts',
        component: DiscountList,
        meta: { title: 'Mã giảm giá', icon: 'mdi-tag-multiple' }
      },
      {
        path: 'discounts/create',
        name: 'DiscountCreate',
        component: DiscountCreate,
        meta: { title: 'Thêm mã giảm giá', parent: 'Discounts' }
      },
      {
        path: 'discounts/:id/edit',
        name: 'DiscountEdit',
        component: DiscountEdit,
        meta: { title: 'Sửa mã giảm giá', parent: 'Discounts' }
      },
      // Report routes
      {
        path: 'reports',
        name: 'Reports',
        component: ReportList,
        meta: { title: 'Báo cáo', icon: 'mdi-chart-line' }
      },
      {
        path: 'reports/sales',
        name: 'SalesReport',
        component: SalesReport,
        meta: { title: 'Báo cáo doanh thu', parent: 'Reports' }
      },
      {
        path: 'reports/inventory',
        name: 'InventoryReport',
        component: InventoryReport,
        meta: { title: 'Báo cáo tồn kho', parent: 'Reports' }
      },
      {
        path: 'reports/customers',
        name: 'CustomerReport',
        component: CustomerReport,
        meta: { title: 'Báo cáo khách hàng', parent: 'Reports' }
      },
      // Settings routes
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: { title: 'Cài đặt', icon: 'mdi-cog' }
      },
      {
        path: 'settings/view',
        name: 'Settings',
        component: SettingsView,
        meta: { title: 'Cài đặt', icon: 'mdi-cog' }
      },
      {
        path: 'settings/general',
        name: 'GeneralSettings',
        component: GeneralSettings,
        meta: { title: 'Cài đặt chung', parent: 'Settings' }
      },
      {
        path: 'settings/users',
        name: 'UserSettings',
        component: UserSettings,
        meta: { title: 'Quản lý người dùng', parent: 'Settings' }
      },
      {
        path: 'settings/notifications',
        name: 'NotificationSettings',
        component: NotificationSettings,
        meta: { title: 'Cài đặt thông báo', parent: 'Settings' }
      },
      {
        path: 'inventory',
        name: 'InventoryView',
        component: InventoryView,
        meta: { title: 'Quản lý kho', icon: 'mdi-package-variant-closed' }
      },
      {
        path: 'payment',
        name: 'PaymentView',
        component: PaymentView,
        meta: { title: 'Thanh toán', icon: '' }
      },
      // 404 route
      {
        path: ':pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        meta: { title: 'Không tìm thấy trang' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Set page title
  document.title = to.meta.title ? `${to.meta.title} | E-Shop Admin` : 'E-Shop Admin';

  // Comment out authentication check

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // if (!authStore.isAuthenticated) {
    const restored = authStore.checkAuth();

    console.log("check auth: ", restored);

    if (!restored) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
      return;
    }
    // }
  }

  if (to.name === 'Login' && authStore.isAuthenticated) {
    next('/dashboard');
    return;
  }


  // Always allow access
  next();
});
// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore();

//   // Set title
//   document.title = to.meta.title ? `${to.meta.title} | E-Shop Admin` : 'E-Shop Admin';

//   // Chặn truy cập nếu chưa đăng nhập và route yêu cầu xác thực
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     next({
//       path: '/login',
//       query: { redirect: to.fullPath }
//     });
//     return;
//   }

//   // Nếu đang login mà đã đăng nhập thì chuyển về dashboard
//   if (to.name === 'Login') {
//     next('/dashboard');
//     return;
//   }

//   next();
// });

export default router;