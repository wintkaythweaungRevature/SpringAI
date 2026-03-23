package com.wintaibot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url:https://wintaibot.com}")
    private String frontendUrl;

    @Value("${app.api-base-url:https://api.wintaibot.com}")
    private String apiBaseUrl;

    @Value("${mail.from:noreply@wintaibot.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        String verifyUrl = apiBaseUrl + "/api/auth/verify-email?token=" + token;
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(toEmail);
        msg.setSubject("Verify your email - Wintaibot");
        msg.setText(
            "Welcome to Wintaibot!\n\n" +
            "Please verify your email address by clicking the link below:\n\n" +
            verifyUrl + "\n\n" +
            "This link expires in 24 hours.\n\n" +
            "If you didn't create an account, you can ignore this email."
        );
        mailSender.send(msg);
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(toEmail);
        msg.setSubject("Reset your password - Wintaibot");
        msg.setText(
            "You requested a password reset for your Wintaibot account.\n\n" +
            "Click the link below to reset your password:\n\n" +
            resetUrl + "\n\n" +
            "This link expires in 1 hour.\n\n" +
            "If you didn't request this, you can safely ignore this email."
        );
        mailSender.send(msg);
    }

    public void sendUsernameReminderEmail(String toEmail, String username) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(toEmail);
        msg.setSubject("Your Wintaibot username");
        msg.setText(
            "You requested your Wintaibot username.\n\n" +
            "Your username is: " + username + "\n\n" +
            "You can log in at " + frontendUrl + " using your username or email address.\n\n" +
            "If you didn't request this, you can safely ignore this email."
        );
        mailSender.send(msg);
    }
}
