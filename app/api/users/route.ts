import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';

export async function GET(request: NextRequest) {
  try {
    // Query all users from Firestore
    const usersSnapshot = await db.collection('users').get();

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 