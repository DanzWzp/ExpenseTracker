<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <div>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Profil</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">Kelola informasi akunmu.</p>
    </div>

    <!-- Identitas -->
    <div class="card flex items-center gap-4">
      <span class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-600 dark:text-white">
        {{ initials }}
      </span>
      <div>
        <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ displayName }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
      </div>
    </div>

    <!-- Update nama -->
    <form class="card space-y-4" @submit.prevent="saveName">
      <h3 class="font-semibold text-gray-900 dark:text-white">Nama Tampilan</h3>
      <input v-model="name" type="text" class="input" placeholder="Nama tampilan" />
      <div class="flex justify-end">
        <button type="submit" class="btn-primary" :disabled="savingName">{{ savingName ? 'Menyimpan...' : 'Simpan Nama' }}</button>
      </div>
    </form>

    <!-- Update email -->
    <form class="card space-y-4" @submit.prevent="saveEmail">
      <h3 class="font-semibold text-gray-900 dark:text-white">Ubah Email</h3>
      <input v-model="email" type="email" class="input" placeholder="Email baru" />
      <p class="text-xs text-gray-400">Setelah diubah, konfirmasi akan dikirim ke email baru.</p>
      <div class="flex justify-end">
        <button type="submit" class="btn-primary" :disabled="savingEmail">{{ savingEmail ? 'Menyimpan...' : 'Simpan Email' }}</button>
      </div>
    </form>

    <!-- Update password -->
    <form class="card space-y-4" @submit.prevent="savePassword">
      <h3 class="font-semibold text-gray-900 dark:text-white">Ubah Kata Sandi</h3>
      <input v-model="password" type="password" class="input" placeholder="Kata sandi baru (min. 6 karakter)" />
      <input v-model="confirmPass" type="password" class="input" placeholder="Ulangi kata sandi baru" />
      <p v-if="passMismatch" class="form-error">Kata sandi tidak cocok.</p>
      <div class="flex justify-end">
        <button type="submit" class="btn-primary" :disabled="savingPass || passMismatch || !password">
          {{ savingPass ? 'Menyimpan...' : 'Ubah Kata Sandi' }}
        </button>
      </div>
    </form>

    <!-- Logout -->
    <div class="card flex items-center justify-between">
      <div>
        <h3 class="font-semibold text-gray-900 dark:text-white">Keluar</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Akhiri sesi di perangkat ini.</p>
      </div>
      <button class="btn-danger" @click="onLogout"><ArrowRightOnRectangleIcon class="h-4 w-4" /> Keluar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'

const { user, displayName, updateProfile, logout } = useAuth()
const toast = useToast()
const router = useRouter()

const name = ref(displayName.value)
const email = ref('')
const password = ref('')
const confirmPass = ref('')
const savingName = ref(false)
const savingEmail = ref(false)
const savingPass = ref(false)

watchEffect(() => {
  if (!email.value && user.value?.email) email.value = user.value.email
})

const initials = computed(() =>
  displayName.value.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
)
const passMismatch = computed(() => !!confirmPass.value && password.value !== confirmPass.value)

async function saveName() {
  savingName.value = true
  try {
    await updateProfile({ displayName: name.value.trim() })
    toast.success('Nama berhasil diperbarui.')
  } catch (e: unknown) {
    toast.error((e as { message?: string })?.message || 'Gagal memperbarui nama.')
  } finally {
    savingName.value = false
  }
}

async function saveEmail() {
  savingEmail.value = true
  try {
    await updateProfile({ email: email.value })
    toast.info('Cek email barumu untuk konfirmasi perubahan.')
  } catch (e: unknown) {
    toast.error((e as { message?: string })?.message || 'Gagal memperbarui email.')
  } finally {
    savingEmail.value = false
  }
}

async function savePassword() {
  if (password.value.length < 6) {
    toast.error('Kata sandi minimal 6 karakter.')
    return
  }
  savingPass.value = true
  try {
    await updateProfile({ password: password.value })
    toast.success('Kata sandi berhasil diubah.')
    password.value = ''
    confirmPass.value = ''
  } catch (e: unknown) {
    toast.error((e as { message?: string })?.message || 'Gagal mengubah kata sandi.')
  } finally {
    savingPass.value = false
  }
}

async function onLogout() {
  await logout()
  router.replace('/login')
}
</script>
