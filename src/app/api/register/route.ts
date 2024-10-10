
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
// import { hash } from 'bcrypt';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { email, password, name, role } = await req.json();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });
  
    
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash the password
    // const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await db.user.create({
      data: {
        email: email,
        password: password,
        name: name,
        role: role,
      },
    });

    return NextResponse.json({ message: 'User created successfully', user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
