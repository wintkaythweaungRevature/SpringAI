package com.wintaibot.exception;

/** Client error (HTTP 400) for checkout / subscription validation. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
