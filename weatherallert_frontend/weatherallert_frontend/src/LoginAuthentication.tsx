export async function LoginAuthentication(login: String ,password: String){
    let flag: Boolean=false;
    const BASE_URL="http://localhost:8080/auth/login";
    const response=await fetch(BASE_URL,{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({login,password})
    });
    const info= await response.text();
    if(info==="Zalogowano"){
        flag=true;
    }else{
        flag=false;
    }
    return{ok: response.ok,status: response.status, info,flag};
}