# Backend Fixes to Apply to Your Separate Backend

Apply these changes so your backend works with the W!ntAi frontend (www.wintaibot.com) and Instagram publish.

---

## 1. JwtService — Extract userId from Both Token Formats (REQUIRED)

**Problem:** The frontend sends JWTs with `sub=email` and `userId` as a claim. Your backend may expect `sub=userId`, causing `Long.parseLong("breezegirl6@gmail.com")` to throw → 401 Unauthorized.

**Fix:** Replace `getUserIdFromToken` in your `JwtService` (or equivalent):

```java
/**
 * Extracts userId from token. Supports both formats:
 * - sub=userId (native)
 * - sub=email + userId claim (e.g. from other issuers)
 */
public Long getUserIdFromToken(String token) {
    Claims claims = parseToken(token);
    Object userIdObj = claims.get("userId");
    if (userIdObj != null) {
        if (userIdObj instanceof Number) {
            return ((Number) userIdObj).longValue();
        }
        return Long.parseLong(String.valueOf(userIdObj));
    }
    return Long.parseLong(claims.getSubject());
}
```

**Before (remove this):**
```java
public Long getUserIdFromToken(String token) {
    return Long.parseLong(parseToken(token).getSubject());
}
```

---

## 2. JwtAuthFilter — Principal Must Be Long (REQUIRED)

Controllers expect `auth.getPrincipal() instanceof Long`. Ensure your filter sets `Long userId` as the principal:

```java
if (StringUtils.hasText(token) && jwtService.isValid(token)) {
    Long userId = jwtService.getUserIdFromToken(token);
    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
            userId, null, Collections.emptyList());
    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    SecurityContextHolder.getContext().setAuthentication(auth);
}
```

---

## 3. Environment / Config (facebook.app-secret)

Map env vars to Spring properties. The SocialController uses:
- `facebook.app-id` (from `FACEBOOK_APP_ID` or `facebook.app-id`)
- `facebook.app-secret` (from `FACEBOOK_APP_SECRET` or `facebook.app-secret`)
- `app.base-url` (e.g. `https://www.wintaibot.com`)
- `app.api-base-url` (e.g. `https://api.wintaibot.com`)

Ensure in `application.properties` or env:
```
facebook.app-id=${FACEBOOK_APP_ID:}
facebook.app-secret=${FACEBOOK_APP_SECRET:}
app.base-url=${APP_BASE_URL:http://localhost:3000}
app.api-base-url=${APP_API_BASE_URL:}
```

No quotes around secret values. `FACEBOOK_APP_SECRET` must exactly match Meta App Secret.

---

## 4. VideoContentController — Auth Check Pattern

Controllers use this auth check (must pass for authenticated requests):

```java
if (auth == null || !(auth.getPrincipal() instanceof Long)) {
    return ResponseEntity.status(401).build();
}
Long userId = (Long) auth.getPrincipal();
```

If you have real publish logic, use `userId` to look up the stored platform token (e.g. from SocialController TOKENS or DB).

---

## 5. SocialController — OAuth Callback for Facebook/Instagram

The callback must:
1. Exchange `code` for short-lived token at `https://graph.facebook.com/v21.0/oauth/access_token`
2. Exchange for long-lived token
3. Get Page token from `me/accounts?fields=id,name,access_token,instagram_business_account`
4. Store Page token for both `facebook` and `instagram` (same token works for both)

Ensure `client_secret` is passed correctly in the token exchange URL (no extra encoding, no quotes).

---

## 6. Shared In-Memory Token Storage (If Same Pattern)

If your SocialController uses:
```java
private static final Map<Long, Map<String, String>> TOKENS = new ConcurrentHashMap<>();
```

Then your publish endpoint must read the token:
```java
Map<String, String> userTokens = TOKENS.get(userId);
String igToken = userTokens != null ? userTokens.get("instagram") : null;
if (igToken == null || igToken.isBlank()) {
    return ResponseEntity.status(401)
        .body(Map.of("error", "Instagram token expired — go to Connected Accounts and reconnect", "requiresConnect", true));
}
// Use igToken to call Instagram Graph API
```

---

## Summary Checklist for Backend Team

| # | Item | Action |
|---|------|--------|
| 1 | JwtService.getUserIdFromToken | Use `userId` claim first, fallback to `sub` |
| 2 | JwtAuthFilter | Set `Long userId` as principal |
| 3 | JWT_SECRET | **Must match** the secret used by the service that issues tokens (e.g. login). If different, 401 on every request. |
| 4 | Env vars | FACEBOOK_APP_SECRET, APP_BASE_URL, APP_API_BASE_URL correct |
| 5 | Controllers | Use `auth.getPrincipal() instanceof Long` and cast to Long |
| 6 | Publish endpoint | Read token from TOKENS or DB for userId, return 401 + requiresConnect if missing |
