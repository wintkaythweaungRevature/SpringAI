# Backend Auth Setup for Member Subscription

Add these files to your Spring Boot project (`src/main/java/com/example/`).

## 1. Add Dependencies (pom.xml)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

## 2. Set JWT Secret

Add to `application.properties` or set env var:

```
JWT_SECRET=your-secret-key-at-least-32-characters-long
```

## 3. Add CORS to AuthController

The AuthController has `@CrossOrigin` for your domains. Ensure it matches your frontend URL.

## 4. API Endpoints

- `POST /api/auth/register` - Body: `{ "email", "password", "name" }`
- `POST /api/auth/login` - Body: `{ "email", "password" }`
- `GET /api/auth/me` - Header: `Authorization: Bearer <token>`

## 5. Production

Replace in-memory `USERS` map with a JPA `User` entity and database. Use `subscriptionActive` to gate AI access.
