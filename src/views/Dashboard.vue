<template>
  <v-container>
    <!-- Header với tìm kiếm và thống kê nhanh -->
    <v-row class="mb-4">
      <v-col cols="12" md="9">
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Tìm kiếm" variant="outlined" hide-details
          class="search-field"></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-2" color="primary" theme="dark">
          <v-card-text class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-2">Hôm nay</div>
              <div class="text-h6">{{ new Date().toLocaleDateString('vi-VN') }}</div>
            </div>
            <v-icon size="large">mdi-calendar</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Thống kê chính -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="primary" theme="dark">
          <v-card-title class="text-h6">Tổng doanh thu</v-card-title>
          <v-card-text class="text-h4">{{ formatPrice(totalRevenue) }}</v-card-text>
          <v-card-actions>
            <v-btn variant="text" prepend-icon="mdi-chart-line" @click="showRevenueDetails">Xem chi tiết</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="success" theme="dark">
          <v-card-title class="text-h6">Đơn hàng mới</v-card-title>
          <v-card-text class="text-h4">{{ formatNumber(totalOrders) }}</v-card-text>
          <v-card-actions>
            <v-btn variant="text" prepend-icon="mdi-cart" @click="showOrderDetails">Xem chi tiết</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="info" theme="dark">
          <v-card-title class="text-h6">Sản phẩm</v-card-title>
          <v-card-text class="text-h4">{{ formatNumber(totalProducts) }}</v-card-text>
          <v-card-actions>
            <v-btn variant="text" prepend-icon="mdi-package-variant" @click="showProductDetails">Xem chi tiết</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="mx-auto" color="warning" theme="dark">
          <v-card-title class="text-h6">Khách hàng</v-card-title>
          <v-card-text class="text-h4">{{ formatNumber(totalCustomers) }}</v-card-text>
          <v-card-actions>
            <v-btn variant="text" prepend-icon="mdi-account-group" @click="showCustomerDetails">Xem chi tiết</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Biểu đồ và thống kê chi tiết -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">

            <div class="d-flex align-center">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" prepend-icon="mdi-calendar-range" v-bind="props" class="mr-2">
                    {{ selectedPeriodName }}
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item v-for="period in periods" :key="period.key" @click="selectPeriod(period)">
                    <v-list-item-title>{{ period.name }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <!-- <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn color="info" prepend-icon="mdi-filter" v-bind="props" class="mr-2">
                    Bộ lọc
                  </v-btn>
                </template>
                <v-card width="300">
                  <v-card-title>Bộ lọc nâng cao</v-card-title>
                  <v-card-text>
                    <v-select v-model="selectedCategories" :items="categories" label="Danh mục" multiple chips
                      variant="outlined"></v-select>
                    <v-select v-model="selectedRegions" :items="regions" label="Khu vực" multiple chips
                      variant="outlined"></v-select>
                    <v-select v-model="selectedStatus" :items="statuses" label="Trạng thái" multiple chips
                      variant="outlined"></v-select>
                    <v-text-field v-model="minRevenue" label="Doanh thu tối thiểu" type="number" prefix="₫"
                      variant="outlined"></v-text-field>
                    <v-text-field v-model="maxRevenue" label="Doanh thu tối đa" type="number" prefix="₫"
                      variant="outlined"></v-text-field>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="applyFilters">Áp dụng</v-btn>
                    <v-btn color="error" @click="resetFilters">Đặt lại</v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu> -->
              <!-- <v-menu :close-on-content-click="false" transition="slide-y-transition" offset-y max-width="320px"
                min-width="auto">
                <template v-slot:activator="{ props }">
                  <v-btn color="info" prepend-icon="mdi-filter" v-bind="props" class="mr-2">
                    Bộ lọc
                  </v-btn>
                </template>

                <v-card class="pa-2">
                  <v-card-title class="text-h6 font-weight-bold pt-2 pb-4">
                    <v-icon class="mr-2">mdi-tune</v-icon>Bộ lọc nâng cao
                  </v-card-title>

                  <v-divider></v-divider>

                  <v-card-text class="pt-4" style="max-height: 400px; overflow-y: auto;">
                    <v-select v-model="selectedCategories" :items="categories" label="Danh mục" multiple chips
                      variant="outlined" density="compact" prepend-icon="mdi-view-list"></v-select>

                    <v-select v-model="selectedRegions" :items="regions" label="Khu vực" multiple chips
                      variant="outlined" density="compact" prepend-icon="mdi-map-marker"></v-select>

                    <v-select v-model="selectedStatus" :items="statuses" label="Trạng thái" multiple chips
                      variant="outlined" density="compact" prepend-icon="mdi-check-circle-outline"></v-select>

                    <v-text-field v-model="minRevenue" label="Doanh thu tối thiểu" type="number" prefix="₫"
                      variant="outlined" density="compact"></v-text-field>

                    <v-text-field v-model="maxRevenue" label="Doanh thu tối đa" type="number" prefix="₫"
                      variant="outlined" density="compact"></v-text-field>
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="tonal" @click="applyFilters">
                      <v-icon start>mdi-check</v-icon>Áp dụng
                    </v-btn>
                    <v-btn color="error" variant="tonal" @click="resetFilters">
                      <v-icon start>mdi-close</v-icon>Đặt lại
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu> -->

              <!-- <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn color="warning" prepend-icon="mdi-chart-box" v-bind="props" class="mr-2">
                    Bố cục
                  </v-btn>
                </template>
                <v-card width="300">
                  <v-card-title>Tùy chỉnh bố cục</v-card-title>
                  <v-card-text>
                    <v-switch v-model="showQuickStats" label="Hiển thị thống kê nhanh" color="primary"
                      hide-details></v-switch>
                    <v-switch v-model="showRevenueChart" label="Hiển thị biểu đồ doanh thu" color="primary"
                      hide-details></v-switch>
                    <v-switch v-model="showOrderChart" label="Hiển thị biểu đồ đơn hàng" color="primary"
                      hide-details></v-switch>
                    <v-switch v-model="showRecentOrders" label="Hiển thị đơn hàng gần đây" color="primary"
                      hide-details></v-switch>
                    <v-switch v-model="showBestSelling" label="Hiển thị sản phẩm bán chạy" color="primary"
                      hide-details></v-switch>
                    <v-switch v-model="showNotifications" label="Hiển thị thông báo" color="primary"
                      hide-details></v-switch>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="saveLayout">Lưu</v-btn>
                    <v-btn color="error" @click="resetLayout">Mặc định</v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu> -->

              <v-menu :close-on-content-click="false" transition="slide-y-transition" offset-y max-width="320px"
                min-width="auto">
                <template v-slot:activator="{ props }">
                  <v-btn color="warning" prepend-icon="mdi-chart-box" v-bind="props" class="mr-2">
                    Bố cục
                  </v-btn>
                </template>

                <v-card>
                  <v-card-title class="text-h6 font-weight-bold pa-2 pb-4">
                    <v-icon class="mr-2">mdi-tune-variant</v-icon>Tuỳ chỉnh bố cục
                  </v-card-title>

                  <v-divider></v-divider>

                  <v-card-text class="pa-2" style="max-height: 400px; overflow-y: auto;">
                    <v-switch v-model="showQuickStats" label="Hiển thị thống kê nhanh" color="primary" density="compact"
                      inset></v-switch>

                    <v-switch v-model="showRevenueChart" label="Hiển thị biểu đồ doanh thu" color="primary"
                      density="compact" inset></v-switch>

                    <v-switch v-model="showOrderChart" label="Hiển thị biểu đồ đơn hàng" color="primary"
                      density="compact" inset></v-switch>

                    <v-switch v-model="showRecentOrders" label="Hiển thị đơn hàng gần đây" color="primary"
                      density="compact" inset></v-switch>

                    <v-switch v-model="showBestSelling" label="Hiển thị sản phẩm bán chạy" color="primary"
                      density="compact" inset></v-switch>

                    <!-- <v-switch v-model="showNotifications" label="Hiển thị thông báo" color="primary" density="compact"
                      inset></v-switch> -->
                  </v-card-text>

                  <v-divider></v-divider>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="tonal" @click="saveLayout">
                      <v-icon start>mdi-content-save</v-icon>Lưu
                    </v-btn>
                    <v-btn color="error" variant="tonal" @click="resetLayout">
                      <v-icon start>mdi-restore</v-icon>Mặc định
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>

              <v-btn color="info" prepend-icon="mdi-refresh" class="mr-2" @click="refreshData" :loading="refreshing">
                Làm mới
              </v-btn>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn color="success" prepend-icon="mdi-download" v-bind="props">
                    Xuất báo cáo
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="exportDashboard('pdf')">
                    <v-list-item-title>Xuất PDF</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="exportDashboard('excel')">
                    <v-list-item-title>Xuất Excel</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="exportDashboard('image')">
                    <v-list-item-title>Xuất hình ảnh</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-card-title>

          <v-container fluid>
            <!-- Thống kê nhanh -->
            <v-row v-if="showQuickStats" class="mb-4">
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="stat-card" :class="{ 'stat-card-hover': true }"
                  @click="showRevenueDetails">
                  <v-card-text>
                    <div class="d-flex align-center">
                      <v-icon color="primary" size="40" class="mr-3">
                        mdi-currency-usd
                      </v-icon>
                      <div>
                        <div class="text-subtitle-2">Tổng doanh thu</div>
                        <div class="text-h4">{{ formatPrice(totalRevenueByRangeType) }}</div>
                        <div class="text-caption">
                          <v-icon :color="revenueTrend > 0 ? 'success' : 'error'" size="small">
                            {{ revenueTrend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                          </v-icon>
                          {{ Math.abs(revenueTrend) }}% so với kỳ trước
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="stat-card" :class="{ 'stat-card-hover': true }"
                  @click="showOrderDetails">
                  <v-card-text>
                    <div class="d-flex align-center">
                      <v-icon color="success" size="40" class="mr-3">
                        mdi-cart
                      </v-icon>
                      <div>
                        <div class="text-subtitle-2">Tổng đơn hàng</div>
                        <div class="text-h4">{{ formatNumber(totalOrderByRangeType) }}</div>
                        <div class="text-caption">
                          <v-icon :color="orderTrend > 0 ? 'success' : 'error'" size="small">
                            {{ orderTrend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                          </v-icon>
                          {{ Math.abs(orderTrend) }}% so với kỳ trước
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="stat-card" :class="{ 'stat-card-hover': true }"
                  @click="showProductDetails">
                  <v-card-text>
                    <div class="d-flex align-center">
                      <v-icon color="warning" size="40" class="mr-3">
                        mdi-account-group
                      </v-icon>
                      <div>
                        <div class="text-subtitle-2">Khách hàng mới</div>
                        <div class="text-h4">{{ formatNumber(totalCustomerByRangeType) }}</div>
                        <div class="text-caption">
                          <v-icon :color="customerTrend > 0 ? 'success' : 'error'" size="small">
                            {{ customerTrend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                          </v-icon>
                          {{ Math.abs(customerTrend) }}% so với kỳ trước
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card variant="outlined" class="stat-card" :class="{ 'stat-card-hover': true }"
                  @click="showCustomerDetails">
                  <v-card-text>
                    <div class="d-flex align-center">
                      <v-icon color="error" size="40" class="mr-3">
                        mdi-package-variant
                      </v-icon>
                      <div>
                        <div class="text-subtitle-2">Sản phẩm bán chạy</div>
                        <div class="text-h4">{{ formatCurrency(totalProductByRangeType) }}</div>
                        <div class="text-caption">
                          <v-icon :color="productTrend > 0 ? 'success' : 'error'" size="small">
                            {{ productTrend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                          </v-icon>
                          {{ Math.abs(productTrend) }}% so với kỳ trước
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Biểu đồ và bảng -->
            <v-row>
              <v-col v-if="showRevenueChart" cols="12" md="8">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="d-flex justify-space-between align-center pa-2">
                    <span class="ml-2 text-h6">Doanh thu theo tháng</span>
                    <div class="d-flex align-center">
                      <v-btn-toggle v-model="chartType" mandatory color="primary">
                        <v-btn value="line" prepend-icon="mdi-chart-line">
                          Đường
                        </v-btn>
                        <v-btn value="bar" prepend-icon="mdi-chart-bar">
                          Cột
                        </v-btn>
                      </v-btn-toggle>
                      <v-btn icon="mdi-download" variant="text" @click="downloadChart('revenueChart')"></v-btn>
                    </div>
                  </v-card-title>
                  <v-divider />
                  <v-card-text>
                    <v-chart ref="revenueChart" class="chart" :option="revenueChartOption" autoresize></v-chart>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col v-if="showOrderChart" cols="12" md="4">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="d-flex justify-space-between align-center pa-2">
                    <span class="ml-2 text-h6">Phân bố đơn hàng</span>
                    <v-btn icon="mdi-download" variant="text" @click="downloadChart('orderChart')"></v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-chart ref="orderChart" class="chart" :option="orderChartOption" autoresize></v-chart>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Bảng và danh sách -->
            <v-row>
              <v-col v-if="showRecentOrders" cols="12" md="6">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="d-flex justify-space-between align-center pa-2">
                    <span class="ml-2 text-h6">Đơn hàng gần đây</span>
                    <v-btn icon="mdi-refresh" variant="text" @click="refreshOrders" :loading="refreshingOrders"></v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-data-table-virtual :headers="orderHeaders" :items="recentOrders" :loading="recentOrderLoading"
                      height="300" loading-text="Đang tải dữ liệu..." fixed-header>
                      <template v-slot:item.createdAt="{ item }">
                        <div>{{ formatDate(item.createdAt) }}</div>
                        <div class="text-caption">{{ formatTime(item.createdAt) }}</div>
                      </template>
                      <template v-slot:item.status="{ item }">
                        <v-chip :color="getStatusColor(item.status)" size="small">
                          {{ displayStatus(item.status) }}
                        </v-chip>
                      </template>
                      <template v-slot:item.totalAmount="{ item }">
                        {{ formatPrice(item.totalAmount) }}
                      </template>
                      <!-- <template v-slot:item.createdAt="{ item }">
                        <div>{{ formatDate(item.createdAt) }}</div>
                        <div class="text-caption">{{ formatTime(item.createdAt) }}</div>
                      </template> -->
                      <!-- <template v-slot:item.actions="{ item }">
                        <v-btn icon="mdi-eye" variant="text" color="primary" size="small"
                          @click="viewOrder(item)"></v-btn>
                      </template> -->
                    </v-data-table-virtual>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col v-if="showBestSelling" cols="12" md="6">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="d-flex justify-space-between align-center pa-2">
                    <span class="ml-2 text-h6">Sản phẩm bán chạy</span>
                    <v-btn icon="mdi-refresh" variant="text" @click="refreshProducts"
                      :loading="refreshingProducts"></v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-data-table-virtual :headers="productHeaders" :items="bestSellingProducts"
                      :loading="sellingLoading" height="300" class="elevation-0" loading-text="Đang tải dữ liệu..."
                      hide-default-footer fixed-header>
                      <template v-slot:item.productImageUrl="{ item }">
                        <div class="d-flex justify-space-between">
                          <v-img :src="fetchCloudinaryUrl(item.productImageUrl)" :lazy-src="image_error" width="40"
                            height="40" class="rounded"></v-img>
                        </div>
                      </template>
                      <template v-slot:item.name="{ item }">
                        <p class="text-left">{{ item.name }}</p>
                      </template>
                      <template v-slot:item.price="{ item }">
                        {{ formatPrice(item.price) }}
                      </template>
                      <template v-slot:item.totalRevenue="{ item }">
                        {{ formatPrice(item.totalRevenue) }}
                      </template>
                    </v-data-table-virtual>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Thông báo -->
            <!-- <v-row v-if="showNotifications">
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="d-flex justify-space-between align-center">
                    <span>Thông báo gần đây</span>
                    <v-btn icon="mdi-bell" variant="text" color="primary" @click="viewAllNotifications"></v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-timeline density="compact">
                      <v-timeline-item v-for="notification in notifications" :key="notification.id"
                        :dot-color="getNotificationColor(notification.type)" size="small">
                        <template v-slot:opposite>
                          {{ formatDate(notification.date) }}
                        </template>
                        <div class="d-flex justify-space-between align-center">
                          <div>
                            <div class="text-subtitle-2">{{ notification.title }}</div>
                            <div class="text-caption">{{ notification.message }}</div>
                          </div>
                          <v-btn v-if="notification.action" size="small" color="primary"
                            @click="handleNotificationAction(notification)">
                            {{ notification.action }}
                          </v-btn>
                        </div>
                      </v-timeline-item>
                    </v-timeline>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row> -->
          </v-container>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog chi tiết -->
    <v-dialog v-model="detailsDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-2">
          <span class="ml-4">{{ dialogTitle }}</span>
          <v-btn icon="mdi-close" variant="text" @click="detailsDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <!-- Chi tiết doanh thu -->
          <div v-if="dialogType === 'revenue'">
            <!-- <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">Doanh thu theo danh mục</v-card-title>
                  <v-card-text>
                    <v-chart class="chart-small" :option="categoryRevenueChart" autoresize style="height: 200px;" />
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">Doanh thu theo khu vực</v-card-title>
                  <v-card-text>
                    <v-chart class="chart-small" :option="regionRevenueChart" autoresize style="height: 200px;" />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row> -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-data-table :headers="revenueDetailsHeader" :items="revenueDetails" :loading="revenueDetailsLoading"
                  hide-default-footer>
                  <template v-slot:item.revenue="{ item }">
                    {{ formatCurrency(item.revenue) }}
                  </template>

                  <template v-slot:item.growth="{ item }">
                    {{ formatNumber(item.growth) }}%
                  </template>

                  <template v-slot:item.order="{ item }">
                    {{ formatNumber(item.order) }}
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </div>

          <!-- Chi tiết đơn hàng -->
          <v-container v-else-if="dialogType === 'orders'">
            <!-- <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">Trạng thái đơn hàng</v-card-title>
                  <v-card-text>
                    <v-chart class="chart-small" :option="orderStatusChart" autoresize style="height: 200px;" />
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">Phương thức thanh toán</v-card-title>
                  <v-card-text>
                    <v-chart class="chart-small" :option="paymentMethodChart" autoresize style="height: 200px;" />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row> -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-data-table :headers="orderDetailsHeaders" :items="orderDetails" :loading="orderDetailsLoading"
                  hide-default-footer>
                  <template v-slot:item.totalAmount="{ item }">
                    {{ formatPrice(item.totalAmount || 0) }}
                  </template>
                  <template v-slot:item.createdAt="{ item }">
                    <div>{{ formatDate(item.createdAt) }}</div>
                    <div class="text-caption">{{ formatTime(item.createdAt) }}</div>
                  </template>
                  <template v-slot:item.status="{ item }">
                    <v-chip :color="getStatusColor(item.status)" size="small">
                      {{ displayStatus(item.status) }}
                    </v-chip>
                  </template>

                </v-data-table>
              </v-col>
            </v-row>
          </v-container>

          <!-- Chi tiết sản phẩm -->
          <div v-else-if="dialogType === 'products'">
            <!-- <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">Sản phẩm theo danh mục</v-card-title>
                  <v-card-text>
                    <v-chart class="chart-small" :option="productCategoryChart" autoresize style="height: 200px;" />
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">Tồn kho</v-card-title>
                  <v-card-text>
                    <v-chart class="chart-small" :option="inventoryChart" autoresize style="height: 200px;" />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row> -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-data-table-virtual :headers="topProductHeader" :items="topProductDetails"
                  :loading="topProductDetailLoading" loading-text="Đang tải dữ liệu..." hide-default-footer>
                  <template v-slot:item.productImageUrl="{ item }">
                    <div class="d-flex justify-space-between">
                      <v-img :src="fetchCloudinaryUrl(item.productImageUrl)" :lazy-src="image_error" width="40"
                        height="40" class="rounded"></v-img>
                    </div>
                  </template>
                  <template v-slot:item.name="{ item }">
                    <p class="text-left">{{ item.name }}</p>
                  </template>
                  <template v-slot:item.price="{ item }">
                    {{ formatPrice(item.price) }}
                  </template>
                  <template v-slot:item.totalRevenue="{ item }">
                    {{ formatPrice(item.totalRevenue) }}
                  </template>
                </v-data-table-virtual>
              </v-col>
            </v-row>
          </div>

          <!-- Chi tiết khách hàng -->
          <div v-else-if="dialogType === 'customers'">
            <!-- <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">Khách hàng mới</v-card-title>
                  <v-card-text>
                    <v-chart class="chart-small" :option="newCustomersChart" autoresize style="height: 200px;" />
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">Phân bố khu vực</v-card-title>
                  <v-card-text>
                    <v-chart class="chart-small" :option="customerRegionChart" autoresize style="height: 200px;" />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row> -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-data-table-virtual :headers="customerDetailHeader" :items="customerDetails"
                  :loading="customerDetailLoading" loading-text="Đang tải dữ liệu..." hide-default-footer>
                  <template v-slot:item.name="{ item }">
                    <p class="text-left">{{ item.firstName }} {{ item.lastName }}</p>
                  </template>
                  <template v-slot:item.email="{ item }">
                    <p class="text-left">{{ item.email }}</p>
                  </template>
                  <template v-slot:item.successfulTransactions="{ item }">
                    {{ formatNumber(item.successfulTransactions || 0) }}
                  </template>
                  <template v-slot:item.totalSpent="{ item }">
                    {{ formatPrice(item.totalSpent || 0) }}
                  </template>
                </v-data-table-virtual>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="detailsDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { statisticsService } from '../api/services/statisticsService';
import { orderService } from '../api/services/orderService';
import { productService } from '../api/services/productService';
import { customerService } from '../api/services/customerService';
import { formatCurrency } from '../utils/api';
import { getCloudinaryUrl } from '../utils/cloudinary';
import image_error from '../assets/image_error.png';

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

export default {
  name: 'Dashboard',
  components: {
    VChart
  },
  data() {
    return {
      search: '',
      chartType: 'line',
      productSort: 'sold',
      detailsDialog: false,
      dialogType: '',
      dialogTitle: '',
      revenueChartOption: {
        tooltip: {
          trigger: 'axis',
          formatter(params) {
            if (!params || !params.length) return '';
            const value = params[0].value;
            return `${params[0].name}: ${new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(value)}`;
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: []
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter(value) {
              return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(value);
            }
          }
        },
        series: [{
          name: 'Doanh thu',
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#1976D2'
          },
          areaStyle: {
            opacity: 0.2,
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#1976D2' },
                { offset: 1, color: 'rgba(25, 118, 210, 0)' }
              ]
            }
          },
          symbolSize: 8,
          data: []
        }]
      },
      orderChartOption: {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            return `${params.name}: ${params.value} đơn (${params.percent}%)`;
          },
        },
        legend: {
          orient: 'horizontal',
          bottom: '5%',
          left: 'center',
          itemGap: 10,
          itemWidth: 14,
          itemHeight: 14,
          icon: 'circle',
        },
        series: [{
          type: 'pie',
          radius: ['30%', '60%'],
          center: ['50%', '50%'],
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold',
            },
          },
          data: [
            // { value: 1048, name: 'Đã giao', itemStyle: { color: '#4CAF50' } },
            // { value: 735, name: 'Đang giao', itemStyle: { color: '#FB8C00' } },
            // { value: 580, name: 'Chờ xử lý', itemStyle: { color: '#1E88E5' } },
            // { value: 484, name: 'Đã hủy', itemStyle: { color: '#E53935' } },
            // { value: 484, name: 'Đã hủy', itemStyle: { color: '#E53935' } }
          ],
        }],
      },
      recentOrders: [],
      topProducts: [
        { id: 1, name: 'iPhone 15 Pro', sold: 156, revenue: '$156,000', stock: 75, image: 'https://via.placeholder.com/40' },
        { id: 2, name: 'MacBook Pro M3', sold: 89, revenue: '$178,000', stock: 45, image: 'https://via.placeholder.com/40' },
        { id: 3, name: 'AirPods Pro', sold: 234, revenue: '$58,500', stock: 90, image: 'https://via.placeholder.com/40' }
      ],
      notifications: [
        { id: 1, title: 'Đơn hàng mới', message: 'Đơn hàng #1237 vừa được tạo', time: '5 phút trước', color: 'primary' },
        { id: 2, title: 'Cảnh báo tồn kho', message: 'iPhone 15 Pro sắp hết hàng', time: '1 giờ trước', color: 'warning' },
        { id: 3, title: 'Khuyến mãi', message: 'Chương trình giảm giá 20% cho MacBook', time: '2 giờ trước', color: 'success' }
      ],
      categoryRevenueChart: {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} triệu VNĐ ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: '70%',
          data: [
            { value: 1048, name: 'Điện thoại' },
            { value: 735, name: 'Laptop' },
            { value: 580, name: 'Phụ kiện' },
            { value: 484, name: 'Khác' }
          ]
        }]
      },
      regionRevenueChart: {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c} triệu VNĐ'
        },
        xAxis: {
          type: 'category',
          data: ['Miền Bắc', 'Miền Trung', 'Miền Nam']
        },
        yAxis: {
          type: 'value',
          name: 'Triệu VNĐ'
        },
        series: [{
          data: [1200, 800, 1000],
          type: 'bar'
        }]
      },
      revenueDetailsLoading: false,
      revenueDetailsHeader: [
        { title: 'Thời gian', key: 'period', align: 'center', sortable: true },
        { title: 'Doanh thu', key: 'revenue', align: 'center', sortable: true },
        { title: 'Tăng trưởng', key: 'growth', align: 'center', sortable: true },
        { title: 'Đơn hàng', key: 'order', align: 'center', sortable: true },
      ],
      revenueDetails: [],
      orderStatusChart: {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} đơn ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: '70%',
          data: [
            { value: 1048, name: 'Đã giao' },
            { value: 735, name: 'Đang xử lý' },
            { value: 580, name: 'Đã hủy' }
          ]
        }]
      },
      paymentMethodChart: {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} đơn ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: '70%',
          data: [
            { value: 1048, name: 'Chuyển khoản' },
            { value: 735, name: 'Tiền mặt' },
            { value: 580, name: 'Thẻ tín dụng' }
          ]
        }]
      },
      orderDetailsLoading: false,
      orderDetailsHeaders: [
        { title: 'Mã đơn hàng', key: 'orderCode', align: 'center', sortable: true },
        { title: 'Khách hàng', key: 'name', align: 'center', sortable: true },
        { title: 'Tổng tiền', key: 'totalAmount', align: 'center', sortable: true },
        { title: 'Ngày tạo', key: 'createdAt', align: 'center', sortable: true },
        { title: 'Trạng thái', key: 'status', align: 'center', sortable: true },
      ],
      orderDetails: [],
      productCategoryChart: {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} sản phẩm ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: '70%',
          data: [
            { value: 1048, name: 'Điện thoại' },
            { value: 735, name: 'Laptop' },
            { value: 580, name: 'Phụ kiện' }
          ]
        }]
      },
      inventoryChart: {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c} sản phẩm'
        },
        xAxis: {
          type: 'category',
          data: ['Tồn kho cao', 'Tồn kho trung bình', 'Tồn kho thấp']
        },
        yAxis: {
          type: 'value',
          name: 'Số lượng'
        },
        series: [{
          data: [120, 200, 150],
          type: 'bar'
        }]
      },
      topProductHeader: [
        { title: 'Hình ảnh', key: 'productImageUrl', align: 'center', sortable: false },
        { title: 'Mã sản phẩm', key: 'productCode', align: 'center', sortable: true },
        { title: 'Tên sản phẩm', key: 'name', align: 'center', width: '250px', sortable: true },
        { title: 'Đơn giá', key: 'price', align: 'center', sortable: true },
        { title: 'Doanh thu', key: 'totalRevenue', align: 'center', sortable: true },
      ],
      topProductDetails: [],
      topProductDetailLoading: false,
      newCustomersChart: {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c} khách hàng'
        },
        xAxis: {
          type: 'category',
          data: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6']
        },
        yAxis: {
          type: 'value',
          name: 'Số lượng'
        },
        series: [{
          data: [150, 230, 224, 218, 135, 147],
          type: 'line',
          smooth: true
        }]
      },
      customerRegionChart: {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} khách hàng ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: '70%',
          data: [
            { value: 1048, name: 'Miền Bắc' },
            { value: 735, name: 'Miền Trung' },
            { value: 580, name: 'Miền Nam' }
          ]
        }]
      },
      customerDetailHeader: [
        { title: 'Khách hàng', key: 'name', align: 'center', sortable: false },
        { title: 'Email', key: 'email', align: 'center', width: '250px' },
        { title: 'SĐT', key: 'phone', align: 'center' },
        { title: 'Đơn hàng', key: 'successfulTransactions', align: 'center' },
        { title: 'Tổng chi tiêu', key: 'totalSpent', align: 'center' }
      ],
      customerDetails: [],
      customerDetailLoading: false,
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalCustomers: 0,
      totalRevenueByRangeType: 0,
      totalOrderByRangeType: 0,
      totalProductByRangeType: 0,
      totalCustomerByRangeType: 0,
      orderTrend: 0,
      revenueTrend: 0,
      customerTrend: 0,
      productTrend: 0,
      orderHeaders: [
        { title: 'Mã đơn', key: 'orderCode', align: 'center' },
        { title: 'Khách hàng', key: 'name', align: 'center' },
        { title: 'Tổng tiền', key: 'totalAmount', align: 'center' },
        { title: 'Ngày tạo đơn', key: 'createdAt', align: 'center' },
        { title: 'Trạng thái', key: 'status', align: 'center' },
      ],
      productHeaders: [
        { title: 'Hình ảnh', key: 'productImageUrl', align: 'center', sortable: false },
        { title: 'Tên sản phẩm', key: 'name', align: 'center', width: '250px' },
        { title: 'Giá', key: 'price', align: 'center' },
        { title: 'Doanh thu', key: 'totalRevenue', align: 'center' }
      ],
      sellingLoading: false,
      bestSellingProducts: [],
      refreshing: false,
      refreshingOrders: false,
      refreshingProducts: false,
      loading: false,
      selectedPeriodName: 'Hôm nay',
      selectedPeriod: 'day',
      recentOrderLoading: false,
      periods: [
        { key: 'day', name: 'Hôm nay' },
        { key: 'week', name: 'Tuần này' },
        { key: 'month', name: 'Tháng này' },
        { key: 'quarter', name: 'Quý này' },
        { key: 'year', name: 'Năm này' },
      ],
      selectedCategories: [],
      selectedRegions: [],
      selectedStatus: [],
      minRevenue: null,
      maxRevenue: null,
      categories: ['Điện thoại', 'Laptop', 'Phụ kiện', 'Khác'],
      regions: ['Miền Bắc', 'Miền Trung', 'Miền Nam'],
      statuses: ['Đã giao', 'Đang giao', 'Chờ xử lý', 'Đã hủy'],
      showQuickStats: true,
      showRevenueChart: true,
      showOrderChart: true,
      showRecentOrders: true,
      showBestSelling: true,
      showNotifications: true,
      statusMapping: {
        1: 'Chờ xử lý',
        2: 'Đã duyệt',
        3: 'Đang giao hàng',
        4: 'Giao hàng thành công',
        5: 'Đã hủy',
      },
    }
  },
  computed: {
    sortedProducts() {
      return [...this.topProducts].sort((a, b) => {
        if (this.productSort === 'sold') {
          return b.sold - a.sold;
        } else {
          return this.parseRevenue(b.revenue) - this.parseRevenue(a.revenue);
        }
      });
    }
  },
  methods: {
    getStatusColor(status) {
      switch (status) {
        case 'Đã giao':
          return 'success';
        case 'Đang giao':
          return 'warning';
        case 'Chờ xử lý':
          return 'info';
        case 'Đã hủy':
          return 'error';
        default:
          return 'grey';
      }
    },
    getStatusText(status) {
      return this.statusMapping[status] || 'Không xác định';
    },
    getStockColor(stock) {
      if (stock > 70) return 'success';
      if (stock > 30) return 'warning';
      return 'error';
    },
    parseRevenue(revenue) {
      return parseFloat(revenue.replace('$', '').replace(',', ''));
    },
    showRevenueDetails() {
      this.dialogType = 'revenue';
      this.dialogTitle = 'Chi tiết doanh thu';
      this.detailsDialog = true;
      this.fetchRevenueStats();
    },
    showOrderDetails() {
      this.dialogType = 'orders';
      this.dialogTitle = 'Chi tiết đơn hàng';
      this.detailsDialog = true;
      this.fetchOrderDetails();
    },
    showProductDetails() {
      this.dialogType = 'products';
      this.dialogTitle = 'Chi tiết sản phẩm';
      this.detailsDialog = true;
      this.fetchTopProductByRangeType();
    },
    showCustomerDetails() {
      this.dialogType = 'customers';
      this.dialogTitle = 'Chi tiết khách hàng';
      this.detailsDialog = true;
      this.fetchNewCustomer();
    },
    exportChart() {
      // Logic xuất biểu đồ
    },
    refreshChart() {
      // Logic làm mới dữ liệu biểu đồ
    },
    refreshOrders() {
      this.fetchRecentOrder();
    },
    showAllNotifications() {
      // Logic hiển thị tất cả thông báo
    },
    fetchCloudinaryUrl(path) {
      return getCloudinaryUrl(path);
    },
    async refreshData() {
      this.refreshing = true;
      try {
        // TODO: Gọi API làm mới dữ liệu
        await this.loadDashboardData();
      } catch (error) {
        console.error('Error refreshing data:', error);
      } finally {
        this.refreshing = false;
      }
    },
    async fetchDashBoardStats() {
      try {
        const resRevenue = await statisticsService.totalRevenue();
        const resNewOrder = await statisticsService.countNewOrder();
        const resProduct = await statisticsService.countProduct();
        const resCustomerFrOrder = await statisticsService.countCustomerFromOrder();
        const resCustomerFrCustomer = await statisticsService.countCustomerFromCustomer();

        this.totalRevenue = resRevenue.data.data;
        this.totalProducts = resProduct.data.data;
        this.totalOrders = resNewOrder.data.data;
        this.totalCustomers = resCustomerFrCustomer.data.data + resCustomerFrOrder.data.data;

      } catch (error) {
        console.log("fetchDashBoardStats Error: ", error);
      }
    },
    async fetchOrderDetails() {
      try {
        this.orderDetailsLoading = true;

        const request = {
          page: 0,
          size: 5,
          rangeType: this.selectedPeriod
        };

        const res = await statisticsService.statsNewCustomer(request);
        this.orderDetails = res.data.data.content;

        console.log("fetchOrderDetails: ", res.data);
      } catch (error) {
        console.log("fetchOrderDetails Error: ", error);
      } finally {
        this.orderDetailsLoading = false;
      }
    },
    async loadDashboardData() {
      this.loading = true;
      try {
        // TODO: Gọi API lấy dữ liệu


        this.fetchRevenueStats();
        this.fetchDashBoardStats();
        this.fetchRevenueChart();
        this.fetchOrderChart();
        this.fetchRecentOrder();
        this.fetchStatsRevenue();
        this.fetchStatsOrder();
        this.fetchStatsTopProduct();
        this.fetchStatsNewCustomer();
        this.fetchTopProduct();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        this.loading = false;
      }
    },
    updateChartType() {
      this.revenueChartOption.series[0].type = this.chartType;
    },
    updateCharts() {
      // Cập nhật dữ liệu biểu đồ doanh thu
      const revenueData = [
        15000000, 25000000, 23000000, 35000000,
        45000000, 35000000, 47000000, 50000000,
        65000000, 58000000, 70000000, 85000000
      ];
      this.revenueChartOption.series[0].data = revenueData;

      // Cập nhật dữ liệu biểu đồ đơn hàng
      const orderData = [
        { value: 1048, name: 'Đã giao', itemStyle: { color: '#4CAF50' } },
        { value: 735, name: 'Đang giao', itemStyle: { color: '#FB8C00' } },
        { value: 580, name: 'Chờ xử lý', itemStyle: { color: '#1E88E5' } },
        { value: 484, name: 'Đã hủy', itemStyle: { color: '#E53935' } }
      ];
      this.orderChartOption.series[0].data = orderData;

    },
    displayStatus(status) {
      return this.statusMapping[status] || 'Không xác định';
    },
    formatCurrency(value) {
      return formatCurrency(value);
    },
    formatNumber(value) {
      return new Intl.NumberFormat('vi-VN').format(value);
    },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('vi-VN');
    },
    formatTime(dateString) {
      return new Date(dateString).toLocaleTimeString('vi-VN');
    },
    getStatusColor(status) {
      switch (status) {
        case 1: return 'grey';
        case 2: return 'blue';
        case 3: return 'orange';
        case 4: return 'green';
        case 5: return 'red';
        default: return 'grey';
      }
    },
    getNotificationColor(type) {
      switch (type) {
        case 'success':
          return 'success';
        case 'warning':
          return 'warning';
        case 'error':
          return 'error';
        default:
          return 'primary';
      }
    },
    viewOrder(order) {
      // TODO: Xem chi tiết đơn hàng
      console.log('View order:', order);
    },
    handleNotificationAction(notification) {
      // TODO: Xử lý hành động thông báo
      console.log('Handle notification action:', notification);
    },
    viewAllNotifications() {
      // TODO: Xem tất cả thông báo
      console.log('View all notifications');
    },
    async refreshOrders() {
      this.refreshingOrders = true;
      try {
        // TODO: Gọi API làm mới danh sách đơn hàng
        await this.loadRecentOrders();
      } catch (error) {
        console.error('Error refreshing orders:', error);
      } finally {
        this.refreshingOrders = false;
      }
    },
    async refreshProducts() {
      this.refreshingProducts = true;
      try {
        // TODO: Gọi API làm mới danh sách sản phẩm
        await this.loadBestSellingProducts();
      } catch (error) {
        console.error('Error refreshing products:', error);
      } finally {
        this.refreshingProducts = false;
      }
    },
    downloadChart(chartRef) {
      const chart = this.$refs[chartRef];
      if (chart) {
        const dataURL = chart.getDataURL();
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${chartRef}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    exportDashboard(format) {
      switch (format) {
        case 'pdf':
          // TODO: Xuất PDF
          break;
        case 'excel':
          // TODO: Xuất Excel
          break;
        case 'image':
          // TODO: Xuất hình ảnh
          break;
      }
    },
    selectPeriod(period) {
      this.selectedPeriod = period.key;
      this.selectedPeriodName = period.name;
      this.refreshData();
    },
    applyFilters() {
      this.refreshData();
    },
    resetFilters() {
      this.selectedCategories = [];
      this.selectedRegions = [];
      this.selectedStatus = [];
      this.minRevenue = null;
      this.maxRevenue = null;
      this.refreshData();
    },
    saveLayout() {
      const layout = {
        showQuickStats: this.showQuickStats,
        showRevenueChart: this.showRevenueChart,
        showOrderChart: this.showOrderChart,
        showRecentOrders: this.showRecentOrders,
        showBestSelling: this.showBestSelling,
        showNotifications: this.showNotifications
      };
      localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    },
    loadLayout() {
      const savedLayout = localStorage.getItem('dashboardLayout');
      if (savedLayout) {
        const layout = JSON.parse(savedLayout);
        Object.assign(this, layout);
      }
    },
    resetLayout() {
      this.showQuickStats = true;
      this.showRevenueChart = true;
      this.showOrderChart = true;
      this.showRecentOrders = true;
      this.showBestSelling = true;
      this.showNotifications = true;
      localStorage.removeItem('dashboardLayout');
    },
    async fetchRevenueStats() {
      try {
        this.revenueDetailsLoading = true;
        const res = await statisticsService.revenueStats();
        this.revenueDetails = res.data.data.map(item => ({
          period: item.label,
          revenue: item.totalRevenue || 0,
          growth: item.growthPercent || 0,
          order: item.orderCount || 0,
        }));
        console.log("revenueDetails: ", this.revenueDetails);
      } catch (error) {
        console.log("fetchRevenueStats error: ", error);
      } finally {
        this.revenueDetailsLoading = false;
      }
    },
    generateData(type) {
      const now = new Date();
      const labels = [];
      const values = [];

      if (type === 'day') {
        // Hiển thị theo giờ (0h - 23h)
        for (let i = 0; i < 24; i++) {
          labels.push(`${i}h`);
          values.push(Math.floor(Math.random() * 2000000 + 500000)); // giả lập doanh thu mỗi giờ
        }

      } else if (type === 'week') {
        const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        labels.push(...weekdays);
        for (let i = 0; i < 7; i++) {
          values.push(Math.floor(Math.random() * 5000000 + 1000000));
        }

      } else if (type === 'month') {
        for (let i = 1; i <= 12; i++) {
          labels.push(`T${i}`);
          values.push(Math.floor(Math.random() * 30000000 + 10000000));
        }

      } else if (type === 'quarter') {
        for (let i = 1; i <= 4; i++) {
          labels.push(`Quý ${i}`);
          values.push(Math.floor(Math.random() * 70000000 + 20000000));
        }

      } else if (type === 'year') {
        const startYear = 2020; // ví dụ: năm bắt đầu hệ thống
        const currentYear = now.getFullYear();
        for (let y = startYear; y <= currentYear; y++) {
          labels.push(`${y}`);
          values.push(Math.floor(Math.random() * 300000000 + 100000000));
        }
      }

      return { labels, values };
    },

    updateChartData() {
      let chartData;
      let orderChartData;

      switch (this.selectedPeriod) {
        case 'day':
          chartData = this.generateData('day');
          break;
        case 'week':
          chartData = this.generateData('week');
          break;
        case 'month':
          chartData = this.generateData('month');
          break;
        case 'quarter':
          chartData = this.generateData('quarter');
          break;
        case 'year':
          chartData = this.generateData('year');
          break;
      }


      console.log("revenueCharData: ", chartData);

      this.revenueChartOption.xAxis.data = chartData.labels;
      this.revenueChartOption.series[0].data = chartData.values;
      // // this.orderChartOption.series[0].data = orderChartData.map(item => ({
      // //   value: item.count, name: this.getStatusText(item.status)
      // // }));
      // this.revenueChartOption = {
      //   // giữ nguyên cấu hình tooltip, xAxis, yAxis, series như trước
      //   xAxis: { ...this.revenueChartOption.xAxis, data: chartData.labels },
      //   series: [{
      //     ...this.revenueChartOption.series?.[0],
      //     data: chartData.values
      //   }]
      // };
    },
    async fetchRevenueChart() {
      try {
        const res = await statisticsService.revenueChart(this.selectedPeriod);

        this.revenueChartOption.xAxis.data = res.data.data.map(item => item.label);
        this.revenueChartOption.series[0].data = res.data.data.map(item => item.revenue);
        console.log("revenueChartOption: ", this.revenueChartOption);
      } catch (error) {
        console.log("fetchRevenueChart error: ", error);
      }
    },
    async fetchOrderChart() {
      try {
        const res = await statisticsService.orderChart(this.selectedPeriod);

        this.orderChartOption.series[0].data = res.data.data.map(item => ({
          value: item.count, name: this.getStatusText(item.status)
        }));
        console.log("orderChartOption: ", this.orderChartOption);
      } catch (error) {
        console.log("fetchOrderChart error: ", error);
      }
    },
    async fetchRecentOrder() {
      try {
        this.recentOrderLoading = true;

        const request = {
          page: 0,
          size: 10,
        }

        const res = await orderService.getAllOrders(request);
        const data = res.data.data;
        this.recentOrders = data.content;

        console.log("FetchOrder: ", res.data);
      } catch (error) {
        console.log("Error FetchOrder: ", error)
      } finally {
        this.recentOrderLoading = false;
      }
    },
    async fetchStatsRevenue() {
      try {
        const res = await statisticsService.statsRevenue(this.selectedPeriod);
        const data = res.data.data;

        this.totalRevenueByRangeType = data.current.totalRevenue;
        this.revenueTrend = data.growthPercent;

        console.log("fetchStatsRevenueOrder: ", res.data);
      } catch (error) {
        console.log("fetchStatsRevenueOrder error: ", error);
      }
    },
    async fetchStatsOrder() {
      try {
        const res = await statisticsService.statsOrder(this.selectedPeriod);
        const data = res.data.data;

        this.totalOrderByRangeType = data.current.totalOrder;
        this.orderTrend = data.growthPercent;

        console.log("fetchStatsRevenueOrder: ", res.data);
      } catch (error) {
        console.log("fetchStatsRevenueOrder error: ", error);
      }
    },
    async fetchStatsNewCustomer() {
      try {
        const res_1 = await statisticsService.statsNewCustomerFrOrder(this.selectedPeriod);
        const res_2 = await statisticsService.statsNewCustomerFrCustomer(this.selectedPeriod);
        const data_1 = res_1.data.data;
        const data_2 = res_2.data.data;

        this.totalCustomerByRangeType = data_1.current.totalOrder + data_2.current.totalCustomers;
        this.customerTrend = data_1.growthPercent + data_2.growthPercent;

        // console.log("fetchStatsRevenueOrder: ", res.data);
      } catch (error) {
        console.log("fetchStatsRevenueOrder error: ", error);
      }
    },
    async fetchStatsTopProduct() {
      try {
        const res = await statisticsService.statsTopProduct(this.selectedPeriod);
        const data = res.data.data;

        this.totalProductByRangeType = data.current.totalRevenue;
        this.productTrend = data.growthPercent;

        console.log("fetchStatsRevenueOrder: ", res.data);
      } catch (error) {
        console.log("fetchStatsRevenueOrder error: ", error);
      }
    },
    async fetchTopProduct() {
      try {
        this.sellingLoading = true;
        const res = await productService.getTopProduct(10);
        const data = res.data.data;

        this.bestSellingProducts = data;

        console.log("fetchTopProduct: ", res.data);
      } catch (error) {
        console.log("fetchTopProduct error: ", error);
      } finally {
        this.sellingLoading = false;
      }
    },
    async fetchNewCustomer() {
      try {
        this.customerDetailLoading = true;
        const request = {
          limit: 5,
          rangeType: this.selectedPeriod
        };
        const res = await customerService.getNewCustomerStats(request);
        const data = res.data.data;

        this.customerDetails = data;

        console.log("fetchNewCustomer: ", res.data);
      } catch (error) {
        console.log("fetchNewCustomer error: ", error);
      } finally {
        this.customerDetailLoading = false;
      }
    },
    async fetchTopProductByRangeType() {
      try {
        this.customerDetailLoading = true;
        const request = {
          rangeType: this.selectedPeriod,
          limit: 5,
        };
        const res = await productService.getTopProductByRangeType(request);
        const data = res.data.data;

        this.topProductDetails = data;

        console.log("fetchTopProductByRangeType: ", res.data);
      } catch (error) {
        console.log("fetchTopProductByRangeType error: ", error);
      } finally {
        this.customerDetailLoading = false;
      }
    }
  },
  watch: {
    chartType: {
      handler: 'updateChartType',
      immediate: true
    },
  },
  mounted() {
    this.loadLayout();
    this.loadDashboardData();
  }
}
</script>

<style scoped>
/* Reset và chuẩn hóa kích thước */
:root {
  --primary-color: #1976D2;
  --success-color: #4CAF50;
  --warning-color: #FB8C00;
  --error-color: #E53935;
  --info-color: #2196F3;
  --card-padding: 24px;
  --border-radius: 12px;
  --font-size-h4: 1.5rem;
  --font-size-h6: 1.25rem;
  --font-size-subtitle: 1rem;
  --font-size-body: 0.875rem;
  --card-gap: 24px;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
  --transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Container và layout */
.v-container {
  padding: var(--card-padding);
  background-color: #f8f9fa;
  max-width: 1600px;
  margin: 0 auto;
}

.v-row {
  margin: 0 calc(-1 * var(--card-gap) / 2);
}

.v-col {
  padding: calc(var(--card-gap) / 2);
}

/* Card styles */
.v-card {
  border-radius: var(--border-radius);
  height: 100%;
  box-shadow: var(--shadow-sm) !important;
  transition: var(--transition-base);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
  background: white;
}

.v-card:hover {
  box-shadow: var(--shadow-md) !important;
  transform: translateY(-2px);
}

.v-card-title {
  font-size: var(--font-size-h6) !important;
  font-weight: 600;
  padding: var(--card-padding);
  line-height: 1.5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(to right, var(--v-theme-surface), var(--v-theme-surface-variant));
}

.v-card-text {
  padding: var(--card-padding);
}

/* Thống kê cards */
.stat-card {
  height: 100%;
  padding: var(--card-padding);
  border-radius: var(--border-radius);
  background: white;
  border: none;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-color);
  transition: var(--transition-base);
}

.stat-card:hover::before {
  height: 6px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-card .text-h4 {
  font-size: var(--font-size-h4) !important;
  font-weight: 700;
  margin: 12px 0;
  color: var(--primary-color);
}

.stat-card .text-subtitle-2 {
  font-size: var(--font-size-subtitle) !important;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 8px;
}

.stat-card .text-caption {
  font-size: var(--font-size-body) !important;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Biểu đồ */
.chart {
  height: 400px;
  width: 100%;
  margin: 0;
  padding: 16px;
}

.chart-container {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
}

.chart-container:hover {
  box-shadow: var(--shadow-md);
}

/* Bảng */
.v-data-table {
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  background: white;
}

.v-data-table :deep(th) {
  font-size: var(--font-size-subtitle) !important;
  font-weight: 600;
  background: #f8f9fa;
  padding: 16px var(--card-padding) !important;
  text-transform: capitalize;
  letter-spacing: 0.5px;
  color: rgba(0, 0, 0, 0.87);
}

.v-data-table :deep(td) {
  font-size: var(--font-size-body) !important;
  padding: 16px var(--card-padding) !important;
  color: rgba(0, 0, 0, 0.87);
  text-align: center;
}

/* Buttons */
.v-btn {
  font-size: var(--font-size-body) !important;
  font-weight: 600;
  height: 40px;
  border-radius: calc(var(--border-radius) / 2);
  text-transform: none;
  letter-spacing: 0.5px;
  transition: var(--transition-base);
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.v-btn--icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* Menu */
.v-menu :deep(.v-list) {
  padding: calc(var(--card-padding) / 2);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  background: white;
}

.v-menu :deep(.v-list-item) {
  font-size: var(--font-size-body) !important;
  height: 40px;
  border-radius: calc(var(--border-radius) / 2);
  margin-bottom: 4px;
  transition: var(--transition-base);
}

.v-menu :deep(.v-list-item:hover) {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* Form fields */
.v-text-field :deep(.v-field__input),
.v-select :deep(.v-field__input) {
  font-size: var(--font-size-body) !important;
  height: 40px;
  border-radius: var(--border-radius);
}

.v-text-field :deep(.v-field__outline__start) {
  border-radius: var(--border-radius) 0 0 var(--border-radius);
}

.v-text-field :deep(.v-field__outline__end) {
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
}

/* Chips */
.v-chip {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.v-chip.success {
  background-color: rgba(76, 175, 80, 0.1) !important;
  color: var(--success-color) !important;
}

.v-chip.warning {
  background-color: rgba(251, 140, 0, 0.1) !important;
  color: var(--warning-color) !important;
}

.v-chip.error {
  background-color: rgba(229, 57, 53, 0.1) !important;
  color: var(--error-color) !important;
}

.v-chip.info {
  background-color: rgba(33, 150, 243, 0.1) !important;
  color: var(--info-color) !important;
}

/* Dark mode */
:root[theme="dark"] {
  .v-container {
    background-color: #121212;
  }

  .v-card,
  .stat-card,
  .chart-container,
  .v-data-table {
    background-color: #1E1E1E;
    border-color: rgba(255, 255, 255, 0.05);
  }

  .v-card-title,
  .stat-card .text-subtitle-2,
  .v-data-table :deep(th),
  .v-data-table :deep(td) {
    color: rgba(255, 255, 255, 0.87);
  }

  .stat-card .text-caption {
    color: rgba(255, 255, 255, 0.6);
  }

  .v-data-table :deep(th) {
    background-color: #2D2D2D;
  }
}

/* Responsive */
@media (max-width: 960px) {
  :root {
    --card-padding: 20px;
    --card-gap: 20px;
    --font-size-h4: 1.25rem;
  }

  .chart {
    height: 350px;
  }
}

@media (max-width: 600px) {
  :root {
    --card-padding: 16px;
    --card-gap: 16px;
    --font-size-h4: 1.125rem;
    --font-size-h6: 1rem;
  }

  .v-btn {
    height: 36px;
    font-size: 0.8125rem !important;
  }

  .v-btn--icon {
    width: 36px;
    height: 36px;
  }

  .stat-card {
    padding: 16px;
  }
}
</style>