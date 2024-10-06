
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { z } from 'zod';

export async function POST(req: Request) {
  const { email, password, name, role } = await req.json();
  let emailAttr = email;
  let passwordAttr = password;
  let nameAttr = name;
  let roleAttr = role;
  let userCreated = null;
  let memberUser = null;
  let accountUser = null;
  try {
    userCreated = await db.user.create({
      data: {
        email: emailAttr, 
        password: passwordAttr,
        role: roleAttr,
        name: nameAttr,
      }
    });
    if (!userCreated) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'User creation failed' + error }, { status: 500 });
  }
  return NextResponse.json({ message: 'User created successfully' }, { status: 200 });
}
