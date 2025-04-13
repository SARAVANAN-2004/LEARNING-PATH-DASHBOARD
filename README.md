
# 📚 Learning Path Dashboard

The **Learning Path Dashboard** is a full-stack web application designed for learners to manage, track, and explore personalized course content. Inspired by platforms like Udemy, this app provides users with a dedicated dashboard and course experience.

---

## 🚀 Features

- 🔐 User Authentication with Email/Password & Google OAuth  
- 🧑 My Learning Dashboard – personalized enrolled courses  
- 🔍 Explore Course Page – dynamic rendering from the database  
- 🎥 Video lessons & section-based content (JSONB)  
- 🛠️ Instructor course creation with metadata & pricing  
- 📬 Email Notifications using Nodemailer (Gmail)  
- 🌐 Responsive EJS UI using Bootstrap  

---

## 🛠 Tech Stack

### Frontend
- HTML, CSS, Bootstrap  
- EJS (Embedded JavaScript Templates)  

### Backend
- Node.js, Express.js  
- PostgreSQL  

### Tools & Libraries
- Passport.js (Local + Google OAuth)  
- Nodemailer (Gmail SMTP)  
- pg / Sequelize (PostgreSQL ORM)  
- dotenv, bcrypt, express-session  

---

## ⚙️ Environment Variables

Create a `.env` file in the root and store the following:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=

PG_USER=
PG_HOST=
PG_DATABASE=
PG_PASSWORD=
PG_PORT=

GMAIL_USER=
GMAIL_PASS=
```

---

## 🧪 PostgreSQL Table Setup

Run the following SQL statements to set up your PostgreSQL database tables:

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Courses Table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR,
  category VARCHAR,
  description TEXT,
  image_url TEXT,
  course_type VARCHAR,
  time_commitment VARCHAR,
  target_audience TEXT,
  requirements TEXT,
  instructor VARCHAR,
  badges TEXT[],
  original_price NUMERIC,
  price NUMERIC,
  rating NUMERIC,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Courses Table (Enrollments)
CREATE TABLE user_courses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Contents Table
CREATE TABLE course_contents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  course_id INTEGER REFERENCES courses(id),
  content JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💻 Getting Started

### 1️⃣ Clone the repo

```bash
git https://github.com/SARAVANAN-2004/LEARNING-PATH-DASHBOARD.git
cd learning-path-dashboard
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure the environment

- Create a `.env` file using the template above  
- Set up your PostgreSQL database  

### 4️⃣ Start the server

```bash
node server.js
```

Visit: [http://localhost:3000](http://localhost:3000)