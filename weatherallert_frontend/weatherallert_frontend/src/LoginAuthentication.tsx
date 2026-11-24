export async function LoginAuthentication(login: String ,password: String, onlyCheck: boolean){
    let flag: Boolean=false;
    let info_k: string;
    const BASE_URL="http://localhost:8080/auth/login";
    const response=await fetch(BASE_URL,{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({login,password})
    });
    const info= await response.text();
    info_k=info;
    if(info==="Zalogowano"){
        flag=true;
        if(onlyCheck){

        }
    }else{
        flag=false;
        if(onlyCheck){
            info_k="Nie poprawne aktualne hasło";
        }
    }
    return{ok: response.ok,status: response.status, info_k,flag};
}