<template>
  <div class="category-list">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Danh mục sản phẩm</span>
        <v-btn color="primary" @click="openDialog()">
          <v-icon left>mdi-plus</v-icon>
          Thêm danh mục
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="categories"
          :loading="loading"
          :search="search"
          class="elevation-1"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Tìm kiếm"
                single-line
                hide-details
                class="mx-4"
              ></v-text-field>
            </v-toolbar>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="item.status === 'ACTIVE' ? 'success' : 'grey'"
              small
            >
              {{ item.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động' }}
            </v-chip>
          </template>

          <template v-slot:item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="openDialog(item)">
              mdi-pencil
            </v-icon>
            <v-icon small @click="confirmDelete(item)">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog for creating/editing category -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.name"
                  label="Tên danh mục"
                  :rules="[v => !!v || 'Tên danh mục là bắt buộc']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.slug"
                  label="Slug"
                  :rules="[v => !!v || 'Slug là bắt buộc']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.description"
                  label="Mô tả"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
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
          <v-btn color="grey darken-1" text @click="closeDialog">
            Hủy
          </v-btn>
          <v-btn color="primary" text @click="save">
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for confirming deletion -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Xác nhận xóa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa danh mục "{{ editedItem.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="deleteDialog = false">
            Hủy
          </v-btn>
          <v-btn color="error" text @click="deleteItem">
            Xóa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { categoryService } from '@/api/services/categoryService';

export default {
  name: 'CategoryList',
  setup() {
    const loading = ref(false);
    const search = ref('');
    const dialog = ref(false);
    const deleteDialog = ref(false);
    const categories = ref([]);
    const editedIndex = ref(-1);
    const editedItem = ref({
      name: '',
      slug: '',
      description: '',
      status: 'ACTIVE'
    });
    const defaultItem = {
      name: '',
      slug: '',
      description: '',
      status: 'ACTIVE'
    };

    const headers = [
      { text: 'Tên danh mục', value: 'name' },
      { text: 'Slug', value: 'slug' },
      { text: 'Trạng thái', value: 'status' },
      { text: 'Ngày tạo', value: 'createdAt' },
      { text: 'Thao tác', value: 'actions', sortable: false }
    ];

    const statusOptions = [
      { text: 'Đang hoạt động', value: 'ACTIVE' },
      { text: 'Không hoạt động', value: 'INACTIVE' }
    ];

    const formTitle = computed(() => {
      return editedIndex.value === -1 ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục';
    });

    const formatDate = (date) => {
      return new Date(date).toLocaleString('vi-VN');
    };

    const fetchCategories = async () => {
      loading.value = true;
      try {
        const response = await categoryService.getCategories();
        categories.value = response;
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        loading.value = false;
      }
    };

    const openDialog = (item) => {
      editedIndex.value = categories.value.indexOf(item);
      editedItem.value = Object.assign({}, item);
      dialog.value = true;
    };

    const closeDialog = () => {
      dialog.value = false;
      editedIndex.value = -1;
      editedItem.value = Object.assign({}, defaultItem);
    };

    const save = async () => {
      try {
        if (editedIndex.value > -1) {
          await categoryService.updateCategory(editedItem.value.id, editedItem.value);
          Object.assign(categories.value[editedIndex.value], editedItem.value);
        } else {
          const response = await categoryService.createCategory(editedItem.value);
          categories.value.push(response);
        }
        closeDialog();
      } catch (error) {
        console.error('Error saving category:', error);
      }
    };

    const confirmDelete = (item) => {
      editedIndex.value = categories.value.indexOf(item);
      editedItem.value = Object.assign({}, item);
      deleteDialog.value = true;
    };

    const deleteItem = async () => {
      try {
        await categoryService.deleteCategory(editedItem.value.id);
        categories.value.splice(editedIndex.value, 1);
        deleteDialog.value = false;
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    };

    // Fetch categories when component is mounted
    fetchCategories();

    return {
      loading,
      search,
      dialog,
      deleteDialog,
      headers,
      categories,
      editedIndex,
      editedItem,
      statusOptions,
      formTitle,
      formatDate,
      openDialog,
      closeDialog,
      save,
      confirmDelete,
      deleteItem
    };
  }
};
</script>

<style scoped>
.category-list {
  padding: 20px;
}
</style> 