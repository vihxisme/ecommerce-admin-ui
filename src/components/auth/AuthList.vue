<template>
  <div class="auth-list">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Quản lý người dùng</span>
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          Thêm người dùng
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="users"
          :loading="loading"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.roles="{ item }">
            <v-chip
              v-for="role in item.roles"
              :key="role"
              :color="getRoleColor(role)"
              small
              class="mr-1"
            >
              {{ role }}
            </v-chip>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              small
            >
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:item.lastLogin="{ item }">
            {{ formatDate(item.lastLogin) }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon small class="mr-2" @click="viewDetails(item)">
              mdi-eye
            </v-icon>
            <v-icon small @click="deleteItem(item)">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog for creating/editing user -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedIndex === -1 ? 'Thêm người dùng' : 'Chỉnh sửa người dùng' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.username"
                  label="Tên đăng nhập"
                  :disabled="editedIndex !== -1"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.email"
                  label="Email"
                  type="email"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="editedIndex === -1">
                <v-text-field
                  v-model="editedItem.password"
                  label="Mật khẩu"
                  type="password"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.roles"
                  :items="availableRoles"
                  label="Vai trò"
                  multiple
                  chips
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.status"
                  :items="statusOptions"
                  label="Trạng thái"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close">
            Hủy
          </v-btn>
          <v-btn color="blue darken-1" text @click="save">
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for viewing user details -->
    <v-dialog v-model="detailsDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Chi tiết người dùng</span>
        </v-card-title>

        <v-card-text>
          <v-container v-if="selectedUser">
            <v-row>
              <v-col cols="12" sm="6">
                <h3>{{ selectedUser.username }}</h3>
                <p>Email: {{ selectedUser.email }}</p>
                <p>Vai trò: 
                  <v-chip
                    v-for="role in selectedUser.roles"
                    :key="role"
                    :color="getRoleColor(role)"
                    small
                    class="mr-1"
                  >
                    {{ role }}
                  </v-chip>
                </p>
                <p>Trạng thái: 
                  <v-chip
                    :color="getStatusColor(selectedUser.status)"
                    small
                  >
                    {{ selectedUser.status }}
                  </v-chip>
                </p>
                <p>Đăng nhập lần cuối: {{ formatDate(selectedUser.lastLogin) }}</p>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <h4 class="mb-3">Lịch sử hoạt động</h4>
            <v-data-table
              :headers="activityHeaders"
              :items="userActivity"
              :loading="activityLoading"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.timestamp="{ item }">
                {{ formatDate(item.timestamp) }}
              </template>
              <template v-slot:item.action="{ item }">
                <v-chip
                  :color="getActivityColor(item.action)"
                  small
                >
                  {{ item.action }}
                </v-chip>
              </template>
            </v-data-table>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="detailsDialog = false">
            Đóng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for confirming deletion -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Xác nhận xóa người dùng?</v-card-title>

        <v-card-text>
          Bạn có chắc chắn muốn xóa người dùng "{{ selectedUser?.username }}"?
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">
            Hủy
          </v-btn>
          <v-btn color="error" text @click="confirmDelete">
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { authService } from '@/api/services/authService';

export default {
  name: 'AuthList',
  setup() {
    const loading = ref(false);
    const activityLoading = ref(false);
    const users = ref([]);
    const userActivity = ref([]);
    const dialog = ref(false);
    const detailsDialog = ref(false);
    const deleteDialog = ref(false);
    const editedIndex = ref(-1);
    const selectedUser = ref(null);

    const defaultItem = {
      username: '',
      email: '',
      password: '',
      roles: [],
      status: 'ACTIVE'
    };

    const editedItem = ref({ ...defaultItem });

    const headers = [
      { text: 'Tên đăng nhập', value: 'username' },
      { text: 'Email', value: 'email' },
      { text: 'Vai trò', value: 'roles' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Đăng nhập lần cuối', value: 'lastLogin' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ];

    const activityHeaders = [
      { text: 'Thời gian', value: 'timestamp' },
      { text: 'Hành động', value: 'action' },
      { text: 'Chi tiết', value: 'details' },
      { text: 'IP', value: 'ipAddress' }
    ];

    const availableRoles = [
      'ADMIN',
      'MANAGER',
      'STAFF',
      'CUSTOMER'
    ];

    const statusOptions = [
      { text: 'Hoạt động', value: 'ACTIVE' },
      { text: 'Khóa', value: 'LOCKED' },
      { text: 'Vô hiệu hóa', value: 'DISABLED' }
    ];

    const getRoleColor = (role) => {
      const colors = {
        ADMIN: 'error',
        MANAGER: 'warning',
        STAFF: 'info',
        CUSTOMER: 'success'
      };
      return colors[role] || 'grey';
    };

    const getStatusColor = (status) => {
      const colors = {
        ACTIVE: 'success',
        LOCKED: 'error',
        DISABLED: 'grey'
      };
      return colors[status] || 'grey';
    };

    const getActivityColor = (action) => {
      const colors = {
        LOGIN: 'success',
        LOGOUT: 'grey',
        CREATE: 'primary',
        UPDATE: 'info',
        DELETE: 'error'
      };
      return colors[action] || 'grey';
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('vi-VN');
    };

    const fetchUsers = async () => {
      loading.value = true;
      try {
        const response = await authService.getAllUsers();
        users.value = response;
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        loading.value = false;
      }
    };

    const openCreateDialog = () => {
      editedItem.value = { ...defaultItem };
      editedIndex.value = -1;
      dialog.value = true;
    };

    const editItem = (item) => {
      editedIndex.value = users.value.indexOf(item);
      editedItem.value = { ...item };
      dialog.value = true;
    };

    const close = () => {
      dialog.value = false;
      editedItem.value = { ...defaultItem };
      editedIndex.value = -1;
    };

    const save = async () => {
      try {
        if (editedIndex.value > -1) {
          await authService.updateUser(editedItem.value.id, editedItem.value);
        } else {
          await authService.createUser(editedItem.value);
        }
        await fetchUsers();
        close();
      } catch (error) {
        console.error('Error saving user:', error);
      }
    };

    const deleteItem = (item) => {
      selectedUser.value = item;
      deleteDialog.value = true;
    };

    const confirmDelete = async () => {
      try {
        await authService.deleteUser(selectedUser.value.id);
        await fetchUsers();
        deleteDialog.value = false;
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    };

    const viewDetails = async (item) => {
      selectedUser.value = item;
      activityLoading.value = true;
      try {
        const response = await authService.getUserActivity(item.id);
        userActivity.value = response;
        detailsDialog.value = true;
      } catch (error) {
        console.error('Error fetching user activity:', error);
      } finally {
        activityLoading.value = false;
      }
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      loading,
      activityLoading,
      users,
      userActivity,
      headers,
      activityHeaders,
      dialog,
      detailsDialog,
      deleteDialog,
      editedIndex,
      editedItem,
      selectedUser,
      availableRoles,
      statusOptions,
      getRoleColor,
      getStatusColor,
      getActivityColor,
      formatDate,
      openCreateDialog,
      editItem,
      close,
      save,
      deleteItem,
      confirmDelete,
      viewDetails
    };
  }
};
</script>

<style scoped>
.auth-list {
  padding: 20px;
}
</style> 