# TaskFlow — Task Management System

## Setup

### 1. Backend
```bash
cd backend
npm install
```

Edit `.env` if needed (default values work for local):


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
