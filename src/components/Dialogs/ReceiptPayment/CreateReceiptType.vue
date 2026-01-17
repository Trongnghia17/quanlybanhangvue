<template>
  <v-dialog
    :value="open"
    :width="500"
    :max-width="800"
    :min-width="320"
    scrollable
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card class="rounded-lg elevation-12">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title class="text-h6 font-weight-medium">
          <v-icon left>mdi-plus-circle</v-icon>
          Tạo mới loại phiếu thu chi
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-5">
        <p class="text-subtitle-1 grey--text text--darken-1 mb-4">
          Nhập thông tin loại phiếu thu chi mới để thêm vào hệ thống.
        </p>

        <v-form @submit.prevent="submit" ref="form" v-model="valid">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="name"
                label="Tên loại phiếu"
                prepend-icon="mdi-text-box"
                outlined
                dense
                auto-focus
                :rules="nameRules"
                class="mb-2"
                color="primary"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-select
                v-model="type"
                :items="typeOptions"
                label="Loại phiếu"
                prepend-icon="mdi-file-document"
                outlined
                dense
                :rules="typeRules"
                class="mb-2"
                color="primary"
                hide-details="auto"
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="description"
                label="Mô tả (tùy chọn)"
                prepend-icon="mdi-text"
                outlined
                dense
                rows="3"
                auto-grow
                class="mb-2"
                color="primary"
                hide-details="auto"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey darken-1"
          text
          class="text-none"
          @click="$emit('close')"
          :disabled="loading"
        >
          Hủy
        </v-btn>
        <v-btn
          color="primary"
          class="text-none"
          elevation="1"
          @click="submit"
          :loading="loading"
          :disabled="!valid"
        >
          Tạo loại phiếu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'CreateReceiptTypeDialog',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valid: false,
      name: '',
      type: 1,
      description: '',

      // Validation rules
      nameRules: [
        v => (v && v.trim().length > 0) || 'Tên loại phiếu là bắt buộc',
        v => {
          if (!v) return true;
          if (typeof v !== 'string') return 'Giá trị không hợp lệ';
          return v.trim().length <= 100 || 'Tên loại phiếu không quá 100 ký tự';
        }
      ],

      typeRules: [
        v => !!v || 'Loại phiếu là bắt buộc'
      ],

      typeOptions: [
        { text: 'Phiếu thu', value: 1 },
        { text: 'Phiếu chi', value: 2 }
      ]
    };
  },
  methods: {
    submit() {
      if (!this.$refs.form.validate()) return;

      const payload = {
        name: this.name.trim(),
        type: this.type,
        description: this.description.trim() || null
      };

      this.$emit('create', payload);
    },
    resetForm() {
      this.$refs.form.reset();
      this.name = '';
      this.type = 1;
      this.description = '';
    }
  },
  watch: {
    open(val) {
      if (!val) {
        this.resetForm();
      }
    }
  }
};
</script>
