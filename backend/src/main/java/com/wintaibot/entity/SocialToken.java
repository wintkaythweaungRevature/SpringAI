package com.wintaibot.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "social_tokens",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "platform"}))
public class SocialToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String platform;

    @Column(name = "access_token", nullable = false, length = 1024)
    private String accessToken;

    @Column(name = "connected_at", nullable = false)
    private Instant connectedAt = Instant.now();

    public SocialToken() {}

    public SocialToken(Long userId, String platform, String accessToken) {
        this.userId = userId;
        this.platform = platform;
        this.accessToken = accessToken;
        this.connectedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public Instant getConnectedAt() { return connectedAt; }
    public void setConnectedAt(Instant connectedAt) { this.connectedAt = connectedAt; }
}
