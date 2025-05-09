<template>
  <div class="user-view">
    <v-container fluid>
      <!-- Tiêu đề -->
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <h1 class="text-h4">Quản lý người dùng</h1>
          <v-btn color="primary" @click="openUserDialog()">
            <v-icon left>mdi-plus</v-icon>
            Thêm người dùng
          </v-btn>
        </v-col>
      </v-row>

      <!-- Bộ lọc và tìm kiếm -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.search"
            label="Tìm kiếm"
            prepend-icon="mdi-magnify"
            clearable
            @input="handleSearch"
            placeholder="Tên, email, số điện thoại..."
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.role"
            :items="roleOptions"
            label="Vai trò"
            clearable
            @change="handleFilter"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="Trạng thái"
            clearable
            @change="handleFilter"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-menu
            v-model="dateMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="dateRangeText"
                label="Khoảng thời gian"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
                clearable
                @click:clear="clearDateRange"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="filters.dateRange"
              range
              @input="dateMenu = false"
              @change="handleFilter"
            ></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>

      <!-- Bảng danh sách người dùng -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="users"
          :loading="loading"
          :options.sync="tableOptions"
          :server-items-length="totalUsers"
          :footer-props="{
            'items-per-page-options': [10, 20, 50, 100],
            'items-per-page-text': 'Số người dùng mỗi trang'
          }"
          class="elevation-1"
        >
          <!-- Cột avatar -->
          <template v-slot:item.avatar="{ item }">
            <v-avatar size="40">
              <v-img :src="item.avatar || '/images/default-avatar.png'" :alt="item.fullName"></v-img>
            </v-avatar>
          </template>

          <!-- Cột tên người dùng -->
          <template v-slot:item.fullName="{ item }">
            <div class="d-flex align-center">
              <span class="font-weight-medium">{{ item.fullName }}</span>
              <v-chip
                v-if="item.isAdmin"
                x-small
                color="primary"
                class="ml-2"
                label
              >
                Admin
              </v-chip>
            </div>
          </template>

          <!-- Cột vai trò -->
          <template v-slot:item.role="{ item }">
            <v-chip
              :color="getRoleColor(item.role)"
              small
              label
            >
              {{ getRoleText(item.role) }}
            </v-chip>
          </template>

          <!-- Cột trạng thái -->
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              small
              label
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <!-- Cột thao tác -->
          <template v-slot:item.actions="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  @click="openUserDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Sửa</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  @click="openPermissionsDialog(item)"
                >
                  <v-icon>mdi-shield-account</v-icon>
                </v-btn>
              </template>
              <span>Phân quyền</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  @click="toggleUserStatus(item)"
                >
                  <v-icon>{{ item.status === 'active' ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
                </v-btn>
              </template>
              <span>{{ item.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản' }}</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  @click="confirmDelete(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Xóa</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card>

      <!-- Dialog thêm/sửa người dùng -->
      <v-dialog v-model="userDialog" max-width="600px">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ isEditing ? 'Sửa người dùng' : 'Thêm người dùng' }}</span>
            <v-btn icon @click="closeUserDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-form ref="userForm" v-model="userFormValid">
              <v-row>
                <v-col cols="12" class="text-center">
                  <v-avatar size="100" class="mb-2">
                    <v-img :src="userData.avatarPreview || '/images/default-avatar.png'" :alt="userData.fullName"></v-img>
                  </v-avatar>
                  <v-file-input
                    v-model="userData.avatar"
                    label="Ảnh đại diện"
                    accept="image/*"
                    prepend-icon="mdi-camera"
                    hide-details
                    class="mt-2"
                    @change="handleAvatarChange"
                  ></v-file-input>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="userData.fullName"
                    label="Họ và tên"
                    :rules="[v => !!v || 'Họ và tên là bắt buộc']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="userData.email"
                    label="Email"
                    :rules="[
                      v => !!v || 'Email là bắt buộc',
                      v => /.+@.+\..+/.test(v) || 'Email không hợp lệ'
                    ]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="userData.phone"
                    label="Số điện thoại"
                    :rules="[v => !v || /^[0-9]{10}$/.test(v) || 'Số điện thoại không hợp lệ']"
                    mask="##########"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="userData.role"
                    :items="roleOptions"
                    label="Vai trò"
                    :rules="[v => !!v || 'Vai trò là bắt buộc']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="userData.address"
                    label="Địa chỉ"
                    rows="2"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="6" v-if="!isEditing">
                  <v-text-field
                    v-model="userData.password"
                    label="Mật khẩu"
                    type="password"
                    :rules="[
                      v => !!v || 'Mật khẩu là bắt buộc',
                      v => v.length >= 8 || 'Mật khẩu phải có ít nhất 8 ký tự'
                    ]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" v-if="!isEditing">
                  <v-text-field
                    v-model="userData.confirmPassword"
                    label="Xác nhận mật khẩu"
                    type="password"
                    :rules="[
                      v => !!v || 'Xác nhận mật khẩu là bắt buộc',
                      v => v === userData.password || 'Mật khẩu không khớp'
                    ]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="userData.isAdmin"
                    label="Quản trị viên"
                    color="primary"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="userData.status"
                    :true-value="'active'"
                    :false-value="'inactive'"
                    label="Kích hoạt"
                    color="success"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="closeUserDialog">
              Hủy
            </v-btn>
            <v-btn color="primary" @click="saveUser" :loading="saving">
              {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog phân quyền -->
      <v-dialog v-model="permissionsDialog" max-width="700px">
        <v-card v-if="selectedUser">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Phân quyền cho {{ selectedUser.fullName }}</span>
            <v-btn icon @click="permissionsDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="selectedUser.role"
                  :items="roleOptions"
                  label="Vai trò"
                  @change="handleRoleChange"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-divider class="mb-4"></v-divider>
                <h3 class="text-h6 mb-2">Quyền chi tiết</h3>
                <v-row>
                  <v-col cols="12" md="6" v-for="(permissions, module) in availablePermissions" :key="module">
                    <v-card outlined>
                      <v-card-title class="text-subtitle-1 py-2">
                        {{ getModuleName(module) }}
                      </v-card-title>
                      <v-card-text class="py-2">
                        <v-checkbox
                          v-for="permission in permissions"
                          :key="permission.value"
                          v-model="selectedUser.permissions"
                          :label="permission.label"
                          :value="permission.value"
                          hide-details
                          dense
                        ></v-checkbox>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="permissionsDialog = false">
              Hủy
            </v-btn>
            <v-btn color="primary" @click="savePermissions" :loading="savingPermissions">
              Lưu quyền
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog xác nhận xóa -->
      <v-dialog v-model="deleteDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h5">Xác nhận xóa</v-card-title>
          <v-card-text>
            Bạn có chắc chắn muốn xóa người dùng "{{ selectedUser?.fullName }}"?
            <div class="mt-2 text-error">
              Cảnh báo: Hành động này không thể hoàn tác.
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="deleteDialog = false">
              Hủy
            </v-btn>
            <v-btn color="error" @click="deleteUser" :loading="deleting">
              Xóa
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog xác nhận khóa/mở khóa -->
      <v-dialog v-model="statusDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h5">
            {{ selectedUser?.status === 'active' ? 'Xác nhận khóa' : 'Xác nhận mở khóa' }}
          </v-card-title>
          <v-card-text>
            Bạn có chắc chắn muốn {{ selectedUser?.status === 'active' ? 'khóa' : 'mở khóa' }} tài khoản của "{{ selectedUser?.fullName }}"?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="statusDialog = false">
              Hủy
            </v-btn>
            <v-btn color="primary" @click="confirmToggleStatus" :loading="togglingStatus">
              {{ selectedUser?.status === 'active' ? 'Khóa' : 'Mở khóa' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar thông báo -->
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.text }}
        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar.show = false">
            Đóng
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { userService } from '@/api/services/userService';
import { formatDate } from '@/utils/formatters';

export default {
  name: 'UserView',
  setup() {
    // Bảng người dùng
    const headers = [
      { text: 'Ảnh đại diện', value: 'avatar', sortable: false },
      { text: 'Họ và tên', value: 'fullName' },
      { text: 'Email', value: 'email' },
      { text: 'Số điện thoại', value: 'phone' },
      { text: 'Vai trò', value: 'role' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Ngày tạo', value: 'createdAt' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ];

    // Dữ liệu
    const users = ref([]);
    const selectedUser = ref(null);
    const totalUsers = ref(0);
    const loading = ref(false);
    const saving = ref(false);
    const deleting = ref(false);
    const savingPermissions = ref(false);
    const togglingStatus = ref(false);

    // Dialog
    const userDialog = ref(false);
    const permissionsDialog = ref(false);
    const deleteDialog = ref(false);
    const statusDialog = ref(false);
    const dateMenu = ref(false);

    // Form
    const userForm = ref(null);
    const userFormValid = ref(false);
    const isEditing = ref(false);

    // Bộ lọc
    const filters = reactive({
      search: '',
      role: null,
      status: null,
      dateRange: []
    });

    // Tùy chọn bảng
    const tableOptions = ref({
      page: 1,
      itemsPerPage: 10,
      sortBy: ['createdAt'],
      sortDesc: [true]
    });

    // Tùy chọn lọc
    const roleOptions = [
      { text: 'Quản trị viên', value: 'admin' },
      { text: 'Nhân viên', value: 'staff' },
      { text: 'Người dùng', value: 'user' }
    ];

    const statusOptions = [
      { text: 'Đang hoạt động', value: 'active' },
      { text: 'Đã khóa', value: 'inactive' }
    ];

    // Dữ liệu người dùng
    const userData = reactive({
      id: null,
      fullName: '',
      email: '',
      phone: '',
      address: '',
      role: 'user',
      password: '',
      confirmPassword: '',
      avatar: null,
      avatarPreview: null,
      isAdmin: false,
      status: 'active'
    });

    // Quyền chi tiết
    const availablePermissions = {
      products: [
        { label: 'Xem sản phẩm', value: 'products:view' },
        { label: 'Thêm sản phẩm', value: 'products:create' },
        { label: 'Sửa sản phẩm', value: 'products:update' },
        { label: 'Xóa sản phẩm', value: 'products:delete' }
      ],
      categories: [
        { label: 'Xem danh mục', value: 'categories:view' },
        { label: 'Thêm danh mục', value: 'categories:create' },
        { label: 'Sửa danh mục', value: 'categories:update' },
        { label: 'Xóa danh mục', value: 'categories:delete' }
      ],
      orders: [
        { label: 'Xem đơn hàng', value: 'orders:view' },
        { label: 'Cập nhật trạng thái', value: 'orders:update' },
        { label: 'Hủy đơn hàng', value: 'orders:cancel' }
      ],
      customers: [
        { label: 'Xem khách hàng', value: 'customers:view' },
        { label: 'Sửa thông tin', value: 'customers:update' },
        { label: 'Khóa tài khoản', value: 'customers:block' }
      ],
      users: [
        { label: 'Xem người dùng', value: 'users:view' },
        { label: 'Thêm người dùng', value: 'users:create' },
        { label: 'Sửa người dùng', value: 'users:update' },
        { label: 'Xóa người dùng', value: 'users:delete' },
        { label: 'Phân quyền', value: 'users:permissions' }
      ],
      reports: [
        { label: 'Xem báo cáo', value: 'reports:view' },
        { label: 'Xuất báo cáo', value: 'reports:export' }
      ],
      settings: [
        { label: 'Xem cài đặt', value: 'settings:view' },
        { label: 'Cập nhật cài đặt', value: 'settings:update' }
      ]
    };

    // Snackbar
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    });

    // Computed
    const dateRangeText = computed(() => {
      if (!filters.dateRange || filters.dateRange.length !== 2) return '';
      return `${formatDate(filters.dateRange[0])} - ${formatDate(filters.dateRange[1])}`;
    });

    // Hàm lấy danh sách người dùng
    const fetchUsers = async () => {
      loading.value = true;
      try {
        const params = {
          page: tableOptions.value.page,
          limit: tableOptions.value.itemsPerPage,
          sortBy: tableOptions.value.sortBy[0],
          sortDesc: tableOptions.value.sortDesc[0],
          search: filters.search,
          role: filters.role,
          status: filters.status,
          startDate: filters.dateRange[0],
          endDate: filters.dateRange[1]
        };

        const response = await userService.getUsers(params);
        users.value = response.data;
        totalUsers.value = response.total;
      } catch (error) {
        console.error('Error fetching users:', error);
        showSnackbar('Không thể tải danh sách người dùng', 'error');
      } finally {
        loading.value = false;
      }
    };

    // Hàm mở dialog thêm/sửa người dùng
    const openUserDialog = (user = null) => {
      isEditing.value = !!user;
      
      if (user) {
        Object.assign(userData, {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          role: user.role,
          password: '',
          confirmPassword: '',
          avatar: null,
          avatarPreview: user.avatar,
          isAdmin: user.isAdmin,
          status: user.status
        });
      } else {
        Object.assign(userData, {
          id: null,
          fullName: '',
          email: '',
          phone: '',
          address: '',
          role: 'user',
          password: '',
          confirmPassword: '',
          avatar: null,
          avatarPreview: null,
          isAdmin: false,
          status: 'active'
        });
      }
      
      userDialog.value = true;
    };

    // Hàm đóng dialog thêm/sửa người dùng
    const closeUserDialog = () => {
      userDialog.value = false;
      if (userForm.value) {
        userForm.value.reset();
      }
    };

    // Hàm xử lý thay đổi avatar
    const handleAvatarChange = (file) => {
      if (file) {
        userData.avatarPreview = URL.createObjectURL(file);
      } else {
        userData.avatarPreview = null;
      }
    };

    // Hàm lưu người dùng
    const saveUser = async () => {
      if (!userForm.value.validate()) return;

      saving.value = true;
      try {
        const formData = new FormData();
        
        // Thêm các trường dữ liệu vào FormData
        Object.keys(userData).forEach(key => {
          if (key === 'avatar' && userData[key]) {
            formData.append('avatar', userData[key]);
          } else if (key !== 'confirmPassword' && userData[key] !== null && userData[key] !== undefined) {
            formData.append(key, userData[key]);
          }
        });

        if (isEditing.value) {
          await userService.updateUser(userData.id, formData);
          showSnackbar('Cập nhật người dùng thành công', 'success');
        } else {
          await userService.createUser(formData);
          showSnackbar('Thêm người dùng thành công', 'success');
        }
        
        closeUserDialog();
        fetchUsers();
      } catch (error) {
        console.error('Error saving user:', error);
        showSnackbar(`Không thể ${isEditing.value ? 'cập nhật' : 'thêm'} người dùng`, 'error');
      } finally {
        saving.value = false;
      }
    };

    // Hàm mở dialog phân quyền
    const openPermissionsDialog = (user) => {
      selectedUser.value = { ...user };
      permissionsDialog.value = true;
    };

    // Hàm xử lý thay đổi vai trò
    const handleRoleChange = () => {
      // Cập nhật quyền mặc định theo vai trò
      if (selectedUser.value.role === 'admin') {
        selectedUser.value.permissions = Object.values(availablePermissions)
          .flat()
          .map(p => p.value);
      } else if (selectedUser.value.role === 'staff') {
        selectedUser.value.permissions = [
          'products:view', 'products:create', 'products:update',
          'categories:view', 'categories:create', 'categories:update',
          'orders:view', 'orders:update',
          'customers:view', 'customers:update',
          'reports:view'
        ];
      } else {
        selectedUser.value.permissions = ['products:view', 'categories:view'];
      }
    };

    // Hàm lưu phân quyền
    const savePermissions = async () => {
      if (!selectedUser.value) return;

      savingPermissions.value = true;
      try {
        await userService.updateUserPermissions(selectedUser.value.id, {
          role: selectedUser.value.role,
          permissions: selectedUser.value.permissions
        });
        showSnackbar('Cập nhật phân quyền thành công', 'success');
        permissionsDialog.value = false;
        fetchUsers();
      } catch (error) {
        console.error('Error saving permissions:', error);
        showSnackbar('Không thể cập nhật phân quyền', 'error');
      } finally {
        savingPermissions.value = false;
      }
    };

    // Hàm xác nhận xóa người dùng
    const confirmDelete = (user) => {
      selectedUser.value = user;
      deleteDialog.value = true;
    };

    // Hàm xóa người dùng
    const deleteUser = async () => {
      if (!selectedUser.value) return;

      deleting.value = true;
      try {
        await userService.deleteUser(selectedUser.value.id);
        showSnackbar('Xóa người dùng thành công', 'success');
        deleteDialog.value = false;
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showSnackbar('Không thể xóa người dùng', 'error');
      } finally {
        deleting.value = false;
      }
    };

    // Hàm chuyển đổi trạng thái người dùng
    const toggleUserStatus = (user) => {
      selectedUser.value = user;
      statusDialog.value = true;
    };

    // Hàm xác nhận chuyển đổi trạng thái
    const confirmToggleStatus = async () => {
      if (!selectedUser.value) return;

      togglingStatus.value = true;
      try {
        const newStatus = selectedUser.value.status === 'active' ? 'inactive' : 'active';
        await userService.updateUserStatus(selectedUser.value.id, newStatus);
        showSnackbar(`${newStatus === 'active' ? 'Mở khóa' : 'Khóa'} tài khoản thành công`, 'success');
        statusDialog.value = false;
        fetchUsers();
      } catch (error) {
        console.error('Error toggling user status:', error);
        showSnackbar(`Không thể ${selectedUser.value.status === 'active' ? 'khóa' : 'mở khóa'} tài khoản`, 'error');
      } finally {
        togglingStatus.value = false;
      }
    };

    // Hàm xóa khoảng thời gian
    const clearDateRange = () => {
      filters.dateRange = [];
      handleFilter();
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = () => {
      tableOptions.value.page = 1;
      fetchUsers();
    };

    // Hàm xử lý lọc
    const handleFilter = () => {
      tableOptions.value.page = 1;
      fetchUsers();
    };

    // Hàm lấy màu vai trò
    const getRoleColor = (role) => {
      switch (role) {
        case 'admin':
          return 'primary';
        case 'staff':
          return 'success';
        default:
          return 'grey';
      }
    };

    // Hàm lấy text vai trò
    const getRoleText = (role) => {
      switch (role) {
        case 'admin':
          return 'Quản trị viên';
        case 'staff':
          return 'Nhân viên';
        default:
          return 'Người dùng';
      }
    };

    // Hàm lấy màu trạng thái
    const getStatusColor = (status) => {
      return status === 'active' ? 'success' : 'error';
    };

    // Hàm lấy text trạng thái
    const getStatusText = (status) => {
      return status === 'active' ? 'Đang hoạt động' : 'Đã khóa';
    };

    // Hàm lấy tên module
    const getModuleName = (module) => {
      switch (module) {
        case 'products':
          return 'Sản phẩm';
        case 'categories':
          return 'Danh mục';
        case 'orders':
          return 'Đơn hàng';
        case 'customers':
          return 'Khách hàng';
        case 'users':
          return 'Người dùng';
        case 'reports':
          return 'Báo cáo';
        case 'settings':
          return 'Cài đặt';
        default:
          return module;
      }
    };

    // Hàm hiển thị snackbar
    const showSnackbar = (text, color = 'success') => {
      snackbar.value = {
        show: true,
        text,
        color
      };
    };

    // Theo dõi thay đổi tùy chọn bảng
    watch(tableOptions, () => {
      fetchUsers();
    }, { deep: true });

    onMounted(() => {
      fetchUsers();
    });

    return {
      headers,
      users,
      selectedUser,
      totalUsers,
      loading,
      saving,
      deleting,
      savingPermissions,
      togglingStatus,
      userDialog,
      permissionsDialog,
      deleteDialog,
      statusDialog,
      dateMenu,
      userForm,
      userFormValid,
      isEditing,
      filters,
      tableOptions,
      roleOptions,
      statusOptions,
      userData,
      availablePermissions,
      snackbar,
      dateRangeText,
      openUserDialog,
      closeUserDialog,
      handleAvatarChange,
      saveUser,
      openPermissionsDialog,
      handleRoleChange,
      savePermissions,
      confirmDelete,
      deleteUser,
      toggleUserStatus,
      confirmToggleStatus,
      clearDateRange,
      handleSearch,
      handleFilter,
      getRoleColor,
      getRoleText,
      getStatusColor,
      getStatusText,
      getModuleName,
      formatDate
    };
  }
};
</script>

<style scoped>
.user-view {
  padding: 20px;
}
</style> 