# 🎟️ EventSphere – Full-Stack Event Discovery Platform

<div align="center">

### Discover • Save • Organize • Experience

A modern full-stack event discovery platform that allows users to explore concerts, festivals, conferences, workshops, and local experiences from multiple event providers in one centralized application.

Built with **React**, **Flask**, and **PostgreSQL**.

</div>

---

# ✨ Features

## 🎨 Frontend Features

* Modern responsive landing page
* Dynamic animated hero section
* Event search functionality
* Event source filtering
* Interactive event cards
* Event detail modal
* Saved/favorite events system
* Organizer dashboard
* Admin dashboard
* Create custom local events
* Authentication modal
* Toast notifications
* In-app reminders
* Looping reminder sound alerts
* Dark mode support
* Recommendation system
* Loading and error states
* Mobile responsive design

---

# ⚙️ Backend Features

* Flask REST API architecture
* PostgreSQL database integration
* SQLAlchemy ORM
* Authentication system
* JWT token authorization
* Role-based access control
* Organizer approval workflow
* Saved events functionality
* Reminder system
* Recommendation system
* Analytics dashboard
* External API integrations
* Global exception handling
* Environment configuration support

---

# 🛠️ Tech Stack

## Frontend

| Technology | Purpose                       |
| ---------- | ----------------------------- |
| React      | Frontend framework            |
| Vite       | Frontend tooling              |
| JavaScript | Application logic             |
| CSS3       | Styling and responsive design |
| Fetch API  | API communication             |

---

## Backend

| Technology         | Purpose              |
| ------------------ | -------------------- |
| Flask              | Backend framework    |
| SQLAlchemy         | ORM                  |
| PostgreSQL         | Database             |
| Flask-JWT-Extended | Authentication       |
| Flask-Bcrypt       | Password hashing     |
| Flask-CORS         | Cross-origin support |
| Marshmallow        | Validation           |
| Python             | Backend programming  |

---

# 🔌 API Integrations

## 🎤 Ticketmaster API

Used for:

* concerts
* sports events
* entertainment events

---

## 🎫 Eventbrite API

Used for:

* conferences
* workshops
* local experiences
* community events

---

# 🔐 Authentication Features

Users can:

* Register accounts
* Login/logout
* Save events
* Create events
* Access personalized event data
* Set event reminders

Authentication includes:

* password hashing
* protected routes
* token-based authorization
* role-based access

---

# ❤️ Reminder System

EventSphere includes an advanced in-app reminder system.

## ✨ Features

* 🔊 Plays looping sound notifications
* 📝 Displays saved custom reminder messages
* 📌 Persistent reminder notification
* ❌ Sound stops only when dismissed
* 🗑️ Reminder deletion support

---

## 🔊 Reminder Audio

Place your sound file here:

```txt
public/sound.mp3
```

---

# 🎯 Recommendation System

The recommendation system suggests events based on categories from a user’s saved events.

Example:

```txt
If a user saves Music events,
the app recommends approved Music events.
```

Recommendations currently use:

* saved event categories
* approved local events
* category matching logic

---

# 📊 Analytics Dashboard

Admins can view:

* total events
* approved events
* pending events
* rejected events
* saved event statistics
* category popularity

---

# 📁 Project Structure

```bash
React-App-with-External-API-Integration/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── __init__.py
│   │   └── config.py
│   │
│   ├── requirements.txt
│   ├── run.py
│   └── venv/
│
├── public/
│   └── sound.mp3
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── package.json
├── vite.config.js
├── README.md
└── .gitignore
```

---

# 🚀 Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Kip-opp/React-App-with-External-API-Integration.git
```

---

# 🐘 PostgreSQL Installation

## Ubuntu / Linux

Install PostgreSQL:

```bash
sudo apt update

sudo apt install postgresql postgresql-contrib
```

Start PostgreSQL:

```bash
sudo service postgresql start
```

Check installation:

```bash
psql --version
```

---

## Windows

Download PostgreSQL:

```txt
https://www.postgresql.org/download/windows/
```

During installation:

* keep default port `5432`
* remember your PostgreSQL password
* install pgAdmin if prompted

---

# 🗄️ PostgreSQL Database Setup

Open PostgreSQL:

```bash
sudo -u postgres psql
```

Run:

```sql
CREATE USER eventsphere_user WITH PASSWORD 'eventsphere_password';

ALTER USER eventsphere_user CREATEDB;

CREATE DATABASE eventsphere_db OWNER eventsphere_user;

GRANT ALL PRIVILEGES ON DATABASE eventsphere_db TO eventsphere_user;

\c eventsphere_db

ALTER SCHEMA public OWNER TO eventsphere_user;

GRANT ALL ON SCHEMA public TO eventsphere_user;

\q
```

---

## ⚠️ If Database/User Already Exists

If you see:

```txt
role already exists
database already exists
```

run only:

```sql
\c eventsphere_db

ALTER SCHEMA public OWNER TO eventsphere_user;

GRANT ALL ON SCHEMA public TO eventsphere_user;

\q
```

---

# 🌍 Environment Variables

Create a `.env` file inside the backend folder:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

FLASK_ENV=development

DATABASE_URL=postgresql://eventsphere_user:eventsphere_password@localhost:5432/eventsphere_db

EVENTBRITE_PRIVATE_TOKEN=your-eventbrite-token
EVENTBRITE_ORG_ID=your-eventbrite-org-id

TICKETMASTER_API_KEY=your-ticketmaster-api-key

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password

ORGANIZER_SECRET_CODE=EVENTSPHERE-ORG-2026
```

---

# ⚙️ Backend Setup

## Navigate to Backend

```bash
cd backend
```

---

## Create Virtual Environment

```bash
python3 -m venv venv
```

---

## Activate Virtual Environment

```bash
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Start Backend Server

```bash
python3 run.py
```

Backend runs on:

```bash
http://127.0.0.1:5000
```

---

# 🎨 Frontend Setup

Open a second terminal from the ROOT project folder:

```bash
npm install

npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🧪 Testing

## Backend Testing

Test API endpoints using:

* Postman
* Thunder Client
* curl
* frontend integration

---

## Frontend Testing

Verify:

* authentication
* event creation
* organizer workflow
* admin approvals
* recommendations
* reminders
* dark mode
* event filtering
* saved events
* responsive design

---

# 🛡️ Admin Access

Admin accounts are restricted and are not publicly created through signup.

Only the project owner should have admin access.

Forked versions of the project will not automatically receive admin permissions.

---

# 📌 Current Completed Features

## ✅ Backend

* Authentication system
* Backend security
* User models and schemas
* Saved events system
* Reminder functionality
* Recommendation system
* Analytics dashboard
* PostgreSQL integration
* API integrations
* Organizer approval workflow
* Global exception handling

---

## ✅ Frontend

* Landing page redesign
* Hero section UI
* Event grid system
* Responsive event cards
* Authentication modal
* Saved events page
* Reminder modal
* Organizer dashboard
* Admin dashboard
* Dark mode
* Recommendation view
* Source filtering
* Search functionality

---

# 🔮 Future Improvements

* Email reminders
* Ticket receipts
* Cloud deployment
* Push notifications

---

# 👥 Team & Contributions

| Team Member  | Contributions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Samantha** | Built `App.jsx` and `main.jsx`, managed application state and frontend integration, implemented backend authentication system, configured backend security, created shared dependencies, implemented authentication logic, created user models/schemas, built authentication endpoints, configured backend logging, created backend documentation, environment configuration support, contributed to UI redesign, implemented dark mode, PostgreSQL integration, reminders system, admin workflow improvements, analytics integration, and recommendation system integration |
| **Sharon**   | Designed and styled the frontend user interface, created event database models/schemas/repositories, implemented event service logic, built event API endpoints, and contributed recommendation system logic                                                                                                                                                                                                                                                                                                                                                                 |
| **Denis**    | Implemented Ticketmaster API integration, handled frontend data fetching logic, created ticket database models/schemas/repositories, implemented ticket purchase logic, and built ticket API endpoints                                                                                                                                                                                                                                                                                                                                                                       |
| **Engine**   | Developed reusable React components, structured frontend component architecture, created saved event database models/schemas/repositories, implemented saved event logic, and built saved events API endpoints                                                                                                                                                                                                                                                                                                                                                               |

---

# 📜 License

This project was developed for educational purposes.

---

