import { NextRequest, NextResponse } from "next/server";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";


export async function POST(request : NextRequest) { 

    try{

        await signOut(auth) ; 

        return NextResponse.json({
            success : true, 
            message : 'Signed out successfully'
        }); 

    }
    catch(error : any){
        console.error('Signout error:', error);
    
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );

    }

}