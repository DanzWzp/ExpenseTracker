import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'
import { prisma } from './prisma'

/**
 * Memastikan request berasal dari user terautentikasi (sesi Supabase valid),
 * lalu menyinkronkan baris user ke tabel `users` publik (untuk relasi Prisma).
 * Lemparkan 401 jika belum login.
 */
export async function requireUser(event: H3Event) {
  let authUser
  try {
    authUser = await serverSupabaseUser(event)
  } catch {
    authUser = null
  }

  if (!authUser) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Tidak terautentikasi. Silakan login terlebih dahulu.',
    })
  }

  // Upsert agar baris user selalu ada sebelum membuat relasi (expense, budget, dll).
  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: { email: authUser.email ?? '' },
    create: {
      id: authUser.id,
      email: authUser.email ?? '',
      displayName:
        (authUser.user_metadata?.displayName as string | undefined) ?? null,
      profilePictureUrl:
        (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
    },
  })

  return user
}
