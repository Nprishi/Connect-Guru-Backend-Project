# API Documentation

## 1. Base URL

- Global prefix: `/api/cg`
- Public super admin login: `/api/cg/superadmin/login`
- Super admin platform prefix: `/api/cg/superadmin`
- Admin platform prefix: `/api/cg/admin`
- Health check: `GET /`
- Protected endpoints require `Authorization: Bearer <token>`
- Upload endpoints use `multipart/form-data` with the field `file`
- Admin and super admin responses follow the envelope shape: `{ success: true, message: '...', data: ... }`

---

## 2. Authentication and Account

| Method | Path                               | Auth | Role                   | Summary                           |
| ------ | ---------------------------------- | ---: | ---------------------- | --------------------------------- |
| POST   | `/api/cg/auth/register`            |   No | Public                 | Register a new student or teacher |
| POST   | `/api/cg/auth/login`               |   No | Public                 | Login and get JWT                 |
| POST   | `/api/cg/auth/refresh-token`       |   No | Public                 | Refresh access token              |
| POST   | `/api/cg/auth/logout`              |  Yes | Any authenticated user | Logout current session            |
| GET    | `/api/cg/auth/profile`             |  Yes | Any authenticated user | Get authenticated user profile    |
| POST   | `/api/cg/auth/forgot-password`     |   No | Public                 | Request password reset            |
| POST   | `/api/cg/auth/reset-password`      |   No | Public                 | Reset password with token         |
| PATCH  | `/api/cg/auth/change-password`     |  Yes | Any authenticated user | Change password                   |
| POST   | `/api/cg/auth/verify-email`        |  Yes | Any authenticated user | Verify email                      |
| POST   | `/api/cg/auth/resend-verification` |  Yes | Any authenticated user | Resend verification email         |

### Example: Register

Request:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "password": "Str0ngP@ssword!",
  "role": "student",
  "phone": "+9779812345678",
  "gender": "female"
}
```

Response:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "64...",
    "email": "jane.doe@example.com",
    "role": "student"
  }
}
```

### Example: Login

Request:

```json
{
  "email": "jane.doe@example.com",
  "password": "Str0ngP@ssword!"
}
```

Response:

```json
{
  "accessToken": "<jwt-access-token>",
  "refreshToken": "<jwt-refresh-token>",
  "user": {
    "id": "64...",
    "email": "jane.doe@example.com",
    "role": "student"
  }
}
```

---

## 3. Super Admin

| Method | Path                                            | Auth | Role        | Summary                                    |
| ------ | ----------------------------------------------- | ---: | ----------- | ------------------------------------------ |
| POST   | `/api/cg/superadmin/login`                      |   No | Public      | Super admin login                          |
| GET    | `/api/cg/superadmin/dashboard`                  |  Yes | SUPER_ADMIN | Get super admin dashboard summary          |
| GET    | `/api/cg/superadmin/admins`                     |  Yes | SUPER_ADMIN | List paginated admin accounts              |
| POST   | `/api/cg/superadmin/admins`                     |  Yes | SUPER_ADMIN | Create a new admin account                 |
| GET    | `/api/cg/superadmin/admins/:adminId`            |  Yes | SUPER_ADMIN | Get admin detail by id                     |
| PATCH  | `/api/cg/superadmin/admins/:adminId`            |  Yes | SUPER_ADMIN | Update admin profile                       |
| DELETE | `/api/cg/superadmin/admins/:adminId`            |  Yes | SUPER_ADMIN | Soft delete admin account                  |
| GET    | `/api/cg/superadmin/analytics`                  |  Yes | SUPER_ADMIN | Get platform analytics                     |
| GET    | `/api/cg/superadmin/system-settings`            |  Yes | SUPER_ADMIN | Get system settings                        |
| PATCH  | `/api/cg/superadmin/system-settings`            |  Yes | SUPER_ADMIN | Update system settings                     |
| GET    | `/api/cg/superadmin/audit-logs`                 |  Yes | SUPER_ADMIN | Get audit logs with pagination and filters |
| POST   | `/api/cg/superadmin/database/backup`            |  Yes | SUPER_ADMIN | Create a MongoDB backup                    |
| GET    | `/api/cg/superadmin/database/backups`           |  Yes | SUPER_ADMIN | List database backups                      |
| POST   | `/api/cg/superadmin/database/restore/:backupId` |  Yes | SUPER_ADMIN | Restore a MongoDB backup                   |
| POST   | `/api/cg/superadmin/announcements`              |  Yes | SUPER_ADMIN | Broadcast a platform announcement          |

### Example: Super admin login

Request:

```json
{
  "email": "example@gmail.com",
  "password": "Example@123",
  "secretKey": "secrete@123"
}
```

Response:

```json
{
  "success": true,
  "message": "Super admin login successful.",
  "data": {
    "accessToken": "<super-admin-token>"
  }
}
```

### Example: Super admin dashboard

Request:

```http
GET /api/cg/superadmin/dashboard
Authorization: Bearer <super-admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Dashboard fetched successfully.",
  "data": {
    "overview": {
      "totalAdmins": 10,
      "totalTeachers": 120,
      "totalStudents": 450,
      "totalBookings": 75,
      "totalRevenue": 12500
    }
  }
}
```

---

## 4. Admin

| Method | Path                                         | Auth | Role  | Summary                                            |
| ------ | -------------------------------------------- | ---: | ----- | -------------------------------------------------- |
| GET    | `/api/cg/admin/dashboard`                    |  Yes | ADMIN | Admin dashboard overview                           |
| GET    | `/api/cg/admin/users`                        |  Yes | ADMIN | List users with pagination, search, and filters    |
| GET    | `/api/cg/admin/users/:userId`                |  Yes | ADMIN | Get a user profile                                 |
| DELETE | `/api/cg/admin/users/:userId`                |  Yes | ADMIN | Soft delete a user                                 |
| PATCH  | `/api/cg/admin/users/:userId/status`         |  Yes | ADMIN | Update a user status                               |
| GET    | `/api/cg/admin/teachers`                     |  Yes | ADMIN | List teachers with pagination and verification     |
| GET    | `/api/cg/admin/teachers/:teacherId`          |  Yes | ADMIN | Get a teacher profile                              |
| PATCH  | `/api/cg/admin/teachers/:teacherId/status`   |  Yes | ADMIN | Update a teacher account status                    |
| PATCH  | `/api/cg/admin/teachers/:teacherId/verify`   |  Yes | ADMIN | Approve teacher verification                       |
| PATCH  | `/api/cg/admin/teachers/:teacherId/unverify` |  Yes | ADMIN | Remove teacher verification                        |
| GET    | `/api/cg/admin/students`                     |  Yes | ADMIN | List students with pagination and search           |
| GET    | `/api/cg/admin/students/:studentId`          |  Yes | ADMIN | Get a student profile                              |
| PATCH  | `/api/cg/admin/students/:studentId/status`   |  Yes | ADMIN | Update a student account status                    |
| GET    | `/api/cg/admin/bookings`                     |  Yes | ADMIN | List bookings with pagination, search, and filter  |
| GET    | `/api/cg/admin/bookings/:bookingId`          |  Yes | ADMIN | Get booking details                                |
| PATCH  | `/api/cg/admin/bookings/:bookingId/status`   |  Yes | ADMIN | Update booking status                              |
| GET    | `/api/cg/admin/sessions`                     |  Yes | ADMIN | List sessions with pagination, status, and filters |
| GET    | `/api/cg/admin/sessions/:sessionId`          |  Yes | ADMIN | Get session details                                |
| PATCH  | `/api/cg/admin/sessions/:sessionId/cancel`   |  Yes | ADMIN | Cancel a session                                   |
| GET    | `/api/cg/admin/payments`                     |  Yes | ADMIN | List payments with pagination and status           |
| GET    | `/api/cg/admin/payments/:paymentId`          |  Yes | ADMIN | Get payment details                                |
| PATCH  | `/api/cg/admin/payments/:paymentId/refund`   |  Yes | ADMIN | Refund a payment                                   |
| GET    | `/api/cg/admin/kyc`                          |  Yes | ADMIN | List KYC submissions                               |
| GET    | `/api/cg/admin/categories`                   |  Yes | ADMIN | List categories                                    |
| GET    | `/api/cg/admin/subjects`                     |  Yes | ADMIN | List subjects                                      |
| GET    | `/api/cg/admin/packages`                     |  Yes | ADMIN | List packages                                      |
| GET    | `/api/cg/admin/packages/:packageId`          |  Yes | ADMIN | Get package details                                |
| PATCH  | `/api/cg/admin/packages/:packageId/status`   |  Yes | ADMIN | Update package active status                       |
| GET    | `/api/cg/admin/reviews`                      |  Yes | ADMIN | List reviews with pagination and search            |
| DELETE | `/api/cg/admin/reviews/:reviewId`            |  Yes | ADMIN | Delete abusive review                              |
| POST   | `/api/cg/admin/notifications`                |  Yes | ADMIN | Broadcast an admin notification                    |
| GET    | `/api/cg/admin/notifications`                |  Yes | ADMIN | List notifications                                 |
| GET    | `/api/cg/admin/analytics`                    |  Yes | ADMIN | Admin analytics overview                           |
| GET    | `/api/cg/admin/reports/revenue`              |  Yes | ADMIN | Revenue report export or data                      |
| GET    | `/api/cg/admin/reports/users`                |  Yes | ADMIN | Users report export or data                        |
| GET    | `/api/cg/admin/reports/bookings`             |  Yes | ADMIN | Bookings report export or data                     |
| GET    | `/api/cg/admin/reports/payments`             |  Yes | ADMIN | Payments report export or data                     |
| GET    | `/api/cg/admin/reports/teachers`             |  Yes | ADMIN | Teachers report export or data                     |
| GET    | `/api/cg/admin/reports/students`             |  Yes | ADMIN | Students report export or data                     |

### Admin endpoint examples

#### GET /api/cg/admin/dashboard

Request:

```http
GET /api/cg/admin/dashboard
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Admin dashboard summary fetched successfully.",
  "data": {
    "users": {
      "totalUsers": 120,
      "activeUsers": 98,
      "inactiveUsers": 12,
      "suspendedUsers": 5,
      "bannedUsers": 2
    },
    "teachers": {
      "totalTeachers": 30,
      "verifiedTeachers": 22,
      "pendingTeachers": 8
    },
    "students": {
      "totalStudents": 90,
      "activeStudents": 82
    }
  }
}
```

#### GET /api/cg/admin/users

Request:

```http
GET /api/cg/admin/users?page=1&limit=10&role=student&status=active&search=ram&sort=createdAt:desc
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Users fetched successfully.",
  "data": [
    {
      "_id": "64abc123def4567890abcd12",
      "firstName": "Ram",
      "lastName": "Sharma",
      "email": "ram.sharma@example.com",
      "role": "student",
      "status": "active",
      "phone": "+9779812345678"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### GET /api/cg/admin/users/:userId

Request:

```http
GET /api/cg/admin/users/64abc123def4567890abcd12
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "User fetched successfully.",
  "data": {
    "_id": "64abc123def4567890abcd12",
    "firstName": "Ram",
    "lastName": "Sharma",
    "email": "ram.sharma@example.com",
    "role": "student",
    "status": "active",
    "phone": "+9779812345678"
  }
}
```

#### DELETE /api/cg/admin/users/:userId

Request:

```http
DELETE /api/cg/admin/users/64abc123def4567890abcd12
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "User soft deleted successfully.",
  "data": {
    "_id": "64abc123def4567890abcd12",
    "isDeleted": true,
    "deletedAt": "2026-07-22T10:00:00.000Z"
  }
}
```

#### PATCH /api/cg/admin/users/:userId/status

Request:

```json
{
  "status": "suspended"
}
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "User status updated successfully.",
  "data": {
    "_id": "64abc123def4567890abcd12",
    "status": "suspended"
  }
}
```

#### GET /api/cg/admin/teachers

Request:

```http
GET /api/cg/admin/teachers?page=1&limit=10&verificationStatus=verified&search=neha
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Teachers fetched successfully.",
  "data": [
    {
      "user": {
        "_id": "64abc123def4567890abcd34",
        "firstName": "Neha",
        "lastName": "Bhatt",
        "email": "neha.bhatt@example.com",
        "role": "teacher",
        "status": "active"
      },
      "profile": {
        "userId": "64abc123def4567890abcd34",
        "isVerified": true,
        "subjects": ["Math", "Physics"]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 30,
    "pages": 3
  }
}
```

#### GET /api/cg/admin/teachers/:teacherId

Request:

```http
GET /api/cg/admin/teachers/64abc123def4567890abcd34
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Teacher fetched successfully.",
  "data": {
    "user": {
      "_id": "64abc123def4567890abcd34",
      "firstName": "Neha",
      "lastName": "Bhatt",
      "email": "neha.bhatt@example.com"
    },
    "profile": {
      "userId": "64abc123def4567890abcd34",
      "isVerified": true,
      "subjects": ["Math", "Physics"]
    }
  }
}
```

#### PATCH /api/cg/admin/teachers/:teacherId/status

Request:

```json
{
  "status": "active"
}
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Teacher status updated successfully.",
  "data": {
    "_id": "64abc123def4567890abcd34",
    "status": "active"
  }
}
```

#### PATCH /api/cg/admin/teachers/:teacherId/verify

Request:

```http
PATCH /api/cg/admin/teachers/64abc123def4567890abcd34/verify
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Teacher verified successfully.",
  "data": {
    "userId": "64abc123def4567890abcd34",
    "isVerified": true
  }
}
```

#### PATCH /api/cg/admin/teachers/:teacherId/unverify

Request:

```http
PATCH /api/cg/admin/teachers/64abc123def4567890abcd34/unverify
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Teacher unverified successfully.",
  "data": {
    "userId": "64abc123def4567890abcd34",
    "isVerified": false
  }
}
```

#### GET /api/cg/admin/students

Request:

```http
GET /api/cg/admin/students?page=1&limit=10&status=active&search=arya
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Students fetched successfully.",
  "data": [
    {
      "_id": "64abc123def4567890abcd56",
      "firstName": "Arya",
      "lastName": "Khan",
      "email": "arya.khan@example.com",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 40,
    "pages": 4
  }
}
```

#### GET /api/cg/admin/students/:studentId

Request:

```http
GET /api/cg/admin/students/64abc123def4567890abcd56
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Student fetched successfully.",
  "data": {
    "_id": "64abc123def4567890abcd56",
    "firstName": "Arya",
    "lastName": "Khan",
    "email": "arya.khan@example.com",
    "status": "active"
  }
}
```

#### PATCH /api/cg/admin/students/:studentId/status

Request:

```json
{
  "status": "inactive"
}
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Student status updated successfully.",
  "data": {
    "_id": "64abc123def4567890abcd56",
    "status": "inactive"
  }
}
```

#### GET /api/cg/admin/bookings

Request:

```http
GET /api/cg/admin/bookings?page=1&limit=10&status=accepted&teacherId=64abc123def4567890abcd78&search=math
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Bookings fetched successfully.",
  "data": [
    {
      "_id": "64abc123def4567890abcd90",
      "teacherId": "64abc123def4567890abcd78",
      "studentId": "64abc123def4567890abcd56",
      "subject": "Math",
      "status": "accepted"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET /api/cg/admin/bookings/:bookingId

Request:

```http
GET /api/cg/admin/bookings/64abc123def4567890abcd90
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Booking fetched successfully.",
  "data": {
    "_id": "64abc123def4567890abcd90",
    "teacherId": "64abc123def4567890abcd78",
    "studentId": "64abc123def4567890abcd56",
    "subject": "Math",
    "status": "accepted"
  }
}
```

#### PATCH /api/cg/admin/bookings/:bookingId/status

Request:

```json
{
  "status": "accepted"
}
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Booking status updated successfully.",
  "data": {
    "_id": "64abc123def4567890abcd90",
    "status": "accepted"
  }
}
```

#### GET /api/cg/admin/sessions

Request:

```http
GET /api/cg/admin/sessions?page=1&limit=10&status=cancelled&teacherId=64abc123def4567890abcd11
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Sessions fetched successfully.",
  "data": [
    {
      "_id": "64abc123def4567890abcd22",
      "teacherId": "64abc123def4567890abcd11",
      "studentId": "64abc123def4567890abcd56",
      "status": "cancelled"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "pages": 2
  }
}
```

#### GET /api/cg/admin/sessions/:sessionId

Request:

```http
GET /api/cg/admin/sessions/64abc123def4567890abcd22
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Session fetched successfully.",
  "data": {
    "_id": "64abc123def4567890abcd22",
    "status": "cancelled",
    "teacherId": "64abc123def4567890abcd11",
    "studentId": "64abc123def4567890abcd56"
  }
}
```

#### PATCH /api/cg/admin/sessions/:sessionId/cancel

Request:

```http
PATCH /api/cg/admin/sessions/64abc123def4567890abcd22/cancel
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Session cancelled successfully.",
  "data": {
    "_id": "64abc123def4567890abcd22",
    "status": "cancelled"
  }
}
```

#### GET /api/cg/admin/payments

Request:

```http
GET /api/cg/admin/payments?page=1&limit=10&status=completed&studentId=64abc123def4567890abcd33
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Payments fetched successfully.",
  "data": [
    {
      "_id": "64abc123def4567890abcd44",
      "studentId": "64abc123def4567890abcd33",
      "teacherId": "64abc123def4567890abcd78",
      "amount": 120,
      "status": "completed"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 18,
    "pages": 2
  }
}
```

#### GET /api/cg/admin/payments/:paymentId

Request:

```http
GET /api/cg/admin/payments/64abc123def4567890abcd44
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Payment fetched successfully.",
  "data": {
    "_id": "64abc123def4567890abcd44",
    "amount": 120,
    "status": "completed",
    "transactionId": "txn_12345"
  }
}
```

#### PATCH /api/cg/admin/payments/:paymentId/refund

Request:

```http
PATCH /api/cg/admin/payments/64abc123def4567890abcd44/refund
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Payment refunded successfully.",
  "data": {
    "_id": "64abc123def4567890abcd44",
    "status": "refunded"
  }
}
```

#### GET /api/cg/admin/kyc

Request:

```http
GET /api/cg/admin/kyc?page=1&limit=10&status=pending
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "KYC submissions fetched successfully.",
  "data": [
    {
      "_id": "64abc123def4567890abcd77",
      "userId": "64abc123def4567890abcd56",
      "status": "pending"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

#### GET /api/cg/admin/categories

Request:

```http
GET /api/cg/admin/categories?page=1&limit=10
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Categories fetched successfully.",
  "data": [
    {
      "_id": "64abc123def4567890abcd88",
      "name": "Science"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

#### GET /api/cg/admin/subjects

Request:

```http
GET /api/cg/admin/subjects?page=1&limit=10
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Subjects fetched successfully.",
  "data": [
    {
      "_id": "64abc123def4567890abcd99",
      "name": "Mathematics"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "pages": 2
  }
}
```

#### GET /api/cg/admin/packages

Request:

```http
GET /api/cg/admin/packages?page=1&limit=10&isActive=true&search=tutor
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Packages fetched successfully.",
  "data": [
    {
      "_id": "64abc123def4567890abcd55",
      "name": "Starter Pack",
      "price": 120,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 14,
    "pages": 2
  }
}
```

#### GET /api/cg/admin/packages/:packageId

Request:

```http
GET /api/cg/admin/packages/64abc123def4567890abcd55
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Package fetched successfully.",
  "data": {
    "_id": "64abc123def4567890abcd55",
    "name": "Starter Pack",
    "price": 120,
    "isActive": true
  }
}
```

#### PATCH /api/cg/admin/packages/:packageId/status

Request:

```json
{
  "status": "active"
}
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Package status updated successfully.",
  "data": {
    "_id": "64abc123def4567890abcd55",
    "isActive": true
  }
}
```

#### GET /api/cg/admin/reviews

Request:

```http
GET /api/cg/admin/reviews?page=1&limit=10&rating=5&search=excellent
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Reviews fetched successfully.",
  "data": [
    {
      "_id": "64abc123def4567890abcd66",
      "teacherId": "64abc123def4567890abcd34",
      "studentId": "64abc123def4567890abcd56",
      "rating": 5,
      "comment": "Excellent and patient"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "pages": 1
  }
}
```

#### DELETE /api/cg/admin/reviews/:reviewId

Request:

```http
DELETE /api/cg/admin/reviews/64abc123def4567890abcd66
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Review deleted successfully.",
  "data": {
    "reviewId": "64abc123def4567890abcd66"
  }
}
```

#### POST /api/cg/admin/notifications

Request:

```json
{
  "audience": "teachers",
  "title": "System maintenance",
  "message": "The platform will be unavailable for 30 minutes.",
  "link": "https://example.com/maintenance"
}
```

Headers:

```http
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Notification sent successfully.",
  "data": {
    "audience": "teachers",
    "count": 24
  }
}
```

#### GET /api/cg/admin/notifications

Request:

```http
GET /api/cg/admin/notifications?page=1&limit=10
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Notifications fetched successfully.",
  "data": [
    {
      "_id": "64abc123def4567890abcd77",
      "title": "System maintenance",
      "message": "The platform will be unavailable for 30 minutes.",
      "audience": "teachers"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

#### GET /api/cg/admin/analytics

Request:

```http
GET /api/cg/admin/analytics
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "success": true,
  "message": "Admin analytics fetched successfully.",
  "data": {
    "summary": {
      "usersByRole": [
        { "_id": "student", "count": 90 },
        { "_id": "teacher", "count": 30 }
      ],
      "totalBookings": 180,
      "totalPayments": 160,
      "totalSessions": 140,
      "completedSessions": 120,
      "totalRevenue": 24000
    },
    "charts": {
      "bookings": [
        { "label": "Feb", "value": 20 },
        { "label": "Mar", "value": 25 }
      ]
    }
  }
}
```

#### GET /api/cg/admin/reports/revenue

Request:

```http
GET /api/cg/admin/reports/revenue?export=csv&startDate=2026-01-01&endDate=2026-06-30
Authorization: Bearer <admin-token>
```

Response:

```http
Content-Type: text/csv
Content-Disposition: attachment; filename="revenue-report.csv"
```

#### GET /api/cg/admin/reports/users

Request:

```http
GET /api/cg/admin/reports/users?export=pdf&startDate=2026-01-01&endDate=2026-06-30
Authorization: Bearer <admin-token>
```

Response:

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="users-report.pdf"
```

#### GET /api/cg/admin/reports/bookings

Request:

```http
GET /api/cg/admin/reports/bookings?export=csv&startDate=2026-01-01&endDate=2026-06-30
Authorization: Bearer <admin-token>
```

Response:

```http
Content-Type: text/csv
Content-Disposition: attachment; filename="bookings-report.csv"
```

#### GET /api/cg/admin/reports/payments

Request:

```http
GET /api/cg/admin/reports/payments?export=csv&startDate=2026-01-01&endDate=2026-06-30
Authorization: Bearer <admin-token>
```

Response:

```http
Content-Type: text/csv
Content-Disposition: attachment; filename="payments-report.csv"
```

#### GET /api/cg/admin/reports/teachers

Request:

```http
GET /api/cg/admin/reports/teachers?export=pdf&startDate=2026-01-01&endDate=2026-06-30
Authorization: Bearer <admin-token>
```

Response:

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="teachers-report.pdf"
```

#### GET /api/cg/admin/reports/students

Request:

```http
GET /api/cg/admin/reports/students?export=pdf&startDate=2026-01-01&endDate=2026-06-30
Authorization: Bearer <admin-token>
```

Response:

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="students-report.pdf"
```

---

## 5. Users

| Method | Path                     | Auth | Role                   | Summary                     |
| ------ | ------------------------ | ---: | ---------------------- | --------------------------- |
| GET    | `/api/cg/users/profile`  |  Yes | Any authenticated user | Get current user profile    |
| PATCH  | `/api/cg/users/profile`  |  Yes | Any authenticated user | Update current user profile |
| DELETE | `/api/cg/users/account`  |  Yes | Any authenticated user | Delete account              |
| GET    | `/api/cg/users/settings` |  Yes | Any authenticated user | Get user settings           |
| PATCH  | `/api/cg/users/settings` |  Yes | Any authenticated user | Update user settings        |
| POST   | `/api/cg/users/avatar`   |  Yes | Any authenticated user | Upload avatar               |

### Example: Upload avatar

Request:

```http
POST /api/cg/users/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

Form field:

- `file`: image file

Response:

```json
{
  "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg"
}
```

---

## 6. Teachers

| Method | Path                               | Auth | Role          | Summary                          |
| ------ | ---------------------------------- | ---: | ------------- | -------------------------------- |
| GET    | `/api/cg/teachers`                 |   No | Public        | List teachers                    |
| POST   | `/api/cg/teachers/profile`         |  Yes | Authenticated | Create or update teacher profile |
| PATCH  | `/api/cg/teachers/profile`         |  Yes | Authenticated | Patch teacher profile            |
| PATCH  | `/api/cg/teachers/availability`    |  Yes | Authenticated | Update availability              |
| GET    | `/api/cg/teachers/me`              |  Yes | Authenticated | Get current teacher profile      |
| GET    | `/api/cg/teachers/dashboard`       |  Yes | Authenticated | Get teacher dashboard summary    |
| GET    | `/api/cg/teachers/students`        |  Yes | Authenticated | List teacher's students          |
| GET    | `/api/cg/teachers/reviews`         |  Yes | Authenticated | List teacher reviews             |
| GET    | `/api/cg/teachers/profile/:userId` |   No | Public        | View teacher public profile      |

### Example: Create teacher profile

Request:

```json
{
  "subjects": ["Math", "Physics"],
  "education": ["BSc Mathematics"],
  "experience": ["3 years teaching"],
  "availability": ["Mon-Fri 6-9pm"],
  "hourlyRate": 20,
  "bio": "Enthusiastic math teacher"
}
```

Response:

```json
{
  "message": "Teacher profile created successfully",
  "profile": {
    "subjects": ["Math", "Physics"],
    "hourlyRate": 20
  }
}
```

---

## 7. Students

| Method | Path                               | Auth | Role          | Summary                          |
| ------ | ---------------------------------- | ---: | ------------- | -------------------------------- |
| POST   | `/api/cg/students/profile`         |  Yes | Authenticated | Create or update student profile |
| PATCH  | `/api/cg/students/profile`         |  Yes | Authenticated | Patch student profile            |
| GET    | `/api/cg/students/me`              |  Yes | Authenticated | Get current student profile      |
| GET    | `/api/cg/students/dashboard`       |  Yes | Authenticated | Get student dashboard summary    |
| GET    | `/api/cg/students/profile/:userId` |   No | Public        | View student public profile      |

### Example: Student profile payload

Request:

```json
{
  "preferredSubjects": ["Math"],
  "learningGoals": ["Exam preparation"],
  "interests": ["Problem solving"],
  "bio": "Interested in mathematics and coding"
}
```

---

## 8. Search

| Method | Path                             | Auth | Role          | Summary                                  |
| ------ | -------------------------------- | ---: | ------------- | ---------------------------------------- |
| GET    | `/api/cg/search?q=`              |  Yes | Authenticated | Global search using BM25-style ranking   |
| GET    | `/api/cg/search/teachers`        |  Yes | Authenticated | Search teachers with BM25-style ranking  |
| GET    | `/api/cg/search/packages`        |  Yes | Authenticated | Search packages                          |
| GET    | `/api/cg/search/recommendations` |  Yes | Authenticated | Get personalized teacher recommendations |

### Example: Search teachers

Request:

```http
GET /api/cg/search/teachers?subject=math&minPrice=10&maxPrice=30&rating=4&page=1&limit=10
Authorization: Bearer <token>
```

Response:

```json
{
  "items": [
    {
      "profile": {
        "userId": "64...",
        "subjects": ["Math"],
        "hourlyRate": 20,
        "rating": 4.8
      },
      "user": {
        "firstName": "Aarav",
        "lastName": "Sharma"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

## 9. Packages

| Method | Path                                  | Auth | Role          | Summary                        |
| ------ | ------------------------------------- | ---: | ------------- | ------------------------------ |
| GET    | `/api/cg/packages`                    |   No | Public        | List all packages              |
| POST   | `/api/cg/packages`                    |  Yes | Authenticated | Create a package               |
| GET    | `/api/cg/packages/me`                 |  Yes | Authenticated | Get current teacher's packages |
| GET    | `/api/cg/packages/teacher/:teacherId` |   No | Public        | Get teacher's public packages  |
| GET    | `/api/cg/packages/:packageId`         |   No | Public        | Get package details            |
| PATCH  | `/api/cg/packages/:packageId`         |  Yes | Authenticated | Update package                 |
| DELETE | `/api/cg/packages/:packageId`         |  Yes | Authenticated | Delete package                 |

### Example: Create package

Request:

```json
{
  "name": "Starter Pack",
  "description": "Five sessions of 1 hour each",
  "price": 120,
  "durationInHours": 5,
  "sessions": 5,
  "isActive": true
}
```

Response:

```json
{
  "message": "Package created successfully",
  "package": {
    "name": "Starter Pack",
    "price": 120
  }
}
```

---

## 10. Bookings

| Method | Path                                 | Auth | Role          | Summary                       |
| ------ | ------------------------------------ | ---: | ------------- | ----------------------------- |
| POST   | `/api/cg/bookings`                   |  Yes | Authenticated | Create booking                |
| GET    | `/api/cg/bookings`                   |  Yes | Authenticated | Get bookings for current user |
| PUT    | `/api/cg/bookings/:bookingId/status` |  Yes | Authenticated | Update booking status         |

### Example: Create booking

Request:

```json
{
  "teacherId": "6412f9...",
  "subject": "Mathematics",
  "hourlyRate": 15,
  "notes": "Prefer evenings"
}
```

Response:

```json
{
  "message": "Booking created successfully",
  "booking": {
    "teacherId": "6412f9...",
    "subject": "Mathematics",
    "status": "pending"
  }
}
```

---

## 11. Chat

| Method | Path                                    | Auth | Role          | Summary                         |
| ------ | --------------------------------------- | ---: | ------------- | ------------------------------- |
| POST   | `/api/cg/chat/messages`                 |  Yes | Authenticated | Send a message                  |
| GET    | `/api/cg/chat/conversations`            |  Yes | Authenticated | Get conversations               |
| GET    | `/api/cg/chat/messages/:conversationId` |  Yes | Authenticated | Get messages for a conversation |

### Example: Send message

Request:

```json
{
  "recipientId": "6412f9...",
  "content": "Hi, are you available tomorrow?"
}
```

Response:

```json
{
  "message": "Message sent successfully"
}
```

---

## 12. Payments

| Method | Path                                 | Auth | Role          | Summary                       |
| ------ | ------------------------------------ | ---: | ------------- | ----------------------------- |
| POST   | `/api/cg/payments`                   |  Yes | Authenticated | Create payment                |
| GET    | `/api/cg/payments`                   |  Yes | Authenticated | Get payments for current user |
| PUT    | `/api/cg/payments/:paymentId/status` |  Yes | Authenticated | Update payment status         |

### Example: Create payment

Request:

```json
{
  "teacherId": "6412f9...",
  "packageId": "6412f9...",
  "amount": 120,
  "transactionId": "txn_12345"
}
```

Response:

```json
{
  "message": "Payment created successfully",
  "payment": {
    "amount": 120,
    "status": "pending"
  }
}
```

---

## 13. Analytics

| Method | Path                        | Auth | Role          | Summary                     |
| ------ | --------------------------- | ---: | ------------- | --------------------------- |
| GET    | `/api/cg/analytics/student` |  Yes | Authenticated | Student dashboard analytics |
| GET    | `/api/cg/analytics/teacher` |  Yes | Authenticated | Teacher dashboard analytics |
| GET    | `/api/cg/analytics/admin`   |  Yes | ADMIN         | Admin analytics summary     |

---

## 14. KYC

| Method | Path                        | Auth | Role          | Summary                |
| ------ | --------------------------- | ---: | ------------- | ---------------------- |
| POST   | `/api/cg/kyc`               |  Yes | Authenticated | Submit KYC             |
| POST   | `/api/cg/kyc/upload`        |  Yes | Authenticated | Upload KYC document    |
| GET    | `/api/cg/kyc`               |  Yes | Authenticated | Get current user's KYC |
| GET    | `/api/cg/kyc/admin`         |  Yes | ADMIN         | Get all KYC records    |
| PUT    | `/api/cg/kyc/:kycId/review` |  Yes | ADMIN         | Review KYC             |

### Example: Submit KYC

Request:

```json
{
  "documentType": "passport",
  "documentUrl": "https://res.cloudinary.com/.../kyc-doc.jpg"
}
```

Response:

```json
{
  "message": "KYC submitted successfully"
}
```

---

## 15. Categories and Subjects

| Module     | Method | Path                             | Auth | Role                   | Summary            |
| ---------- | ------ | -------------------------------- | ---: | ---------------------- | ------------------ |
| Categories | POST   | `/api/cg/categories`             |  Yes | ADMIN                  | Create category    |
| Categories | GET    | `/api/cg/categories`             |  Yes | Any authenticated user | List categories    |
| Categories | GET    | `/api/cg/categories/:categoryId` |  Yes | Any authenticated user | Get category by id |
| Categories | PATCH  | `/api/cg/categories/:categoryId` |  Yes | ADMIN                  | Update category    |
| Categories | DELETE | `/api/cg/categories/:categoryId` |  Yes | ADMIN                  | Delete category    |
| Subjects   | POST   | `/api/cg/subjects`               |  Yes | ADMIN                  | Create subject     |
| Subjects   | GET    | `/api/cg/subjects`               |  Yes | Any authenticated user | List subjects      |
| Subjects   | GET    | `/api/cg/subjects/:subjectId`    |  Yes | Any authenticated user | Get subject by id  |
| Subjects   | PATCH  | `/api/cg/subjects/:subjectId`    |  Yes | ADMIN                  | Update subject     |
| Subjects   | DELETE | `/api/cg/subjects/:subjectId`    |  Yes | ADMIN                  | Delete subject     |

---

## 16. Notifications

| Method | Path                                         | Auth | Role                   | Summary             |
| ------ | -------------------------------------------- | ---: | ---------------------- | ------------------- |
| GET    | `/api/cg/notifications`                      |  Yes | Any authenticated user | Get notifications   |
| GET    | `/api/cg/notifications/unread-count`         |  Yes | Any authenticated user | Get unread count    |
| PATCH  | `/api/cg/notifications/:notificationId/read` |  Yes | Any authenticated user | Mark one as read    |
| PATCH  | `/api/cg/notifications/read-all`             |  Yes | Any authenticated user | Mark all as read    |
| DELETE | `/api/cg/notifications/:notificationId`      |  Yes | Any authenticated user | Delete notification |

---

## 17. Sessions

| Method | Path                                 | Auth | Role          | Summary                           |
| ------ | ------------------------------------ | ---: | ------------- | --------------------------------- |
| POST   | `/api/cg/sessions`                   |  Yes | Authenticated | Create session                    |
| GET    | `/api/cg/sessions`                   |  Yes | Authenticated | Get all sessions for current user |
| GET    | `/api/cg/sessions/student`           |  Yes | Authenticated | Get student sessions              |
| GET    | `/api/cg/sessions/teacher`           |  Yes | Authenticated | Get teacher sessions              |
| PATCH  | `/api/cg/sessions/:sessionId/start`  |  Yes | Authenticated | Start session                     |
| PATCH  | `/api/cg/sessions/:sessionId/end`    |  Yes | Authenticated | End session                       |
| PATCH  | `/api/cg/sessions/:sessionId/cancel` |  Yes | Authenticated | Cancel session                    |

---

## 18. Reviews

| Method | Path                                 | Auth | Role          | Summary                      |
| ------ | ------------------------------------ | ---: | ------------- | ---------------------------- |
| POST   | `/api/cg/reviews`                    |  Yes | Authenticated | Create review                |
| GET    | `/api/cg/reviews`                    |  Yes | Authenticated | Get reviews for current user |
| GET    | `/api/cg/reviews/teacher/:teacherId` |  Yes | Authenticated | Get teacher reviews          |
| PATCH  | `/api/cg/reviews/:reviewId`          |  Yes | Authenticated | Update review                |
| DELETE | `/api/cg/reviews/:reviewId`          |  Yes | Authenticated | Delete review                |

### Example: Create review

Request:

```json
{
  "teacherId": "6412f9...",
  "rating": 5,
  "comment": "Excellent teaching"
}
```

Response:

```json
{
  "message": "Review created successfully"
}
```

---

## 19. UI Mapping

These backend endpoints support the main dashboard and profile flows:

- Teacher dashboard: `GET /api/cg/teachers/dashboard` + `GET /api/cg/analytics/teacher`
- Student dashboard: `GET /api/cg/students/dashboard` + `GET /api/cg/analytics/student`
- Admin overview: `GET /api/cg/admin/dashboard` + `GET /api/cg/analytics/admin`
- Teacher profile and availability: `POST/PATCH /api/cg/teachers/profile`, `PATCH /api/cg/teachers/availability`
- Student profile: `POST/PATCH /api/cg/students/profile`
- Requests / bookings: `GET /api/cg/bookings`
- Payments: `GET /api/cg/payments`
- Notifications: `GET /api/cg/notifications`
- Messages: `GET /api/cg/chat/conversations`, `GET /api/cg/chat/messages/:conversationId`

---

## 20. Final Swagger-style Summary

This backend exposes a RESTful NestJS API with role-based authorization, JWT authentication, file upload support, and modular feature controllers such as Auth, Users, Teachers, Students, Search, Packages, Booking, Payment, Review, Notification, Session, Analytics, KYC, Category, and Subject management.

All protected endpoints should call the API using:

```http
Authorization: Bearer <token>
```
