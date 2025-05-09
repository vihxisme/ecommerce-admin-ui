<template>
  <v-card class="pa-4" elevation="2">
    <v-snackbar v-model="notiShow" :timeout="5000" location="top right" :color="notiColor">{{ notiContent
    }}</v-snackbar>
    <v-card-title class="text-h3 font-weight-bold">Cài đặt về cửa hàng</v-card-title>
    <v-form ref="storeFormRef" v-model="formValid">
      <v-card-text>
        <v-card-title class="text-h5 font-weight-bold text-left">Logo</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-file-input v-model="formData.logoFile" type="file" ref="fileInput" accept="image/*"
                style="display: none;" @change="handleImageChange" />

              <!-- Custom image selector -->
              <v-sheet class="d-flex align-center justify-center rounded-lg" elevation="2" height="200" width="20%"
                color="grey-lighten-3" style="cursor: pointer; position: relative;" @click="triggerFileInput">
                <!-- Hiển thị ảnh đã chọn -->
                <v-img v-if="formData.logo" :src="formData.logo" height="100%" width="100%" cover
                  class="rounded-lg"></v-img>

                <!-- Hiện icon khi chưa có ảnh -->

                <div v-else class="flex flex-col">
                  <v-icon size="2rem" color="grey">mdi-camera</v-icon>
                  <span class="text-xs mx-2">Thêm ảnh</span>
                </div>

                <!-- Nút xóa ảnh -->
                <v-btn v-if="formData.logo" icon color="error" size="x-small" variant="flat"
                  style="position: absolute; top: 4px; right: 4px; z-index: 2;" @click.stop="removeImage">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card-text>
      <v-card-text>
        <v-card-title class="text-h5 font-weight-bold text-left">Thông tin cửa hàng</v-card-title>
        <v-text-field v-model="formData.nameStore" label="Tên cửa hàng" :rules="[v => !!v || 'Trường này là bắt buộc']"
          outlined require />
        <v-text-field v-model="formData.phone" type="tel" label="Số điện thoại"
          :rules="[v => !!v && /^\+?\d{9,15}$/.test(v) || 'Số điện thoại không hợp lệ']" outlined require />
        <v-text-field v-model="formData.email" type="email" label="Email liên hệ"
          :rules="[v => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email không hợp lệ']" outlined require />
        <v-text-field v-model="formData.address" label="Trụ sở chính" :rules="[v => !!v || 'Trường này là bắt buộc']"
          outlined require />
      </v-card-text>
      <v-card-text>
        <v-card-title class="text-h5 font-weight-bold text-left">
          Giới thiệu về Cửa hàng
        </v-card-title>
        <quill-editor v-model:content="formData.content" content-type="html" theme="snow" />
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn color="primary" variant="elevated" min-width="150px" :loading="loadingAboutStore"
          @click="handleSaveAboutStore">Lưu</v-btn>
      </v-card-actions>
    </v-form>
    <v-form>
      <v-card-text>
        <v-card-title class="text-h5 font-weight-bold text-left">Banner</v-card-title>
        <v-row>
          <v-col v-for="imageObj in dynamicImages" :key="imageObj.key" cols="12" md="3">
            <v-file-input type="file" :ref="setDynamicFileInputRef(imageObj.key)" accept="image/*"
              style="display: none;" @change="event => handleDynamicImageChange(event, imageObj.key)" />
            <v-sheet class="d-flex align-center justify-center rounded-lg" elevation="2" height="200"
              color="grey-lighten-3" style="cursor: pointer; position: relative;"
              @click="triggerDynamicFileInput(imageObj.key)">
              <!-- Nếu có ảnh -->
              <v-img v-if="imageObj.url" :src="imageObj.url" height="100%" width="100%" cover
                class="rounded-lg"></v-img>

              <!-- Nếu chưa có ảnh -->
              <div v-else class="flex flex-col">
                <v-icon size="2rem" color="grey">mdi-camera</v-icon>
                <span class="text-xs mx-2">Thêm ảnh</span>
              </div>

              <!-- Nút xóa ảnh -->
              <v-btn v-if="imageObj.url" icon color="error" size="x-small" variant="flat"
                style="position: absolute; top: 4px; right: 4px; z-index: 2;"
                @click.stop="removeDynamicImage(imageObj.key)">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn color="primary" variant="elevated" min-width="150px" :loading="loadingBanner"
          @click="handleSaveBanner">Lưu</v-btn>
      </v-card-actions>
    </v-form>

  </v-card>
</template>

<script setup>
import { ref, onMounted, nextTick, reactive } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import { aboutService } from '../../api/services/aboutService'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { getCloudinaryUrl } from '../../utils/cloudinary'
import { uploadImageToCloudinary } from '../../api/services/cloudinaryService'

const storeFormRef = ref()
const formValid = ref(false)

const notiShow = ref(false);
const notiColor = ref();
const notiContent = ref();

const modules = {
  toolbar: [
    [{ 'font': [] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'align': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ]
};

onMounted(() => {
  // Chờ toolbar render xong rồi thêm tooltip
  nextTick(() => {
    const buttons = [
      { selector: '.ql-bold', title: 'In đậm (Bold)' },
      { selector: '.ql-italic', title: 'In nghiêng (Italic)' },
      { selector: '.ql-underline', title: 'Gạch chân (Underline)' },
      { selector: '.ql-strike', title: 'Gạch ngang (Strike)' },
      { selector: '.ql-align', title: 'Căn lề' },
      { selector: '.ql-list[value="ordered"]', title: 'Danh sách có số' },
      { selector: '.ql-list[value="bullet"]', title: 'Danh sách dấu chấm' },
      { selector: '.ql-link', title: 'Chèn liên kết' },
      { selector: '.ql-image', title: 'Chèn hình ảnh' },
      { selector: '.ql-clean', title: 'Xoá định dạng' },
    ]

    buttons.forEach(({ selector, title }) => {
      const el = document.querySelector(selector)
      if (el) el.setAttribute('title', title)
    })
  })
})

const formData = ref({
  id: null,
  nameStore: null,
  email: null,
  phone: null,
  address: null,
  content: null,
  logo: null,
  logoFile: null,
})

// logo
const fileInput = ref(null);
// -- logo --
const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (!file || !isImageFile(file)) {
    alert('Vui lòng chọn file hình ảnh hợp lệ (jpg, png, gif, webp)');
    return;
  }

  formData.value.logoFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    formData.value.logo = e.target.result;
  };
  reader.readAsDataURL(file);
}

const removeImage = () => {
  formData.value.logo = null;
  formData.value.logoFile = null;
  console.log("FormData: ", formData.value);
}

const triggerFileInput = () => {
  fileInput.value?.click();
}
// Banner
const dynamicImages = ref([{ key: `new-${Date.now()}`, file: null, url: null }]);
const dynamicFileInputs = reactive({});

const setDynamicFileInputRef = (key) => (el) => {
  dynamicFileInputs[key] = el;
};

const triggerDynamicFileInput = (key) => {
  dynamicFileInputs[key]?.click();
};

const handleDynamicImageChange = (event, key) => {
  const file = event.target.files[0];
  if (!file || !isImageFile(file)) {
    alert('Vui lòng chọn file hình ảnh hợp lệ (jpg, png, gif, webp)');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = dynamicImages.value.find(img => img.key === key);
    if (img) {
      img.file = file;
      img.url = e.target.result;

      // Nếu là ảnh cuối, thêm khung mới
      if (img === dynamicImages.value[dynamicImages.value.length - 1]) {
        dynamicImages.value.push({ key: `new-${Date.now()}`, file: null, url: null });
      }
    }
  };
  reader.readAsDataURL(file);
};

const removeDynamicImage = (key) => {
  const index = dynamicImages.value.findIndex(img => img.key === key);
  if (index !== -1) {
    dynamicImages.value.splice(index, 1);
  }

  if (dynamicImages.value.length === 0) {
    dynamicImages.value.push({ key: `new-${Date.now()}`, file: null, url: null });
  }
};
const isImageFile = (file) => {
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const fileName = file.name.toLowerCase();
  const extensionCheck = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.webp');

  return acceptedTypes.includes(file.type) || extensionCheck;
};
// Banner

const originalDynamicImage = ref([]);
const loadingBanner = ref(false);
const fetchBanner = async () => {
  try {
    const res = await aboutService.getAllBanner();
    const data = res.data.data;

    dynamicImages.value = [
      ...data.map(item => ({
        key: item.id,
        file: null,
        url: getCloudinaryUrl(item.bannerUrl)
      })),
      { key: `new-${Date.now()}`, file: null, url: null }
    ];
    originalDynamicImage.value = data;

    console.log("fetchBanner: ", res.data);
  } catch (error) {
    console.log("fetchBanner error: ", error);
  }
}
const handleSaveBanner = async () => {
  try {
    loadingBanner.value = true;

    console.log("originalDynamicImage: ", originalDynamicImage.value);
    console.log("dynamicImages: ", dynamicImages.value);
    const finalImages = dynamicImages.value.filter(img => img.file || img.url); // Bỏ ảnh trống
    console.log("finalImages: ", finalImages);

    const deletedIds = originalDynamicImage.value
      .map(img => img.id)
      .filter(id => !finalImages.some(updated => updated.key === id));

    console.log("delete: ", deletedIds);

    let res_delete;
    if (deletedIds.length > 0) {
      res_delete = await aboutService.deleteBanner(deletedIds);
    }

    const updatedImages = finalImages.filter(img =>
      typeof img.key === 'number' && img.file // Ảnh cũ bị thay
    );

    const newImages = finalImages.filter(img =>
      typeof img.key === 'string' && img.key.startsWith('new-') && img.file // Ảnh mới thêm
    );

    let res_created;
    if (newImages.length > 0) {
      const uploadedNew = await uploadDynamicImages(newImages);

      const created = uploadedNew.map(img => ({
        bannerUrl: img.url
      }));

      res_created = await aboutService.createBanner(created);
    }


    let res_updated;
    if (updatedImages.length > 0) {
      const uploadedUpdated = await uploadDynamicImages(updatedImages);

      const updated = uploadedUpdated.map(img => ({
        id: img.key,
        bannerUrl: img.url
      }));

      res_updated = await aboutService.updateBanner(updated);
    }


    console.log("delete: ", deletedIds);
    console.log("updated: ", updatedImages);
    console.log("created: ", newImages);

    notiColor.value = "success";
    notiContent.value = "Cập nhập banner thành công!";

    fetchBanner();
    notiShow.value = true;
  } catch (error) {
    notiColor.value = "error";
    notiContent.value = "Có lỗi xảy ra!";
    notiShow.value = true;
    console.log("handleSaveBanner error: ", error);
  } finally {
    loadingBanner.value = false;
  }
}
const uploadDynamicImages = async (imageList) => {
  const results = [];

  for (const image of imageList) {
    if (image.file) {
      const url = await uploadImageToCloudinary(image.file);
      const path = url.split('/upload/')[1];
      results.push({
        key: image.key,
        url: path
      });
    }
  }

  return results;
};

const loadingAboutStore = ref(false);
const handleSaveAboutStore = async () => {
  if (!storeFormRef.value.validate()) return;

  try {
    loadingAboutStore.value = true;

    console.log("formdata upd: ", formData.value);
    if (formData.value.logoFile && formData.value.logo !== originalImageUrl.value) {
      const uploadedUrl = await uploadImageToCloudinary(formData.value.logoFile);
      const filePath = uploadedUrl.split('/upload/')[1];
      formData.value.logo = filePath;
      formData.value.logoFile = null;
      console.log("pass");
    }

    console.log("formdata upd PreReq: ", formData.value);
    const request = {
      id: formData.value.id,
      name: formData.value.nameStore,
      phone: formData.value.phone,
      email: formData.value.email,
      address: formData.value.address,
      content: formData.value.content,
      logo: formData.value.logo || ""
    }
    console.log("formdata upd NexReq: ", formData.value);
    console.log("request: ", request);
    const res = await aboutService.updateAboutStore(request);
    const data = res.data.data;

    if (data) {
      notiColor.value = "success";
      notiContent.value = "Cập nhập thông tin thành công!";
    } else {
      notiColor.value = "error";
      notiContent.value = "Cập nhập thông tin thất bại!";
    }

    notiShow.value = true;
    fetchAboutStore();
  } catch (error) {
    notiColor.value = "error";
    notiContent.value = "Có lỗi xảy ra!";
    notiShow.value = true;
    console.log("handleSaveAboutStore error: ", error);
  } finally {
    loadingAboutStore.value = false;
  }
}

const originalImageUrl = ref();
const fetchAboutStore = async () => {
  try {
    const res = await aboutService.getAboutStore();
    const data = res.data.data;

    formData.value = {
      id: data[0].id,
      nameStore: data[0].name,
      phone: data[0].phone,
      email: data[0].email,
      address: data[0].address,
      content: data[0].content,
      logo: getCloudinaryUrl(data[0].logo)
    };

    originalImageUrl.value = data[0].logo;

    console.log("fetchAboutStore: ", res.data);
  } catch (error) {
    console.log("fetchAboutStore error: ", error);
  }
}

onMounted(() => {
  fetchAboutStore();
  fetchBanner();
})
</script>

<style scoped>
/* .editor {
  min-height: 400px;
} */
</style>
