package com.prodhive_auth.repository;
import com.prodhive_auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> { Optional<PasswordResetToken> findByToken(String token); }
