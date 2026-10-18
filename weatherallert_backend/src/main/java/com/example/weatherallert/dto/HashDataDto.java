package com.example.weatherallert.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import com.example.weatherallert.utils.KeyProvider;
public class HashDataDto extends KeyProvider{
    private final KeyProvider keyProvider = KeyProvider.getInstance();
    protected String login;
    protected String password;
    public HashDataDto(String login,String password){
        this.login=login;
        this.password=password;
    }
    public String hashLogin(){
        String salt="shjhsxgjshbj";
        byte[] s = salt.getBytes(StandardCharsets.UTF_8);
        byte[] data = login.getBytes(StandardCharsets.UTF_8);
        for (int i = 0; i < data.length; i++) {
            data[i] ^= key[i % key.length];
            data[i] ^= s[i % s.length];
        }
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }
    public String hashPassword(){
        String salt="hsdtsajcdtaif";
        byte[] s = salt.getBytes(StandardCharsets.UTF_8);
        byte[] data = password.getBytes(StandardCharsets.UTF_8);
        for (int i = 0; i < data.length; i++) {
            data[i] ^= key[i % key.length];
            data[i] ^= s[i % s.length];
        }
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }
}