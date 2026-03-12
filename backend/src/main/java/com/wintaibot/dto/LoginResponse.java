package com.wintaibot.dto;

public class LoginResponse {

    private String token;
    private String email;
    private String membershipType;
    private Long userId;
    private boolean emailVerified;

    public LoginResponse(String token, String email, String membershipType, Long userId, boolean emailVerified) {
        this.token = token;
        this.email = email;
        this.membershipType = membershipType;
        this.userId = userId;
        this.emailVerified = emailVerified;
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getMembershipType() { return membershipType; }
    public Long getUserId() { return userId; }
    public boolean isEmailVerified() { return emailVerified; }
}
