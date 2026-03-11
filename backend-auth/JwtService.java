package com.example;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final String secret;

    public JwtService(@Value("${jwt.secret:}") String propSecret) {
        this.secret = (propSecret != null && propSecret.length() >= 32)
            ? propSecret
            : System.getenv("JWT_SECRET");
        if (secret == null || secret.length() < 32)
            throw new IllegalStateException("Set jwt.secret in application.properties or JWT_SECRET env (min 32 chars)");
    }

    public String createToken(String userId, String email) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
            .setSubject(userId)
            .claim("email", email)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000)) // 7 days
            .signWith(key)
            .compact();
    }

    public String getUserId(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}
