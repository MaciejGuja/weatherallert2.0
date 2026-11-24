export async function changePassword(login: string,password: string){
    let flag: Boolean=false;
    let info_k: string;
    const BASE_URL="http://localhost:8080/auth/changePassword";
    const response=await fetch(BASE_URL,{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({login,password})
    });
    const info= await response.text();
    info_k=info;
    return{ok: response.ok,status: response.status, info_k,flag};
}