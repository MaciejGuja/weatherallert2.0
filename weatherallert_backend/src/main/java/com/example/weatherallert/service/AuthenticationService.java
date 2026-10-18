package com.example.weatherallert.service;
import com.example.weatherallert.dto.HashDataDto;
import com.example.weatherallert.dto.UnHashDataDto;
import com.example.weatherallert.repository.UserDataRepository;
import com.example.weatherallert.entity.UserDataClass;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
@Service
public class AuthenticationService{
    private final UserDataRepository repository;
    public AuthenticationService(UserDataRepository repository){
        this.repository=repository;
    }
    private boolean LoginAuthenticatian(String login){
        HashDataDto x=new HashDataDto(login,"");
        String hashLogin=x.hashLogin();
        return repository.existsById(hashLogin);
    }
    private boolean PasswordAuthentication(String login,String password){
        HashDataDto x=new HashDataDto(login,password);
        String hashLogin=x.hashLogin();
        String hashPassword=x.hashPassword();
        return repository.findById(hashLogin)
                .map(user->user.getPassword().equals(hashPassword))
                .orElse(false);
    }
    private boolean LoginExist(String hashLogin){
        boolean auth=repository.findAll().stream().anyMatch(lg->lg.getLogin().equals(hashLogin));
        return auth;
    }
    public boolean Registration(String login,String password){
        String hashLogin;
        String hashPassword;
        HashDataDto x=new HashDataDto(login,password);
        hashLogin=x.hashLogin();
        hashPassword=x.hashPassword();
        if(!LoginExist(hashLogin)){
            UserDataClass saveToRegister=new UserDataClass(hashLogin,hashPassword);
            repository.save(saveToRegister); 
            return true;
        }else{
            return false;
        }
    }
    public boolean Login(String login,String password){
        if(LoginAuthenticatian(login)&&PasswordAuthentication(login,password)){
            return true;
    }else{
        return false;
    }
    }
}