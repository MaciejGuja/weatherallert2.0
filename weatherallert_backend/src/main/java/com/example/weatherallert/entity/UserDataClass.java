package com.example.weatherallert.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
@Entity
@Table(name="user_data_table")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserDataClass{
    @Id
    @Table(name="login",nullable="false")
    private string login;
    @Table(name="password",nullable="false")
    private string password;
}