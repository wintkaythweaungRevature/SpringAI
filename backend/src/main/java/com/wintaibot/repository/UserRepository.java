package com.wintaibot.repository;

import com.wintaibot.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByEmailVerificationToken(String token);

    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByPasswordResetToken(String token);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
