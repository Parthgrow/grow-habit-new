
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/firebase";

export async function POST(request : NextRequest) { 

    try{

        const {name, email, password} = await request.json() ; 

        if(!name || !email || !password){
            return NextResponse.json(
                {
                    error : 'Name, email and password are required'
                },
                {
                    status : 400
                }
            )
        }


        const userCredential = await createUserWithEmailAndPassword(auth, email, password ) ; 

        const user = userCredential.user ; 

        await updateProfile(user, {
            displayName : name
        })

        const token = await user.getIdToken();

        return NextResponse.json({
            success : true , 
            user : {
                uid : user.uid, 
                email : user.email, 
                displayName : user.displayName
            },
            token 
        })





    }
    catch(error : any){

        console.error('Signup error:', error);
    
        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-in-use') {
          return NextResponse.json(
            { error: 'Email already registered' },
            { status: 409 }
          );
        }
        
        if (error.code === 'auth/weak-password') {
          return NextResponse.json(
            { error: 'Password is too weak' },
            { status: 400 }
          );
        }
    
        return NextResponse.json(
          { error: 'Failed to create account' },
          { status: 500 }
        );

    }

}