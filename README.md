# TaskFlow — Task Management System

## Setup

### 1. Backend
```bash
cd backend
npm install
```

Edit `.env` if needed (default values work for local):
```
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=taskflow_super_secret_key_change_in_production
ADMIN_EMAIL=admin@taskflow.com
ADMIN_PASSWORD=Admin@1234
```

### 2. Create Admin Account (run ONCE)
```bash
npm run create-admin
```
This creates the admin in MongoDB. Run only once — it won't duplicate.

### 3. Start Backend
```bash
npm run dev
```

### 4. Frontend
```bash
cd frontend
npm install
npm start
```

---

## Admin Login
| Field | Value |
|-------|-------|
| Email | admin@taskflow.com |
| Password | Admin@1234 |

> ⚠️ Change these in `.env` before going live

---

## How it works

**Admin (only one, fixed)**
- Login with admin credentials
- View all users and their tasks
- View all tasks across the system
- Create & assign tasks to any user
- Filter tasks by status / priority
- Change user roles, delete users

**Regular Users**
- Register with name, email, password
- Login and see their own tasks only
- Create, update, delete their own tasks
- Update task status (Todo → In Progress → Done)
- Data persists — same data on every login

**Security**
- Admin email cannot be used for registration
- JWT token stored in localStorage (7 day expiry)
- Passwords hashed with bcrypt
- All routes protected by auth middleware
