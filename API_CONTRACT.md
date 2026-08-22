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

## 2. Dashboards

### 2.1 Employee Dashboard
- **Endpoint**: `GET /employee/dashboard`
- **Auth Requirement**: Yes
- **Role Requirement**: `EMPLOYEE` or `ADMIN`
- **Query Params**: `?userId=...` (Optional). If an `ADMIN` provides this, it fetches the specified employee's dashboard and creates an Audit Log entry.

**Success Response (200 OK)**:
```json
{
  "profileSummary": {
    "employeeId": "string",
    "department": "string",
    "email": "string",
    "role": "string",
    "pictureUrl": "string | null"
  },
  "leaveBalance": { /* LeaveBalance object */ },
  "recentAttendance": [ /* Array of 5 recent attendance records */ ],
  "recentLeaves": [ /* Array of 5 recent leave requests */ ],
  "recentAlerts": [ /* Array of 5 recent notifications */ ]
}
```

### 2.2 Admin Dashboard
- **Endpoint**: `GET /admin/dashboard`
- **Auth Requirement**: Yes
- **Role Requirement**: `ADMIN`

**Success Response (200 OK)**:
```json
{
  "metrics": {
    "totalEmployees": "number",
    "pendingLeaveRequests": "number",
    "attendanceSummary": {
      "PRESENT": "number",
      "ABSENT": "number"
    }
  },
  "leaveApprovalQueue": [ /* Array of 5 pending leave requests */ ]
}
```

---

## 3. Profiles

### 3.1 Get Profile
- **Endpoint**: `GET /profile/[userId]`
- **Auth Requirement**: Yes
- **Role Requirement**: `EMPLOYEE` (can only fetch self) or `ADMIN` (can fetch anyone, logged)

**Success Response (200 OK)**:
```json
{
  "id": "string",
  "employeeId": "string",
  "department": "string",
  "address": "string",
  "phone": "string",
  "pictureUrl": "string",
  "user": { "email": "string", "role": "string" },
  "payrolls": [],
  "documents": []
}
```

### 3.2 Update Profile
- **Endpoint**: `PATCH /profile/[userId]`
- **Auth Requirement**: Yes
- **Role Requirement**: `EMPLOYEE` (can only update self) or `ADMIN` (can update anyone, logged)

**Request Body (Employee)**:
```json
{
  "address": "string (optional)",
  "phone": "string (optional)",
  "pictureUrl": "string (url, optional)"
}
```

**Request Body (Admin)**:
```json
{
  "address": "string (optional)",
  "phone": "string (optional)",
  "pictureUrl": "string (url, optional)",
  "department": "string (optional)",
  "employeeId": "string (optional)"
}
```

**Success Response (200 OK)**:
Returns updated profile object.

---

## 4. Admin Operations

### 4.1 List Employees
- **Endpoint**: `GET /admin/employees`
- **Auth Requirement**: Yes
- **Role Requirement**: `ADMIN`
- **Query Params**: `?page=1&limit=50`

**Success Response (200 OK)**:
```json
{
  "data": [ /* Array of employee objects */ ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

---

## 5. Attendance

### 5.1 Check In
- **Endpoint**: `POST /attendance/check-in`
- **Auth Requirement**: Yes
- **Role Requirement**: `EMPLOYEE` or `ADMIN`

**Success Response (201 Created)**:
```json
{
  "id": "string",
  "employeeId": "string",
  "date": "2023-10-27T00:00:00.000Z",
  "checkIn": "2023-10-27T08:30:00.000Z",
  "checkOut": null,
  "status": "PRESENT"
}
```
*Note: Fails with 400 if already checked in today.*

### 5.2 Check Out
- **Endpoint**: `POST /attendance/check-out`
- **Auth Requirement**: Yes
- **Role Requirement**: `EMPLOYEE` or `ADMIN`

**Success Response (200 OK)**:
```json
{
  "id": "string",
  "checkOut": "2023-10-27T17:30:00.000Z",
  "status": "PRESENT | HALF_DAY"
}
```

### 5.3 Query Attendance
- **Endpoint**: `GET /attendance`
- **Auth Requirement**: Yes
- **Role Requirement**: `EMPLOYEE` (can only see own records) or `ADMIN` (can see all records or filter)
- **Query Params**: 
  - `startDate`: YYYY-MM-DD (optional)
  - `endDate`: YYYY-MM-DD (optional)
  - `userId`: string (optional, ADMIN only)
  - `page`: number (default: 1)
  - `limit`: number (default: 50)

**Success Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "string",
      "date": "string (ISO)",
      "checkIn": "string (ISO) | null",
      "checkOut": "string (ISO) | null",
      "status": "PRESENT | ABSENT | HALF_DAY | LEAVE",
      "employee": { "employeeId": "string", "department": "string" } // Only present if Admin fetches all
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

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
