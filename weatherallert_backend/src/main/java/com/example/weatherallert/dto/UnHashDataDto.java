package com.example.weatherallert.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import com.example.weatherallert.utils.KeyProvider;
public class UnHashDataDto extends KeyProvider{
    protected String login;
    protected String password;
    public UnHashDataDto(String login,String password){
        this.login=login;
        this.password=password;
    }
    public String unHashLogin(){
        String salt="shjhsxgjshbj";
        byte[] s = salt.getBytes(StandardCharsets.UTF_8);
        byte[] data = Base64.getUrlDecoder().decode(login);
        for (int i = 0; i < data.length; i++) {
            data[i] ^= key[i % key.length];
            data[i] ^= s[i % s.length];
        }
        return new String(data, StandardCharsets.UTF_8);
    }
    public String unHashPassword(){
        String salt="hsdtsajcdtaif";
        byte[] s = salt.getBytes(StandardCharsets.UTF_8);
        byte[] data = Base64.getUrlDecoder().decode(password);
        for (int i = 0; i < data.length; i++) {
            data[i] ^= key[i % key.length];
            data[i] ^= s[i % s.length];
        }
        return new String(data, StandardCharsets.UTF_8);
    }
}