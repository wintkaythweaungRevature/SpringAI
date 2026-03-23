package com.wintaibot.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", msg != null && !msg.isEmpty() ? msg : "Validation failed"));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleBadRequest(HttpMessageNotReadableException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Invalid request body. Expected JSON with email and password."));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException e) {
        String msg = e.getMessage();
        if (msg != null && (msg.contains("Invalid email or password") || msg.contains("Invalid or expired"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", msg));
        }
        if (msg != null && msg.contains("Account has been deactivated")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", msg));
        }
        if (msg != null && msg.contains("already registered")) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", msg));
        }
        // Publish/social errors: token expired, no Facebook pages, etc.
        ResponseEntity<?> publishErr = mapPublishError(msg);
        if (publishErr != null) return publishErr;
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", msg != null ? msg : "Internal server error"));
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<Map<String, String>> handleNotAcceptable(HttpMediaTypeNotAcceptableException e) {
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                .body(Map.of("error", "Send Accept: text/plain for /api/ai/ask-ai"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception e) {
        ResponseEntity<?> publishErr = mapPublishError(e.getMessage());
        if (publishErr != null) return publishErr;
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
    }

    /** Returns 400/401 for publish/social errors, null otherwise. */
    private ResponseEntity<?> mapPublishError(String msg) {
        if (msg == null) return null;
        String lower = msg.toLowerCase();
        boolean tokenError = (lower.contains("token") && lower.contains("expired"))
                || msg.contains("Invalid OAuth") || msg.contains("requiresConnect");
        boolean clientError = tokenError
                || lower.contains("no facebook pages")
                || lower.contains("no pages found")
                || lower.contains("page not found");
        if (tokenError) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", msg, "requiresConnect", true));
        }
        if (clientError) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", msg, "requiresConnect", true));
        }
        return null;
    }
}
