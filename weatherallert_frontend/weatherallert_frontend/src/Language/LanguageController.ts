import pl from "./pl.json";
import en from "./en.json";
import de from "./de.json";
type languageProps={
    languageCode: "pl"|"en"|"de";
}
export async function LanguageController(language: languageProps): Promise<Map<string, string>>{
    let obj: Record<string,string>;
    if(language.languageCode==="pl"){
        obj=pl;
    }else if(language.languageCode==="en"){
        obj=en;
    }
    else{
        obj=de;
    }
    return new Map<string,string>(Object.entries(obj));
}