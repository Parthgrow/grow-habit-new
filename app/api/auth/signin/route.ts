import { signInWithEmailAndPassword } from "firebase/auth";
import {NextRequest, NextResponse} from "next/server" ; 
import { auth } from "@/firebase";


export async function POST(request : NextRequest){

    try{

        const {email, password} = await request.json() ; 

        if(!email || !password){
            return NextResponse.json(
                {error : "Both email and password is required"},
                {status : 400}
            ) ; 
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password) ; 

        const user = userCredential.user ; 

        const token = await user.getIdToken() ; 

        return NextResponse.json({
            success : true, 
            user : {
                uid : user.uid, 
                email : user.email, 
                displayname : user.displayName
            }, 
            token 
        })
    }
    catch(error : any){

        console.error('Signin error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );

    }

}