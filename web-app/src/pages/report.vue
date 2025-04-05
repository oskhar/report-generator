<script setup>
import { ref, onBeforeUnmount, onMounted, watch } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import axios from 'axios'
import { VCardTitle } from 'vuetify/components/VCard'

const data = ref({
  judul: '',
  tabel: [],
  keterangan: '',
})

const isInitialLoad = ref(true)
const showModal = ref(false)
const showDeleteConfirmation = ref(false)
const modalType = ref('add')
const currentRow = ref({ id: 0, nama: '', dansos: '', kas: '' })
const editingIndex = ref(-1)
const rowToDelete = ref({ id: null, index: -1 })
const fileInput = ref(null) // Tambahkan ref untuk input file

const generatePDF = async () => {
  try {
    const response = await axios.get('http://localhost:3000/pdf', {
      responseType: 'blob', // Penting untuk menerima data binary
    })

    // Membuat URL dari blob
    const url = window.URL.createObjectURL(new Blob([response.data]))

    // Membuat elemen anchor untuk download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'laporan.pdf')
    document.body.appendChild(link)

    // Trigger download
    link.click()

    // Cleanup
    window.URL.revokeObjectURL(url)
    link.remove()
  } catch (error) {
    console.error('Gagal mencetak PDF:', error)
    alert('Gagal mencetak PDF')
  }
}

// Fungsi debounce untuk autosave
const debounce = (func, wait) => {
  let timeout
  return function (...args) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(context, args), wait)
  }
}

const saveData = debounce(() => {
  axios
    .put('http://localhost:3000/', {
      judul: data.value.judul,
      keterangan: data.value.keterangan,
    })
    .then(() => console.log('Perubahan berhasil disimpan'))
    .catch(error => console.error('Gagal menyimpan perubahan:', error))
}, 500)

watch(
  () => [data.value.judul, data.value.keterangan],
  () => {
    if (!isInitialLoad.value) saveData()
  },
)

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000')
    data.value = response.data.data
    editor.commands.setContent(data.value.keterangan)
    isInitialLoad.value = false
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
      HTMLAttributes: { class: 'editor-content' },
    }),
  ],
  onUpdate({ editor }) {
    data.value.keterangan = editor.getHTML()
  },
})

onBeforeUnmount(() => editor.destroy())

// Fungsi untuk handle import JSON
const handleFileImport = async event => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async e => {
    try {
      const jsonData = JSON.parse(e.target.result)

      // Kirim data JSON ke endpoint /import
      const response = await axios.post('http://localhost:3000/import', jsonData)

      // Jika sukses, update data lokal
      if (response.data.status) {
        data.value = jsonData
        editor.commands.setContent(jsonData.keterangan)
        alert('Import berhasil!')
      }
    } catch (error) {
      console.error('Error importing file:', error)
      alert('Gagal mengimpor file. Pastikan format JSON benar.')
    }
  }
  reader.readAsText(file)
}

const confirmDelete = () => {
  showDeleteConfirmation.value = true
}

const handleDelete = async () => {
  try {
    await axios.delete(`http://localhost:3000/tabel/${rowToDelete.value.id}`)
    data.value.tabel.splice(rowToDelete.value.index, 1)
    showDeleteConfirmation.value = false
    showModal.value = false
  } catch (error) {
    console.error('Gagal menghapus data:', error)
    alert('Gagal menghapus data')
  }
}

const openAddModal = () => {
  currentRow.value = { id: 0, nama: '', dansos: '', kas: '' }
  modalType.value = 'add'
  showModal.value = true
}

const openEditModal = (row, index) => {
  currentRow.value = { ...row }
  editingIndex.value = index
  rowToDelete.value = { id: row.id, index }
  modalType.value = 'edit'
  showModal.value = true
}

const saveRow = async () => {
  try {
    if (modalType.value === 'add') {
      const response = await axios.post('http://localhost:3000/tabel/', {
        nama: currentRow.value.nama,
        dansos: parseInt(currentRow.value.dansos),
        kas: parseInt(currentRow.value.kas),
      })
      if (response) data.value.tabel.push({ ...currentRow.value })
    } else {
      const response = await axios.put(`http://localhost:3000/tabel/${currentRow.value.id}`, {
        nama: currentRow.value.nama,
        dansos: parseInt(currentRow.value.dansos),
        kas: parseInt(currentRow.value.kas),
      })
      if (response) data.value.tabel[editingIndex.value] = { ...currentRow.value }
    }
  } catch (error) {
    console.log(error)
  }
  showModal.value = false
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
          <VBtn
            v-if="modalType === 'edit'"
            color="error"
            @click="confirmDelete"
          >
            Hapus
          </VBtn>
          <VSpacer />
          <VBtn
            color="secondary"
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

    <!-- Modal Konfirmasi Hapus -->
    <VDialog
      v-model="showDeleteConfirmation"
      max-width="500"
    >
      <VCard class="pa-4">
        <VCardTitle class="text-h5">Konfirmasi Hapus</VCardTitle>
        <VCardText>Apakah Anda yakin ingin menghapus data ini?</VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            @click="showDeleteConfirmation = false"
            >Batal</VBtn
          >
          <VBtn
            color="error"
            @click="handleDelete"
            >Hapus</VBtn
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
              color="info"
              @click="openEditModal(row, index)"
            >
              <i class="ri-edit-line" />
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

    <div class="d-flex gap-3 mt-3">
      <VBtn
        color="success"
        prepend-icon="ri-download-2-fill"
        @click="generatePDF"
      >
        Cetak PDF
      </VBtn>

      <!-- Tombol Import JSON -->
      <VBtn
        color="primary"
        prepend-icon="ri-upload-2-fill"
        @click="fileInput.click()"
      >
        Import JSON
      </VBtn>

      <!-- Input file hidden -->
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        hidden
        @change="handleFileImport"
      />
    </div>
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
