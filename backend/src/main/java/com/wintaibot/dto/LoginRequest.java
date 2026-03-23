package com.wintaibot.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Email or username is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;

    // Legacy support: allow "email" field from old clients
    public String getEmail() { return identifier; }
    public void setEmail(String email) { this.identifier = email; }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
