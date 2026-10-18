package com.example.weatherallert.repository;

import com.example.weatherallert.entity.UserDataClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface UserDataRepository extends JpaRepository<UserDataClass,string>{

}