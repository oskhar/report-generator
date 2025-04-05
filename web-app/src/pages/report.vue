<script setup>
import { ref, onBeforeUnmount, onMounted, watch } from 'vue' // <-- Tambahkan watch
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import axios from 'axios'
import { VCardTitle } from 'vuetify/components/VCard'

const data = ref({
  judul: '',
  tabel: [],
  keterangan: '',
})

const isInitialLoad = ref(true) // <-- Tambahkan flag inisialisasi
const deleteMode = ref(false)
const showModal = ref(false)
const modalType = ref('add')
const currentRow = ref({
  id: 0,
  nama: '',
  dansos: '',
  kas: '',
})
const editingIndex = ref(-1)

// Fungsi debounce untuk mengontrol frekuensi request
const debounce = (func, wait) => {
  let timeout
  return function (...args) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(context, args), wait)
  }
}

// Fungsi save data dengan debounce 500ms
const saveData = debounce(() => {
  axios
    .put('http://localhost:3000/', {
      judul: data.value.judul,
      keterangan: data.value.keterangan,
    })
    .then(() => console.log('Perubahan berhasil disimpan'))
    .catch(error => console.error('Gagal menyimpan perubahan:', error))
}, 500)

// Watcher untuk perubahan judul dan keterangan
watch(
  () => [data.value.judul, data.value.keterangan],
  () => {
    if (!isInitialLoad.value) {
      saveData()
    }
  },
)

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000')
    data.value = response.data
    editor.commands.setContent(data.value.keterangan)
    isInitialLoad.value = false // <-- Set flag setelah data di-load
  } catch (error) {
    console.error('Gagal fetch data:', error)
    isInitialLoad.value = false
  }
})

const editor = new Editor({
  extensions: [
    StarterKit.configure({
      heading: false,
      codeBlock: false,
      blockquote: false,
      HTMLAttributes: {
        class: 'editor-content',
      },
    }),
  ],
  onUpdate({ editor }) {
    data.value.keterangan = editor.getHTML()
  },
})

onBeforeUnmount(() => editor.destroy())

const openAddModal = () => {
  currentRow.value = { nama: '', dansos: '', kas: '' }
  modalType.value = 'add'
  showModal.value = true
}

const openEditModal = (row, index) => {
  currentRow.value = { ...row }
  editingIndex.value = index
  modalType.value = 'edit'
  showModal.value = true
}

const saveRow = () => {
  if (modalType.value === 'add') {
    data.value.tabel.push({ ...currentRow.value })
  } else {
    data.value.tabel[editingIndex.value] = { ...currentRow.value }
  }
  showModal.value = false
}

const deleteRow = index => {
  data.value.tabel.splice(index, 1)
}
</script>

<template>
  <VContainer>
    <!-- Modal Tambah/Edit -->
    <VDialog
      v-model="showModal"
      max-width="600"
    >
      <VCard class="pa-4">
        <VCardTitle class="text-h5">
          {{ modalType === 'add' ? 'Tambah Baru' : 'Edit Data' }}
        </VCardTitle>
        <VCardText>
          <VTextField
            v-model="currentRow.nama"
            label="Nama"
            class="mt-5"
          />
          <VTextField
            v-model="currentRow.dansos"
            label="Dansos"
            class="mt-4"
          />
          <VTextField
            v-model="currentRow.kas"
            label="Kas"
            class="mt-4"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="error"
            @click="showModal = false"
            >Batal</VBtn
          >
          <VBtn
            color="success"
            @click="saveRow"
            >Simpan</VBtn
          >
        </VCardActions>
      </VCard>
    </VDialog>

    <VCard class="pa-4">
      <VCardTitle class="text-primary">Judul</VCardTitle>
      <VTextField
        id="judul"
        v-model="data.judul"
        placeholder="Tambahkan Judul"
        class="mt-2"
      />
    </VCard>

    <VCard
      variant="outlined"
      class="mt-3 pa-4"
    >
      <VCardTitle class="text-primary">Laporan Dana</VCardTitle>
      <VRow class="my-1">
        <VCol>
          <VBtn
            block
            color="success"
            prepend-icon="ri-add-fill"
            @click="openAddModal"
          >
            Tambah
          </VBtn>
        </VCol>
        <VCol>
          <VBtn
            v-if="!deleteMode"
            block
            color="error"
            prepend-icon="ri-delete-bin-line"
            @click="deleteMode = true"
          >
            Hapus
          </VBtn>
          <VBtn
            v-if="deleteMode"
            block
            color="info"
            prepend-icon="ri-edit-line"
            @click="deleteMode = false"
          >
            Edit Data
          </VBtn>
        </VCol>
      </VRow>
      <VCard
        v-for="(row, index) in data.tabel"
        :key="index"
        class="pa-2 mt-1"
      >
        <VRow>
          <VCol class="ml-2">{{ index + 1 }}</VCol>
          <VCol>{{ row.nama }}</VCol>
          <VCol>{{ row.dansos }}</VCol>
          <VCol>{{ row.kas }}</VCol>
          <VCol style="max-width: 4rem">
            <VBtn
              v-if="!deleteMode"
              color="info"
              @click="openEditModal(row, index)"
            >
              <i class="ri-edit-line" />
            </VBtn>
            <VBtn
              v-if="deleteMode"
              color="error"
              @click="deleteRow(index)"
            >
              <i class="ri-delete-bin-line" />
            </VBtn>
          </VCol>
        </VRow>
      </VCard>
    </VCard>

    <VCard class="pa-4 mt-3">
      <VCardTitle class="text-primary">Keterangan</VCardTitle>
      <div class="toolbar">
        <VBtn
          color="info"
          class="mr-3"
          variant="tonal"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <i class="ri-bold" />
        </VBtn>
        <VBtn
          color="info"
          class="mr-3"
          variant="tonal"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <i class="ri-italic" />
        </VBtn>
        <VBtn
          color="info"
          class="mr-3"
          variant="tonal"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          <i class="ri-underline" />
        </VBtn>
      </div>
      <EditorContent
        :editor="editor"
        class="mt-4 editor-content"
      />
    </VCard>

    <VBtn
      color="success"
      class="mt-3"
      prepend-icon="ri-download-2-fill"
    >
      Cetak PDF
    </VBtn>
  </VContainer>
</template>

<style>
.ProseMirror {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  min-height: 8rem;
  font-family: sans-serif;
  font-size: 16px;
}
</style>
