package com.example.weatherallert.utils;
import java.nio.charset.StandardCharsets;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.*;
import java.security.SecureRandom;
import java.util.Base64;
public class KeyProvider{
    private static final Path KEY_FILE = Paths.get("app-secret.key");
    private static final KeyProvider INSTANCE = new KeyProvider();
    protected final byte[] key;
    public KeyProvider(){
        this.key=getOrGenerateAuthKey();
    }
    public static KeyProvider getInstance(){
        return INSTANCE;
    }
    private static byte[] getOrGenerateAuthKey(){
        try{
            if(Files.exists(KEY_FILE)){
                return Base64.getDecoder().decode(Files.readString(KEY_FILE).trim());
            }else{
                byte[] n= new byte[32];
                new SecureRandom().nextBytes(n);
                Files.writeString(KEY_FILE, Base64.getEncoder().encodeToString(n));
                return n;
            }
        }catch(IOException e){
            throw new UncheckedIOException("Nie można odczytać/zapisać klucza", e);
        }
    }
}