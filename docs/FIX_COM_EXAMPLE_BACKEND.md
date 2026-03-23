# How to Fix Your Backend (com.example)

If api.wintaibot.com runs a backend with package `com.example` (e.g. SpringAIDemo), apply these fixes.

---

## Fix 1: JwtService — Support `userId` Claim + Email-as-Subject (CRITICAL for 401 on publish)

**File:** `JwtService.java` or equivalent (likely `com.example.service.JwtService`)

**Important:** Do NOT use `return Long.parseLong(claims.getSubject())` when subject can be an email. That throws `NumberFormatException` for old tokens with `.subject(email)`.

**Replace** `getUserIdFromToken` with logic that:

1. Uses `userId` claim if present
2. Parses subject only when it looks numeric (`\d+`)
3. Otherwise treats subject as email and resolves user (e.g. `userRepository.findByEmailIgnoreCase(sub).map(User::getId).orElse(null)`)

```java
public Long getUserIdFromToken(String token) {
    Claims claims = parseToken(token);
    Object userIdObj = claims.get("userId");
    if (userIdObj != null) {
        if (userIdObj instanceof Number) {
            return ((Number) userIdObj).longValue();
        }
        return Long.parseLong(String.valueOf(userIdObj));
    }
    String sub = claims.getSubject();
    if (sub == null || sub.isBlank()) return null;
    if (sub.matches("\\d+")) {
        return Long.parseLong(sub);
    }
    return userRepository.findByEmailIgnoreCase(sub)
            .map(User::getId)
            .orElse(null);
}
```

**Why:** Tokens may have `sub=email` (legacy) or `sub=userId`. Unconditional `Long.parseLong(sub)` throws on email.

---

## Fix 2: JwtAuthFilter — Principal Must Be Long, Handle null

**File:** `JwtAuthFilter.java` (e.g. `com.example.service.JwtAuthFilter`)

Only set auth when `getUserIdFromToken` returns a non-null userId (e.g. for email-as-subject, user may not exist in DB):

```java
if (StringUtils.hasText(token) && jwtService.isValid(token)) {
    Long userId = jwtService.getUserIdFromToken(token);
    if (userId != null) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId, null, Collections.emptyList());
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
filterChain.doFilter(request, response);
```

---

## Fix 3: Admin Password Reset (for "Invalid email or password" when credentials are correct)

**Problem:** Password hash in DB doesn't match (different algorithm, migration, etc.).

### 3a. AuthService — add method

```java
public void adminResetPassword(String email, String newPassword) {
    String emailNorm = (email != null) ? email.trim().toLowerCase() : "";
    User user = userRepository.findByEmailIgnoreCase(emailNorm)
            .orElseThrow(() -> new RuntimeException("User not found"));
    if (newPassword == null || newPassword.length() < 6) {
        throw new RuntimeException("Password must be at least 6 characters");
    }
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    user.setDeactivated(false);
    userRepository.save(user);
}
```

### 3b. AuthController — add endpoint

```java
@Value("${admin.reset.secret:}")
private String adminResetSecret;

@PostMapping("/admin-reset-password")
public ResponseEntity<?> adminResetPassword(
        @RequestHeader(value = "X-Admin-Reset-Key", required = false) String key,
        @RequestBody Map<String, String> body) {
    if (adminResetSecret == null || adminResetSecret.isBlank()) {
        return ResponseEntity.status(403).body(Map.of("error", "Admin reset not configured"));
    }
    if (!adminResetSecret.equals(key)) {
        return ResponseEntity.status(403).body(Map.of("error", "Invalid key"));
    }
    String email = body != null ? body.get("email") : null;
    String newPassword = body != null ? body.get("newPassword") : null;
    if (email == null || email.isBlank()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
    }
    if (newPassword == null || newPassword.length() < 6) {
        return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
    }
    try {
        authService.adminResetPassword(email, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset. You can now log in."));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
```

### 3c. SecurityConfig — allow the endpoint

Add `/api/auth/admin-reset-password` to `permitAll()`.

### 3d. application.properties

```
admin.reset.secret=${ADMIN_RESET_SECRET:}
```

### 3e. Usage

1. Add to backend.env: `ADMIN_RESET_SECRET=your-secret-key`
2. Restart backend
3. Run:
   ```bash
   curl -X POST "https://api.wintaibot.com/api/auth/admin-reset-password" \
     -H "Content-Type: application/json" \
     -H "X-Admin-Reset-Key: your-secret-key" \
     -d '{"email":"breezegirl6@gmail.com","newPassword":"NewPassword123"}'
   ```
4. Log in with the new password

---

## Fix 4: Environment Variables (backend.env)

Ensure these are set correctly:

```
JWT_SECRET=<same-secret-used-when-issuing-tokens>
DB_URL=jdbc:postgresql://your-rds:5432/postgres?sslmode=require
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
ADMIN_RESET_SECRET=your-reset-key
```

- `JWT_SECRET` must match the secret used by the login/register flow. Mismatch → 401.
- `DB_*` must point to the database that contains your users.

---

## Fix 5: Publish Endpoint (Instagram 401)

If publish returns 401:

- **Option A:** Remove token check so stub publish returns 200 (for testing).
- **Option B:** Use `FACEBOOK_ACCESS_TOKEN` env var as fallback when user has no stored token.

---

## Checklist

| # | Fix | File | Purpose |
|---|-----|------|---------|
| 1 | getUserIdFromToken | JwtService | Fix 401 on publish (JWT format) |
| 2 | Principal = Long | JwtAuthFilter | Auth works with controllers |
| 3 | adminResetPassword | AuthService + AuthController | Fix "Invalid email or password" |
| 4 | permitAll + admin.reset.secret | SecurityConfig, application.properties | Enable admin reset |
| 5 | JWT_SECRET, DB_*, ADMIN_RESET_SECRET | backend.env | Correct config |

---

## Alternative: Use SpringAI Backend Instead

Instead of fixing the com.example backend, you can run the SpringAI backend from this repo:

```bash
docker rm -f spring-ai-backend
docker pull wintkaythweaugn/spring-ai-backend:latest
docker run -d --name spring-ai-backend -p 8080:8080 --restart always \
  -v /root/certs:/app/certs --env-file /root/backend.env \
  wintkaythweaugn/spring-ai-backend:latest
```

Ensure `wintkaythweaugn/spring-ai-backend` is built from this SpringAI repo (CI/CD pushes it on push to main).
