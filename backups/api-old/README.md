# Ondo Voting API

This file documents the endpoints that are currently implemented in the Node.js API.

Base URL:

```text
http://localhost:3000/api/v1
```

## Notes

- Only endpoints listed here are implemented.
- Other route files may contain planned endpoints that still return `501 Route scaffolded but not implemented yet`.
- All `/api/v1/admin/*` endpoints require a Bearer token unless stated otherwise.

## Health

### `GET /health`

Check whether the API is running.

Response:

```json
{
  "status": "ok",
  "service": "ondo-voting-api"
}
```

## Authentication

### `POST /api/v1/auth/admin/login`

Authenticate an admin user and return an admin access token.

Request body:

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

Response:

```json
{
  "message": "Admin login successful.",
  "accessToken": "jwt-token",
  "admin": {
    "id": "...",
    "firstName": "Daniel",
    "lastName": "Admin",
    "email": "admin@example.com",
    "phone": "08030000000",
    "role": "SUPER_ADMIN",
    "assignedLgas": [],
    "isActive": true,
    "twoFactorEnabled": false,
    "passwordChangeRequired": true,
    "lastLoginAt": "..."
  }
}
```

### `PATCH /api/v1/auth/admin/reset-password-with-temp`

Reset an admin password outside the logged-in flow.

Current implemented behavior:

- accepts `email`
- accepts `newPassword`
- updates the stored password if the admin exists and is active

Request body:

```json
{
  "email": "admin@example.com",
  "newPassword": "NewStrongPass123!"
}
```

Response:

```json
{
  "message": "Password reset successful. You can now log in with your new password.",
  "admin": {
    "id": "...",
    "firstName": "Daniel",
    "lastName": "Admin",
    "email": "admin@example.com",
    "phone": "08030000000",
    "role": "SUPER_ADMIN",
    "assignedLgas": [],
    "isActive": true,
    "twoFactorEnabled": false,
    "passwordChangeRequired": false,
    "lastLoginAt": "..."
  }
}
```

## Admin Self-Service

All routes below require:

```http
Authorization: Bearer <admin_access_token>
```

### `GET /api/v1/admin/me`

Return the currently authenticated admin based on the Bearer token.

Response:

```json
{
  "admin": {
    "id": "...",
    "firstName": "Daniel",
    "lastName": "Admin",
    "email": "admin@example.com",
    "phone": "08030000000",
    "role": "SUPER_ADMIN",
    "assignedLgas": [],
    "isActive": true,
    "twoFactorEnabled": false,
    "passwordChangeRequired": false,
    "lastLoginAt": "..."
  }
}
```

### `PATCH /api/v1/admin/me`

Update the logged-in admin's own profile fields.

Allowed fields:

- `firstName`
- `lastName`
- `email`
- `phone`
- `twoFactorEnabled`

Request body example:

```json
{
  "firstName": "Daniel",
  "lastName": "Akintola",
  "email": "daniel.updated@example.com",
  "phone": "08031111111",
  "twoFactorEnabled": true
}
```

### `PATCH /api/v1/admin/admin-users/:adminUserId/change-password`

Allow a logged-in admin to change their own password.

Rule:

- the `:adminUserId` must match the authenticated admin

Request body:

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewStrongPass123!"
}
```

Response:

```json
{
  "message": "Password updated successfully.",
  "admin": {
    "id": "...",
    "firstName": "Daniel",
    "lastName": "Admin",
    "email": "admin@example.com",
    "phone": "08030000000",
    "role": "SUPER_ADMIN",
    "assignedLgas": [],
    "isActive": true,
    "twoFactorEnabled": false,
    "passwordChangeRequired": false,
    "lastLoginAt": "..."
  }
}
```

## Admin User Management

All routes below require:

```http
Authorization: Bearer <admin_access_token>
```

### `GET /api/v1/admin/admin-users`

List admin users.

Access:

- `SUPER_ADMIN`
- `ELECTION_ADMIN`

Optional query params:

- `role`
- `isActive`
- `search`

Example:

```text
GET /api/v1/admin/admin-users?role=SUPER_ADMIN&isActive=true
```

Response:

```json
{
  "items": [],
  "total": 0
}
```

### `GET /api/v1/admin/admin-users/:adminUserId`

Get one admin by ID.

Access:

- `SUPER_ADMIN` can read any admin
- `ELECTION_ADMIN` can read any admin
- other admins can only read their own record

Response:

```json
{
  "admin": {
    "id": "...",
    "firstName": "Daniel",
    "lastName": "Admin",
    "email": "admin@example.com",
    "phone": "08030000000",
    "role": "SUPER_ADMIN",
    "assignedLgas": [],
    "isActive": true,
    "twoFactorEnabled": false,
    "passwordChangeRequired": false,
    "lastLoginAt": "..."
  }
}
```

### `POST /api/v1/admin/admin-users`

Create a new admin user.

Access:

- `SUPER_ADMIN` only

Request body:

```json
{
  "firstName": "Daniel",
  "lastName": "Admin",
  "email": "daniel.admin@example.com",
  "phone": "08030000000",
  "role": "SUPER_ADMIN",
  "assignedLgas": []
}
```

You can also provide:

- `temporaryPassword`

If you do not provide it, the API generates one.

Response:

```json
{
  "message": "Admin user created successfully.",
  "admin": {
    "id": "...",
    "firstName": "Daniel",
    "lastName": "Admin",
    "email": "daniel.admin@example.com",
    "phone": "08030000000",
    "role": "SUPER_ADMIN",
    "assignedLgas": [],
    "isActive": true,
    "twoFactorEnabled": false,
    "passwordChangeRequired": true,
    "lastLoginAt": null
  },
  "temporaryPassword": "generated-or-supplied-password"
}
```

### `PATCH /api/v1/admin/admin-users/:adminUserId`

Update an admin record.

Access rules:

- any admin can update their own basic fields
- only `SUPER_ADMIN` can update sensitive fields

Self-editable fields:

- `firstName`
- `lastName`
- `email`
- `phone`
- `twoFactorEnabled`

`SUPER_ADMIN`-only fields:

- `role`
- `assignedLgas`
- `passwordChangeRequired`

Request body example:

```json
{
  "firstName": "Daniel",
  "lastName": "Updated",
  "email": "daniel.updated@example.com",
  "phone": "08032222222",
  "twoFactorEnabled": true
}
```

### `PATCH /api/v1/admin/admin-users/:adminUserId/status`

Activate or deactivate an admin.

Access:

- `SUPER_ADMIN` only

Request body:

```json
{
  "isActive": false
}
```

### `POST /api/v1/admin/admin-users/:adminUserId/reset-password`

Reset another admin's password and issue a new temporary password.

Access:

- `SUPER_ADMIN` only

Response:

```json
{
  "message": "Admin password reset successfully.",
  "admin": {
    "id": "...",
    "firstName": "Daniel",
    "lastName": "Admin",
    "email": "admin@example.com",
    "phone": "08030000000",
    "role": "SUPER_ADMIN",
    "assignedLgas": [],
    "isActive": true,
    "twoFactorEnabled": false,
    "passwordChangeRequired": true,
    "lastLoginAt": "..."
  },
  "temporaryPassword": "new-temp-password"
}
```

## Known Gaps

The following routes exist in code but are still placeholders:

- `/api/v1/admin/dashboard`
- election management routes
- geography routes
- parties routes
- candidates routes
- voter management routes
- results routes
- audit log routes
- voter OTP auth routes

These currently return a not-implemented response.
