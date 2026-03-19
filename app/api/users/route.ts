// app/api/users/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const formData = await req.formData()

  const email = formData.get('email') as string

  const user = await prisma.user.create({
    data: {
      email,
      password: 'test123',
    },
  })

  return NextResponse.json(user)
}