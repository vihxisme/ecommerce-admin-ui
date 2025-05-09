<template>
  <v-container>
    <v-snackbar v-model="notiShow" :timeout="5000" location="top right" :color="notiColor">{{ notiContent
    }}</v-snackbar>
    <!-- Header với tìm kiếm và nút thêm mới -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Tìm kiếm sản phẩm" variant="outlined"
          hide-details class="search-field"></v-text-field>
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end">
        <v-btn color="info" prepend-icon="mdi-file-export" class="mr-2" @click="exportProducts">
          Export
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog">
          Thêm sản phẩm
        </v-btn>
      </v-col>
    </v-row>

    <!-- Bộ lọc -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-select v-model="filters.category" :items="categories" label="Danh mục" variant="outlined" clearable
          hide-details></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-select v-model="filters.status" :items="statuses" item-title="status" item-value="key" label="Trạng thái"
          variant="outlined" clearable hide-details return-value></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-select v-model="filters.sortBy" :items="sortOptions" label="Sắp xếp" variant="outlined"
          hide-details></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-select v-model="filters.itemsPerPage" :items="[10, 25, 50, 100]" label="Số lượng mỗi trang"
          variant="outlined" hide-details></v-select>
      </v-col>
    </v-row>

    <!-- Bảng sản phẩm -->
    <v-card>
      <v-data-table-server :headers="headers" :items="filteredProducts" :loading="loading"
        :items-per-page="filters.itemsPerPage" :items-length="totalItems" :search="search"
        @update:options="updateOptions" loading-text="Đang tải dữ liệu...">
        <template v-slot:item.productImageUrl="{ item }">
          <v-avatar size="40">
            <v-img :src="getCloudinaryUrl(item.productImageUrl)" :lazy-src="image_error" />
          </v-avatar>
        </template>

        <template v-slot:item.name="{ item }">
          <p class="text-left">{{ item.name }}</p>
        </template>

        <template v-slot:item.price="{ item }">
          {{ formatCurrency(item.price) }}
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small">
            {{ exportStatus(item.status) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-eye" variant="text" color="primary" @click="showDetail(item)"></v-btn>
          <v-btn icon="mdi-pencil" variant="text" color="warning" @click="showEditDialog(item)"></v-btn>
          <v-btn icon="mdi-delete" variant="text" color="error" @click="showDeleteDialog(item)"></v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Dialog thêm sản phẩm -->
    <v-dialog v-model="productDialog" max-width="1000">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ 'Thêm sản phẩm' }}</span>
          <v-btn icon="mdi-close" variant="text" @click="closeProductDialog"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-form ref="form" v-model="valid">
            <v-tabs v-model="tabIndex" color="primary" class="border-b">
              <v-tab v-for="(tab, index) in tabTitle" :key="index" class="capitalize flex-grow">
                {{ tab }}
              </v-tab>
            </v-tabs>
            <v-container v-if="tabIndex === 0" fluid>
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="editedItem.name" label="Tên sản phẩm"
                    :rules="[v => !!v || 'Tên sản phẩm là bắt buộc']" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="editedItem.category" :items="categoriesDialog" item-title="name" item-value="key"
                    label="Danh mục" :rules="[v => !!v || 'Danh mục là bắt buộc']" clearable required
                    return-value></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.price" label="Giá" type="number" prefix="VND"
                    :rules="[v => !!v || 'Giá là bắt buộc']" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="editedItem.brand" label="Thương hiệu"
                    :rules="[v => !!v || 'Thương hiệu là bắt buộc']" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="editedItem.status" :items="statuses" item-title="status" item-value="key"
                    label="Trạng thái" :rules="[v => !!v || 'Trạng thái là bắt buộc']" required return-value></v-select>
                </v-col>
                <v-col cols="12">
                  <v-file-input v-model="editedItem.imageFile" type="file" ref="fileInput" accept="image/*"
                    style="display: none;" @change="handleImageChange" />

                  <!-- Custom image selector -->
                  <v-sheet class="d-flex align-center justify-center rounded-lg" elevation="2" height="200" width="20%"
                    color="grey-lighten-3" style="cursor: pointer; position: relative;" @click="triggerFileInput">
                    <!-- Hiển thị ảnh đã chọn -->
                    <v-img v-if="selectedImage" :src="selectedImage" height="100%" width="100%" cover
                      class="rounded-lg"></v-img>

                    <!-- Hiện icon khi chưa có ảnh -->

                    <div v-else class="flex flex-col">
                      <v-icon size="2rem" color="grey">mdi-camera</v-icon>
                      <span class="text-xs mx-2">Thêm ảnh</span>
                    </div>

                    <!-- Nút xóa ảnh -->
                    <v-btn v-if="selectedImage" icon color="error" size="x-small" variant="flat"
                      style="position: absolute; top: 4px; right: 4px; z-index: 2;" @click.stop="removeImage">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-container>
            <v-container v-if="tabIndex === 1">
              <div class="border ma-2">
                <v-card-title>Chọn màu sắc</v-card-title>
                <v-divider></v-divider>
                <v-text-field v-model="searchQuery" label="Tìm màu" prepend-inner-icon="mdi-magnify" hide-details dense
                  clearable class="mb-2" />
                <v-row>
                  <v-col cols="3" v-for="color in filteredColors" :key="color.id">
                    <v-checkbox v-model="variant.color" :label="color.name" :value="color.id"
                      style="padding: 0; margin: 0; height: 40px;" color="success" ripple />
                  </v-col>
                </v-row>
              </div>
              <div class="border ma-2">
                <v-card-title>Chọn kích cỡ</v-card-title>
                <v-divider></v-divider>
                <!-- <v-text-field v-model="searchQuery" label="Tìm màu" prepend-inner-icon="mdi-magnify" hide-details dense
                  clearable class="mb-2" /> -->
                <v-row>
                  <v-col cols="2" v-for="size in sizes" :key="size.id">
                    <v-checkbox v-model="variant.size" :label="size.name" :value="size.id"
                      style="padding: 0; margin: 0; height: 40px;" color="success" ripple />
                  </v-col>
                </v-row>
              </div>
              <div class="border ma-2">
                <v-card-title>Ảnh cho từng màu sản phẩm đã chọn</v-card-title>
                <v-divider></v-divider>
                <v-row>
                  <v-col v-for="colorId in variant.color" :key="colorId" cols="3">
                    <v-file-input type="file" :ref="setFileInputRef(colorId)" accept="image/*" style="display: none;"
                      @change="event => handleImageChangeVariant(event, colorId)" />
                    <v-sheet class="d-flex align-center justify-center rounded-lg" elevation="2" height="200"
                      color="grey-lighten-3" style="cursor: pointer; position: relative;"
                      @click="triggerFileInputVariant(colorId)">
                      <!-- Nếu có ảnh -->
                      <v-img v-if="variantImageMap[colorId]" :src="variantImageMap[colorId].url" height="100%"
                        width="100%" cover class="rounded-lg"></v-img>

                      <!-- Nếu chưa có ảnh -->
                      <div v-else class="flex flex-col">
                        <v-icon size="2rem" color="grey">mdi-camera</v-icon>
                        <span class="text-xs mx-2">Thêm ảnh</span>
                      </div>

                      <!-- Nút xóa ảnh -->
                      <v-btn v-if="variantImageMap[colorId]" icon color="error" size="x-small" variant="flat"
                        style="position: absolute; top: 4px; right: 4px; z-index: 2;"
                        @click.stop="removeImageVariant(colorId)">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </v-sheet>

                    <!-- Hiển thị tên màu -->
                    <div class="text-center mt-1 text-sm">
                      {{colors.find(c => c.id === colorId)?.name || 'Màu'}}
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-container>
            <v-container v-if="tabIndex === 2" fluid>
              <v-card-title>Ảnh sản phẩm</v-card-title>
              <v-divider></v-divider>
              <v-row>
                <v-col v-for="(imageObj, index) in dynamicImages" :key="index" cols="3">
                  <v-file-input type="file" :ref="setDynamicFileInputRef(index)" accept="image/*" style="display: none;"
                    @change="event => handleDynamicImageChange(event, index)" />
                  <v-sheet class="d-flex align-center justify-center rounded-lg" elevation="2" height="200"
                    color="grey-lighten-3" style="cursor: pointer; position: relative;"
                    @click="triggerDynamicFileInput(index)">
                    <!-- Nếu có ảnh -->
                    <v-img v-if="imageObj.url" :src="imageObj.url" height="100%" width="100%" cover
                      class="rounded-lg"></v-img>

                    <!-- Nếu chưa có ảnh -->
                    <div v-else class="flex flex-col">
                      <v-icon size="2rem" color="grey">mdi-camera</v-icon>
                      <span class="text-xs mx-2">Thêm ảnh</span>
                    </div>

                    <!-- Nút xóa ảnh -->
                    <v-btn v-if="variantImageMap[colorId]" icon color="error" size="x-small" variant="flat"
                      style="position: absolute; top: 4px; right: 4px; z-index: 2;"
                      @click.stop="removeDynamicImage(index)">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-container>
            <v-container v-if="tabIndex === 3">
              <v-card-title>Mô tả sản phẩm</v-card-title>
              <v-divider />
              <div v-for="(desc, index) in descriptions" :key="index" class="mb-4 mt-4 pt-4 position-relative">
                <v-text-field v-model="desc.title" label="Tiêu đề" />
                <v-textarea v-model="desc.content" label="Mô tả" />
                <v-btn color="error" size="x-small" variant="outlined" class="position-absolute"
                  style="bottom: 1px; right: 0;" @click="removeDescription(index)">Xóa
                </v-btn>
                <v-divider></v-divider>
              </div>
              <v-btn class="mt-4 mb-4" color="primary" prepend-icon="mdi-plus" @click="addDescription" flat>Thêm
                mới</v-btn>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="closeProductDialog">Hủy</v-btn>
          <v-btn color="primary" @click="saveProduct" :loading="loading">
            {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog sửa sản phẩm -->
    <v-dialog v-model="updateDialog" max-width="1000">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ 'Cập nhập sản phẩm #' + updateItem.productCode }}</span>
          <v-btn icon="mdi-close" variant="text" @click="closeUpdateDialog"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-tabs v-model="tabIndex" color="primary" class="border-b">
            <v-tab v-for="(tab, index) in tabTitle" :key="index" class="capitalize flex-grow">
              {{ tab }}
            </v-tab>
          </v-tabs>
          <v-container v-if="tabIndex === 0" fluid>
            <v-form ref="formUpdate" v-model="valid">
              <v-row>
                <v-col cols="12">
                  <v-text-field v-model="updateItem.name" label="Tên sản phẩm"
                    :rules="[v => !!v || 'Tên sản phẩm là bắt buộc']" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="updateItem.categorieId" :items="categoriesDialog" item-title="name"
                    item-value="key" label="Danh mục" :rules="[v => !!v || 'Danh mục là bắt buộc']" clearable required
                    return-value></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="updateItem.price" label="Giá" type="number" prefix="VND"
                    :rules="[v => !!v || 'Giá là bắt buộc']" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="updateItem.brand" label="Thương hiệu"
                    :rules="[v => !!v || 'Thương hiệu là bắt buộc']" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="updateItem.status" :items="statuses" item-title="status" item-value="key"
                    label="Trạng thái" :rules="[v => !!v || 'Trạng thái là bắt buộc']" required return-value></v-select>
                </v-col>
                <v-col cols="12">
                  <v-file-input v-model="updateItem.imageFile" type="file" ref="fileInputUpdate" accept="image/*"
                    style="display: none;" @change="handleImageChangeUpdate" />

                  <!-- Custom image selector -->
                  <v-sheet class="d-flex align-center justify-center rounded-lg" elevation="2" height="200" width="20%"
                    color="grey-lighten-3" style="cursor: pointer; position: relative;" @click="triggerFileInputUpdate">
                    <!-- Hiển thị ảnh đã chọn -->
                    <v-img v-if="selectedImageUpdate" :src="selectedImageUpdate" height="100%" width="100%" cover
                      class="rounded-lg"></v-img>
                    <!-- <v-img v-else-if="updateItem.image" :src="getCloudinaryUrl(updateItem.image)" height="100%"
                      width="100%" cover class="rounded-lg"></v-img> -->

                    <!-- Hiện icon khi chưa có ảnh -->

                    <div v-else class="flex flex-col">
                      <v-icon size="2rem" color="grey">mdi-camera</v-icon>
                      <span class="text-xs mx-2">Thêm ảnh</span>
                    </div>

                    <!-- Nút xóa ảnh -->
                    <v-btn v-if="updateItem.imageFile" icon color="error" size="x-small" variant="flat"
                      style="position: absolute; top: 4px; right: 4px; z-index: 2;" @click.stop="removeImageUpdate">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-sheet>
                </v-col>
              </v-row>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" @click="updateDialog = false">Hủy</v-btn>
                <v-btn color="primary" @click="updateProduct" :loading="loading">
                  {{ 'Cập nhật' }}
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-container>
          <v-container v-if="tabIndex === 1">
            <v-data-table-virtual :headers="updateVariantHeader" :items="updateVariant" :height="300"
              hide-default-footer fixed-header>
              <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-pencil" variant="text" color="warning"></v-btn>
                <v-btn icon="mdi-delete" variant="text" color="error"></v-btn>
              </template>
            </v-data-table-virtual>
          </v-container>
          <v-container v-if="tabIndex === 2" fluid>
            <v-card-title>Ảnh sản phẩm</v-card-title>
            <v-divider></v-divider>
            <v-row>
              <v-col v-for="(imageObj, index) in updateDynamicImages" :key="index" cols="3">
                <v-file-input type="file" :ref="setDynamicFileInputRef(index)" accept="image/*" style="display: none;"
                  @change="event => handleDynamicImageChange(event, index)" />
                <v-sheet class="d-flex align-center justify-center rounded-lg" elevation="2" height="200"
                  color="grey-lighten-3" style="cursor: pointer; position: relative;"
                  @click="triggerDynamicFileInput(index)">
                  <!-- Nếu có ảnh -->
                  <v-img v-if="imageObj.url" :src="getCloudinaryUrl(imageObj.url)" height="100%" width="100%" cover
                    class="rounded-lg"></v-img>

                  <!-- Nếu chưa có ảnh -->
                  <div v-else class="flex flex-col">
                    <v-icon size="2rem" color="grey">mdi-camera</v-icon>
                    <span class="text-xs mx-2">Thêm ảnh</span>
                  </div>

                  <!-- Nút xóa ảnh -->
                  <v-btn v-if="variantImageMap[colorId]" icon color="error" size="x-small" variant="flat"
                    style="position: absolute; top: 4px; right: 4px; z-index: 2;"
                    @click.stop="removeDynamicImage(index)">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-sheet>
              </v-col>
            </v-row>
          </v-container>
          <v-container v-if="tabIndex === 3">
            <v-card-title>Mô tả sản phẩm</v-card-title>
            <v-divider />
            <div v-for="(desc, index) in updateDescription" :key="index" class="mb-4 mt-4 pt-4 position-relative">
              <v-text-field v-model="desc.title" label="Tiêu đề" />
              <v-textarea v-model="desc.content" label="Mô tả" />
              <v-btn color="error" size="x-small" variant="outlined" class="position-absolute"
                style="bottom: 1px; right: 0;" @click="removeDescription">Xóa
              </v-btn>
              <v-divider></v-divider>
            </div>
            <v-btn class="mt-4 mb-4" color="primary" prepend-icon="mdi-plus" @click="addDescription" flat>Thêm
              mới</v-btn>
            <!-- <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" @click="closeUpdateDialog">Hủy</v-btn>
                <v-btn color="primary" @click="saveProduct" :loading="loading">
                  {{ 'Cập nhật' }}
                </v-btn>
              </v-card-actions> -->
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog xóa -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Xác nhận xóa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa sản phẩm "{{ editedItem.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="deleteDialog = false">Hủy</v-btn>
          <v-btn color="error" @click="deleteProduct" :loading="loading">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog chi tiết -->
    <v-dialog v-model="detailDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Chi tiết sản phẩm</span>
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12" md="4" class="text-center">
              <v-img :src="getCloudinaryUrl(selectedProduct.productImageUrl)" :lazy-src="image_error"></v-img>
            </v-col>
            <v-col cols="12" md="8">
              <v-list>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Mã sản phẩm</v-list-item-title>
                  <v-list-item-title>{{ selectedProduct.productCode }}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Tên</v-list-item-title>
                  <v-list-item-title>{{ selectedProduct.name }}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Danh mục</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedProduct.categoryName }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Giá</v-list-item-title>
                  <v-list-item-subtitle>{{ formatCurrency(selectedProduct.price) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">Trạng thái</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip :color="getStatusColor(selectedProduct.status)" size="small">
                      {{ selectedProduct.status }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title class="bg-gray-0038">Ảnh sản phẩm</v-expansion-panel-title>
              <v-expansion-panel-text v-if="!detailImages.length">
                Đang tải dữ liệu...
              </v-expansion-panel-text>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="4" v-for="(item, index) in detailImages" :key="index"
                    class="d-flex justify-center align-center">
                    <v-avatar size="130" tile>
                      <v-img :src="getCloudinaryUrl(item)" :lazy-src="image_error" cover />
                    </v-avatar>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title class="bg-gray-0038">Màu sắc và kích thước</v-expansion-panel-title>
              <v-expansion-panel-text v-if="!detailVariants.length">
                Đang tải dữ liệu...
              </v-expansion-panel-text>
              <v-expansion-panel-text v-else>
                <v-data-table :headers="detailVariantsHeader" :items="detailVariants" hide-default-footer>
                  <template v-slot:item.colorImageUrl="{ item }">
                    <v-avatar size="40" class="shadow">
                      <v-img :src="getCloudinaryUrl(item.colorImageUrl)" :lazy-src="image_error" />
                    </v-avatar>
                  </template>
                </v-data-table>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title class="bg-gray-0038">Mô tả sản phẩm</v-expansion-panel-title>
              <v-expansion-panel-text v-if="!detailDescription.length">
                Đang tải dữ liệu...
              </v-expansion-panel-text>
              <v-expansion-panel-text v-else>
                <v-card-text v-for="(des, index) in detailDescription" :key="index">
                  <h4>{{ des.attributeName }}</h4>
                  <p>{{ des.attributeValue }}</p>
                </v-card-text>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import * as XLSX from 'xlsx';
import { productService } from '../../api/services/productService';
import { getCloudinaryUrl } from '../../utils/cloudinary';
import { formatCurrency } from '../../utils/api';
import { categoryService } from '../../api/services/categoryService';
import image_error from "../../assets/image_error.png";
import { color } from 'echarts';
import { uploadImageToCloudinary } from '../../api/services/cloudinaryService';


export default {
  name: 'ProductList',
  setup() {
    const search = ref('');
    const page = ref(1);
    const totalItems = ref(0);
    const loading = ref(false);
    const valid = ref(false);
    const productDialog = ref(false);
    const updateDialog = ref(false);
    const deleteDialog = ref(false);
    const detailDialog = ref(false);
    const isEdit = ref(false);
    const imagePreview = ref(null);
    const fileInput = ref(null);
    const selectedImage = ref(null);
    const notiShow = ref(false);
    const notiColor = ref();
    const notiContent = ref();
    const footerProps = reactive({
      itemsPerPageText: 'Số mục mỗi trang',
      itemsPerPageOptions: [10, 25, 50, 100, { text: 'Tất cả', value: -1 }],
    });



    const tabIndex = ref(0);
    const tabTitle = ref(["Sản phẩm", "Biến thể", "Hình ảnh", "Mô tả"]);

    const filters = reactive({
      category: null,
      status: null,
      sortBy: 'name',
      itemsPerPage: 10
    });

    const selectedProduct = ref();

    const editedItem = reactive({
      id: null,
      name: '',
      category: null,
      price: 0,
      brand: '',
      status: '',
      image: '',
      imageFile: null
    });

    const defaultItem = {
      id: null,
      name: '',
      category: '',
      price: 0,
      status: '',
      image: '',
      imageFile: null
    };

    const updateItem = reactive({
      id: null,
      productCode: null,
      name: '',
      categorieId: null,
      price: 0,
      brand: '',
      status: '',
      image: '',
      imageFile: null
    });

    const defaultUpdateItem = {
      id: null,
      productCode: null,
      name: '',
      categorieId: null,
      price: 0,
      brand: '',
      status: '',
      image: '',
      imageFile: null
    };

    const variant = reactive({
      color: [],
      size: [],
    });

    const defaultVariant = reactive({
      color: [],
      size: [],
    });

    const colors = ref([]);
    const sizes = ref([]);

    const headers = [
      { title: 'Hình ảnh', key: 'productImageUrl', align: 'center', sortable: false, },
      { title: 'Tên sản phẩm', key: 'name', align: 'center', width: '300px' },
      { title: 'Mã sản phẩm', key: 'productCode', align: 'center' },
      { title: 'Danh mục', key: 'categoryName', align: 'center', },
      { title: 'Giá', key: 'price', align: 'center', },
      { title: 'Trạng thái', key: 'status', align: 'center', },
      { title: 'Thao tác', key: 'actions', align: 'center', sortable: false }
    ];

    const categories = ref([]);
    const categoriesDialog = ref([]);
    const statuses = [
      { key: "ACTIVE", status: "Hoạt động" },
      { key: "INACTIVE", status: "Không hoạt động" },
      { key: "OUT_OF_STOCK", status: "Hết hàng" }];
    const sortOptions = [
      { title: 'Tên A-Z', value: 'name' },
      { title: 'Tên Z-A', value: '-name' },
      { title: 'Giá tăng dần', value: 'price' },
      { title: 'Giá giảm dần', value: '-price' },
    ];

    const products = ref([]);

    const fileRules = [
      value => {
        if (!value) return true;
        return value.size <= 2000000 || 'Kích thước file không được vượt quá 2MB';
      }
    ];

    const fetchProducts = async () => {
      try {
        loading.value = true;
        const request = {
          page: page.value - 1,
          size: filters.itemsPerPage
        };
        const res = await productService.getProductsByPagination(request);
        products.value = res.data.data.content;
        totalItems.value = res.data.data.totalElements;
        console.log("res: ", res.data)
        loading.value = false;
      } catch (error) {
        loading.value = false;
        console.error('Error fetching products:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategoryAll();
        const data = res.data.data;

        categories.value = data.map(item => item.name);
        categoriesDialog.value = data.map(item => ({ key: item.id, name: item.name }));
        console.log("categoriesDialog: ", categoriesDialog.value);
        console.log("categoriesDialog[3]: ", categoriesDialog.value[3]);
      } catch (error) {
        console.log("Error fetchCategories: ", error);
      }
    }

    const filteredProducts = computed(() => {
      let result = [...products.value];

      if (filters.category) {
        result = result.filter(item => item.categoryName === filters.category);
      }

      if (filters.status) {
        result = result.filter(item => item.status === filters.status);
      }

      if (filters.sortBy) {
        const [key, order] = filters.sortBy.startsWith('-')
          ? [filters.sortBy.slice(1), -1]
          : [filters.sortBy, 1];

        result.sort((a, b) => {
          if (key === 'price' || key === 'stock') {
            return (a[key] - b[key]) * order;
          }
          return a[key].localeCompare(b[key]) * order;
        });
      }

      return result;
    });

    const getStockColor = stock => {
      if (stock > 70) return 'success';
      if (stock > 30) return 'warning';
      return 'error';
    };

    const getStatusColor = status => {
      switch (status) {
        case 'ACTIVE':
          return 'success';
        case 'OUT_OF_STOCK':
          return 'error';
        case 'INACTIVE':
          return 'grey';
        default:
          return 'primary';
      }
    };

    const exportStatus = status => {
      switch (status) {
        case 'ACTIVE':
          return 'Hoạt động';
        case 'OUT_OF_STOCK':
          return 'Hết hàng';
        case 'INACTIVE':
          return 'Ngừng kinh doanh';
        default:
          return 'Không xác định';
      }
    }

    const onPageChange = (newPage) => {
      page.value = newPage
      fetchCategories()
    }

    const onSizeChange = (newSize) => {
      itemsPerPage.value = newSize
      page.value = 1 // reset về trang đầu
      fetchProducts();
    }

    const updateOptions = options => {
      if (options.itemsPerPage === -1) {
        filters.itemsPerPage = totalItems.value;
      } else {
        filters.itemsPerPage = options.itemsPerPage;
      }
      page.value = options.page;
      fetchProducts();
    };

    const showAddDialog = () => {
      isEdit.value = false;
      Object.assign(editedItem, defaultItem);
      productDialog.value = true;
    };

    watch(productDialog, (newValue) => {
      if (!newValue) {
        Object.assign(editedItem, defaultItem);
        selectedImage.value = null;
        Object.assign(variant, defaultVariant);
        dummyFile.value = null;
        selectedColorId.value = null;

        // Reset object reactive đúng cách
        Object.keys(variantImageMap).forEach(key => delete variantImageMap[key]);
        Object.keys(fileInputs).forEach(key => delete fileInputs[key]);
        Object.keys(dynamicFileInputs).forEach(key => delete dynamicFileInputs[key]);

        // Reset mảng reactive
        dynamicImages.splice(0, dynamicImages.length, { file: null, url: null });
      }
    })

    const showEditDialog = item => {
      Object.assign(updateItem, {
        ...item,
        image: item.productImageUrl, // đổi key ở đây
        imageFile: null, // reset lại file nếu cần
      });
      selectedImageUpdate.value = getCloudinaryUrl(item.productImageUrl);
      fetchUpdateProduct();
      updateDialog.value = true;
    };

    const showDeleteDialog = item => {
      Object.assign(editedItem, item);
      deleteDialog.value = true;
    };

    const detailVariantsHeader = ref([
      { title: 'Hình ảnh', key: 'colorImageUrl', align: 'center', sortable: false, },
      { title: 'Màu sắc', key: 'colorName', align: 'center' },
      { title: 'Kích cỡ', key: 'sizeName', align: 'center', sortable: false, },
    ]);
    const detailVariants = ref([]);
    const detailImages = ref([]);
    const detailDescription = ref([]);
    const fecthProductDetail = async () => {
      try {
        console.log("idProduct: ", selectedProduct.value.id);
        const res = await productService.getProductInfoById(selectedProduct.value.id);
        const rawVariants = res.data.data.productVariantsDTO;
        // detailImages.value = res.data.data.productImagesDTO;
        detailDescription.value = res.data.data.productDetailsDTO;
        const productImageUrl = res.data.data.productImageUrl;
        const colorImages = res.data.data.productVariantsDTO.map(v => v.colorImageUrl);
        const detailImagesList = res.data.data.productImagesDTO.map(img => img.imageUrl);

        // Gộp tất cả lại và loại trùng
        const allImageUrls = Array.from(new Set([
          productImageUrl,
          ...colorImages,
          ...detailImagesList
        ]));

        detailImages.value = allImageUrls;

        const groupedVariants = Object.values(
          rawVariants.reduce((acc, item) => {
            if (!acc[item.colorId]) {
              acc[item.colorId] = {
                colorName: item.colorName,
                sizeName: [],
                colorImageUrl: item.colorImageUrl
              };
            }
            acc[item.colorId].sizeName.push(item.sizeName);
            return acc;
          }, {})
        ).map(item => ({
          ...item,
          sizeName: item.sizeName.join(', ')
        }));

        detailVariants.value = groupedVariants;

        console.log("productDetail: ", res.data);
        console.log("Detail variant: ", detailVariants.value);

      } catch (error) {
        console.error('Error fetching products detail:', error);
      }
    }

    const showDetail = item => {
      // Object.assign(editedItem, item);
      selectedProduct.value = item;
      fecthProductDetail();
      detailDialog.value = true;
    };

    const uploadImgProdMain = async () => {
      if (!editedItem.imageFile) return null;

      const uploadImageUrl = await uploadImageToCloudinary(editedItem.imageFile);
      const filePath = uploadImageUrl.split('/upload/')[1];
      return filePath;
    }

    const uploadVariantImages = async () => {
      const uploadedPaths = {}; // Lưu kết quả theo colorId

      for (const colorId of variant.color) {
        const imageData = variantImageMap[colorId];
        if (imageData?.file) {
          const url = await uploadImageToCloudinary(imageData.file);
          const path = url.split('/upload/')[1];
          uploadedPaths[colorId] = path;
        }
      }

      return uploadedPaths;
    };

    const uploadDynamicImages = async () => {
      const results = [];

      for (const image of dynamicImages) {
        if (image.file) {
          const url = await uploadImageToCloudinary(image.file);
          const path = url.split('/upload/')[1];
          results.push(path);
        }
      }

      return results;
    };


    const saveProduct = async () => {
      if (!valid.value) return;

      loading.value = true;
      try {
        const productImageUrl = await uploadImgProdMain();
        const dynamicImages = await uploadDynamicImages();
        const uploadedPathsMap = await uploadVariantImages();

        const request = {
          categorieId: editedItem.category,
          name: editedItem.name,
          price: editedItem.price,
          brand: editedItem.brand,
          status: editedItem.status,
          productImageUrl: productImageUrl,
          colorIds: [...variant.color],
          sizeIds: [...variant.size],
          colorImageUrls: variant.color.map(colorId => uploadedPathsMap[colorId] || null),
          imageUrl: dynamicImages,
          attributeName: descriptions.value.map(item => item.title),
          attributeValue: descriptions.value.map(item => item.content)
        };

        const res = await productService.createProduct(request);

        if (res.data.data) {
          notiColor.value = "success";
          notiContent.value = "Thêm sản phẩm thành công!";
        } else {
          notiColor.value = "error";
          notiContent.value = "Thêm sản phẩm thất bại!";
        }

        console.log("request: ", request);
        console.log("CreateProduct: ", res.data);
        productDialog.value = false;
        fetchProducts();
      } catch (error) {
        notiColor.value = "error";
        notiContent.value = "Có lỗi xảy ra!";
        console.error('Error saving product:', error);
      } finally {
        loading.value = false;
        notiShow.value = true;
      }
    };

    const deleteProduct = () => {
      loading.value = true;
      notiColor.value = "error";
      notiContent.value = "Không thể xoá sản phẩm do rằng buộc dữ liệu!";
      setTimeout(() => {
        loading.value = false;
      }, 3000);
      deleteDialog.value = false;
      notiShow.value = true;
    };

    const closeProductDialog = () => {
      productDialog.value = false;
      Object.assign(editedItem, defaultItem);
    };

    /* product */
    const handleImageChange = (event) => {
      const file = event.target.files[0];
      if (!file) {
        editedItem.imageFile = null;
        editedItem.image = null;
        return;
      }

      if (!isImageFile(file)) {
        alert('Vui lòng chọn file hình ảnh');
        editedItem.imageFile = null;
        editedItem.image = null;
        return;
      }

      editedItem.imageFile = file;
      // editedItem.image = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImage.value = e.target.result;
      };
      reader.readAsDataURL(file);
    };
    const isImageFile = (file) => {
      const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const fileName = file.name.toLowerCase();
      const extensionCheck = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ||
        fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.webp');

      return acceptedTypes.includes(file.type) || extensionCheck;
    };

    const removeImage = () => {
      editedItem.imageFile = null;
      editedItem.image = null;
      selectedImage.value = null;
    };

    // const triggerFileInput = () => {
    //   // this.fileInput?.click();
    //   const fileInputComponent = this.$refs.fileInput;
    //   const realInput = fileInputComponent?.$el?.querySelector('input[type="file"]');
    //   realInput?.click();
    // },

    const triggerFileInput = () => {
      fileInput.value?.click()
    }
    /* product */


    /* productVariants */
    const dummyFile = ref(null); // chỉ để trigger input
    const variantImageMap = reactive({});
    const selectedColorId = ref(null);
    const fileInputs = reactive({}); // ref cho từng input theo colorId

    const setFileInputRef = (colorId) => (el) => {
      fileInputs[colorId] = el;
    };

    const triggerFileInputVariant = (colorId) => {
      fileInputs[colorId]?.click();
    };
    const handleImageChangeVariant = (event, colorId) => {
      const file = event.target.files[0];
      if (!file) return;

      if (!isImageFile(file)) {
        alert('Vui lòng chọn file hình ảnh hợp lệ (jpg, png, gif, webp)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        variantImageMap[colorId] = {
          file: file,
          url: e.target.result,
        };
      };
      reader.readAsDataURL(file);
      console.log("variantMap: ", variantImageMap);
    };

    // const triggerFileInputVariant = (colorId) => {
    //   selectedColorId.value = colorId;
    //   fileInput.value?.click();
    // };

    const removeImageVariant = (colorId) => {
      delete variantImageMap[colorId];
    };
    /* productVariants */

    /* productImages */
    const dynamicImages = reactive([{ file: null, url: null }]);
    const dynamicFileInputs = reactive({});

    const setDynamicFileInputRef = (index) => (el) => {
      dynamicFileInputs[index] = el;
    };

    const triggerDynamicFileInput = (index) => {
      dynamicFileInputs[index]?.click();
    };

    const handleDynamicImageChange = (event, index) => {
      const file = event.target.files[0];
      if (!file || !isImageFile(file)) {
        alert('Vui lòng chọn file hình ảnh hợp lệ (jpg, png, gif, webp)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        dynamicImages[index].file = file;
        dynamicImages[index].url = e.target.result;

        // Nếu là khung cuối cùng thì thêm 1 khung mới
        if (index === dynamicImages.length - 1) {
          dynamicImages.push({ file: null, url: null });
        }
      };
      reader.readAsDataURL(file);
    };

    const removeDynamicImage = (index) => {
      dynamicImages.splice(index, 1);

      // Nếu xoá hết thì thêm lại 1 khung trống
      if (dynamicImages.length === 0) {
        dynamicImages.push({ file: null, url: null });
      }
    };
    /* productImages */

    const fetchColors = async () => {
      try {
        const res = await productService.getAllColor();
        colors.value = res.data.data;
        console.log("FetchColor: ", res.data);
        console.log("Colors: ", colors.value);
      } catch (error) {
        console.error('Error download Color:', error);
      }
    }

    const fetchSizes = async () => {
      try {
        const res = await productService.getAllSize();
        sizes.value = res.data.data;
        console.log("FetchSize: ", res.data);
      } catch (error) {
        console.error('Error download Size:', error);
      }
    }

    const searchQuery = ref();
    const filteredColors = computed(() => {
      if (!searchQuery.value) return colors.value;
      return colors.value.filter(color =>
        color.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    onMounted(fetchProducts);
    onMounted(fetchCategories);


    watch(tabIndex, (newValue) => {
      if (newValue === 1) {
        fetchColors();
        fetchSizes();
      }
    })

    const descriptions = ref([
      { title: null, content: null }
    ]);

    const addDescription = () => {
      descriptions.value.push({
        title: null,
        content: null
      });
    };

    const removeDescription = (index) => {
      descriptions.value.splice(index, 1);
    };

    const exportProducts = () => {
      const data = products.value.map(product => ({
        'ID': product.id,
        'Mã code': product.productCode,
        'Tên sản phẩm': product.name,
        'Danh mục': product.categoryName,
        'Giá': product.price,
        'Trạng thái': product.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sản phẩm');

      const randomFourDigits = Math.floor(1000 + Math.random() * 9999);

      XLSX.writeFile(workbook, `danh-sach-san-pham_${randomFourDigits}.xlsx`);
    };

    const closeUpdateDialog = () => {
      updateDialog.value = false;
    }

    const updateDescription = ref([{ key: null, title: null, content: null }]);


    const updateDynamicImages = ref([{ key: null, file: null, url: null }]);

    const updateVariantHeader = ref([
      // { title: 'Hình ảnh', key: 'colorImageUrl', align: 'center', sortable: false, },
      { title: 'Màu sắc', key: 'colorName', align: 'center' },
      { title: 'Kích cỡ', key: 'sizeName', align: 'center', sortable: false, },
      { title: 'Thao tác', key: 'actions', align: 'center', sortable: false }
    ]);

    const updateVariant = ref([]);

    const fetchUpdateProduct = async () => {
      try {
        const res = await productService.getProductInfoById(updateItem.id);
        const data = res.data.data;
        updateVariant.value = data.productVariantsDTO;
        updateDynamicImages.value = data.productImagesDTO.map(img => ({
          key: img.id,
          file: null,
          url: img.imageUrl
        }));
        updateDescription.value = data.productDetailsDTO.map(desc => ({
          key: desc.id,
          title: desc.attributeName,
          content: desc.attributeValue
        }));

      } catch (error) {
        console.log("Fetch UpdateProduct: ", error);
      }
    }

    /* product-modal update */
    const fileInputUpdate = ref(null);
    const selectedImageUpdate = ref(null);
    const handleImageChangeUpdate = (event) => {
      const file = event.target.files[0];
      if (!file) {
        updateItem.imageFile = null;
        updateItem.image = null;
        return;
      }

      if (!isImageFile(file)) {
        alert('Vui lòng chọn file hình ảnh');
        updateItem.imageFile = null;
        updateItem.image = null;
        return;
      }

      updateItem.imageFile = file;
      // editedItem.image = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImageUpdate.value = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    const removeImageUpdate = () => {
      updateItem.imageFile = null;
      updateItem.image = null;
      selectedImageUpdate.value = null;
    };

    const triggerFileInputUpdate = () => {
      fileInputUpdate.value?.click()
    }

    const updateProduct = async () => {
      // if (!formUpdate.value.validate()) return;
      if (!updateItem) return;

      try {
        const originalImageUrl = getCloudinaryUrl(updateItem.image);
        if (updateItem.imageFile && selectedImageUpdate !== originalImageUrl) {
          const uploadedUrl = await uploadImageToCloudinary(updateItem.imageFile);
          const filePath = uploadedUrl.split('/upload/')[1];
          updateItem.image = filePath;
          updateItem.imageFile = null;
        }

        const request = {
          id: updateItem.id,
          categorieId: updateItem.categorieId,
          name: updateItem.name,
          brand: updateItem.brand,
          price: updateItem.price,
          status: updateItem.status,
          productImageUrl: updateItem.image
        };

        const res = await productService.updateProduct(request);

        if (res.data.data) {
          notiColor.value = "success";
          notiContent.value = "Cập nhập sản phẩm thành công!";
        } else {
          notiColor.value = "error";
          notiContent.value = "Cập nhập sản phẩm thất bại!";
        }
        notiShow.value = true;
      } catch (error) {
        notiColor.value = "error";
        notiContent.value = "Có lỗi xảy ra!";
        notiShow.value = true;
        console.error('Error saving category:', error);
      } finally {
        loading.value = false;
      }
    }


    return {
      search,
      page,
      loading,
      valid,
      colors,
      sizes,
      variant,
      tabIndex,
      tabTitle,
      notiShow,
      notiColor,
      notiContent,
      productDialog,
      deleteDialog,
      detailDialog,
      isEdit,
      filters,
      editedItem,
      headers,
      categories,
      statuses,
      sortOptions,
      products,
      fileRules,
      filteredProducts,
      getStockColor,
      getStatusColor,
      updateOptions,
      showAddDialog,
      showEditDialog,
      showDeleteDialog,
      showDetail,
      handleImageChange,
      saveProduct,
      deleteProduct,
      removeImage,
      closeProductDialog,
      getCloudinaryUrl,
      formatCurrency,
      exportStatus,
      onPageChange,
      onSizeChange,
      categoriesDialog,
      imagePreview,
      triggerFileInput,
      fileInput,
      isImageFile,
      image_error,
      fetchColors,
      fetchSizes,
      searchQuery,
      filteredColors,
      selectedImage,
      dummyFile,
      variantImageMap,
      selectedColorId,
      handleImageChangeVariant,
      triggerFileInputVariant,
      removeImageVariant,
      setFileInputRef,
      dynamicImages,
      dynamicFileInputs,
      handleDynamicImageChange,
      triggerDynamicFileInput,
      removeDynamicImage,
      setDynamicFileInputRef,
      descriptions,
      addDescription,
      removeDescription,
      exportProducts,
      selectedProduct,
      detailDescription,
      detailImages,
      detailVariants,
      detailVariantsHeader,
      updateDialog,
      closeUpdateDialog,
      updateItem,
      defaultUpdateItem,
      updateDescription,
      updateDynamicImages,
      updateVariant,
      updateVariantHeader,
      selectedImageUpdate,
      fileInputUpdate,
      handleImageChangeUpdate,
      triggerFileInputUpdate,
      removeImageUpdate,
      updateProduct,
      footerProps,
      totalItems
    };
  }
};
</script>

<style lang="scss" scoped>
.search-field {
  max-width: 500px;
}

.v-progress-linear {
  width: 100px;
}

.pl\:v-checkbox {
  ::v-deep(.v-checkbox.v-selection-control) {
    min-height: 40px;
  }
}

.bg-gray-0038 {
  background-color: rgba($color: #e5dede61, $alpha: 1.0);
}
</style>