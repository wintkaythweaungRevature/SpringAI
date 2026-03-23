package com.wintaibot.dto;

import com.wintaibot.entity.User;

public class MeResponse {

    private Long id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private String membershipType;
    private String role;
    private boolean emailVerified;

    public MeResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.username = user.getUsername();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.membershipType = user.getMembershipType().name();
        this.role = user.getRole().name();
        this.emailVerified = user.isEmailVerified();
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getMembershipType() { return membershipType; }
    public String getRole() { return role; }
    public boolean isEmailVerified() { return emailVerified; }
}
