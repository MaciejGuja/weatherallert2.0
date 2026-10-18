package com.example.weatherallert.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.weatherallert.utils.KeyProvider;
public class HashDataDto:extends KeyProvider{
    protected string login;
    protected string password;
    HashDataDto(string login,string password){
        this.login=login;
        this.password=password;
    }
    public HashLogin(login){

    }
    public HashPassword(password){
        
    }
}