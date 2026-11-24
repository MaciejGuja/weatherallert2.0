package com.example.weatherallert.repository;

import com.example.weatherallert.entity.UserDataClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
@Repository
public interface UserDataRepository extends JpaRepository<UserDataClass,String>{

    @Modifying
    @Transactional
    @Query("UPDATE UserDataClass u SET u.password = :newPassword WHERE u.login = :hashLogin")
    int updatePasswordByLogin(@Param("hashLogin") String hashLogin,@Param("newPassword") String newPassword);
}