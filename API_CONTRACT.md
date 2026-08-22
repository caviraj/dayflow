# Dayflow API Contract - Phase 1

This document defines the API contract for the frontend team. It acts as the single source of truth for request/response shapes, authentication requirements, and role-based access control (RBAC).

## Base URL
`/api`

## Authentication
Unless marked as **Public**, all endpoints require a valid JWT issued by NextAuth.

---

## 1. Authentication & Onboarding

### 1.1 Sign Up
- **Endpoint**: `POST /auth/signup`
- **Auth Requirement**: Public
- **Role Requirement**: None

**Request Body**:
```json
{
  "employeeId": "string (required, e.g. EMP-001)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)",
  "role": "EMPLOYEE | ADMIN (optional, defaults to EMPLOYEE)",
  "department": "string (required)"
}
```

**Success Response (201 Created)**:
```json
{
  "message": "User created successfully. Please verify your email."
}
```

**Error Responses**:
- `400 Bad Request`: Zod validation failure (e.g., weak password) or duplicate email/employee ID.
- `500 Internal Server Error`: Server failure.

---

### 1.2 Verify Email
- **Endpoint**: `POST /auth/verify`
- **Auth Requirement**: Public
- **Role Requirement**: None

**Request Body**:
```json
{
  "token": "string (required, parsed from email magic link)"
}
```

**Success Response (200 OK)**:
```json
{
  "message": "Email verified successfully"
}
```
*(Also returns 200 if already verified: `{"message": "Email already verified"}`)*

**Error Responses**:
- `400 Bad Request`: Missing token or invalid token.

---

### 1.3 Sign In (NextAuth Credentials)
- **Endpoint**: `POST /auth/callback/credentials` (Handled by NextAuth)
- **Auth Requirement**: Public
- **Role Requirement**: None

**Request Body** (Form URL Encoded or JSON handled by NextAuth `signIn` method in frontend):
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200 OK)**:
Sets HttpOnly cookie with JWT session. Returns NextAuth success JSON.

**Error Responses (401 Unauthorized)**:
- Returns URL parameters with `?error=CredentialsSignin`.
- Custom Errors: "Invalid credentials" or "Please verify your email before logging in".

---

## Shared Enums (Reference)

```typescript
enum Role {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN'
}

enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  LEAVE = 'LEAVE'
}

enum LeaveType {
  PAID = 'PAID',
  SICK = 'SICK',
  UNPAID = 'UNPAID'
}

enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
```
