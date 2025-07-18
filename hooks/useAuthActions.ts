"use client" ; 
import { useState } from "react";


interface SignupData{
    name : string, 
    email : string, 
    password : string,
}
interface SigninData { 
    email : string, 
    password : string, 
}


export const useAuthActions = ()=> { 
    const [loading, setLoading] = useState(false) ; 
    const [error, setError] = useState<string | null>(null) ; 

    const signup = async(data : SignupData)=>{
        setLoading(true) ; 
        setError(null) ; 
        try{

            const response = await fetch('/api/auth/signup', {
                method : "POST",
                headers : {
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify(data)


            })

            const result = await response.json() ; 

            if(!response.ok){
                throw new Error(result.error || 'Signup failed') ; 
            }

            return result ; 

        }
        catch(error : any){
            setError(error.mesage) ; 
            throw error ; 

        }
        finally {
            setLoading(false) ; 
        }
    }

    const signin = async(data : SigninData)=>{

        try{

        const response = await fetch('/api/auth/signin', {
            method : "POST",
            headers : {
                'Content-Type' : 'application/json'
            }, 
            body : JSON.stringify(data)
        })

        const result = await response.json() ; 

        if(!result.ok)
        {
            throw new Error(result.error || 'Singin failed') ; 
        }

        return result ; 

    }
    catch(error : any){
        setError(error.message) ; 
        throw error ; 
    }
    finally { 
        setLoading(false) ; 
    }

    }; 

    const signout = async()=>{
        setLoading(true) ; 
        setError(null) ; 


        try{


        const response = await fetch('/api/auth/signout', {
            method : "POST",
        }); 

        const result = await response.json() ; 

        if(!result.ok){
            throw new Error(result.error || 'Signout failed') ; 
        }


        return result ; 

        }
        catch(error : any){
            setError(error.message) ; 
        }
        finally { 
            setLoading(false) ; 
        }

    }

    return { 
        signup, 
        signin, 
        signout, 
        loading,
        error 
    }
}