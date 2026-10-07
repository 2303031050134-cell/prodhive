package com.prodhive_auth.repository;
import com.prodhive_auth.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> { Optional<VerificationToken> findByToken(String token); }
