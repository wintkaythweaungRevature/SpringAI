package com.wintaibot.dto;

/**
 * AuthResponse shape for register: token, email, membershipType, userId, emailVerified, message.
 * When email verification is on: token=null, emailVerified=false.
 */
public record RegisterResult(String token, String email, String membershipType, Long userId,
                             boolean emailVerified, String message) {}
