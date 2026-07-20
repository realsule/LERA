# LERA | Event Management & Booking Marketplace

LERA is a full-stack platform designed to bridge the gap between event organizers and attendees, featuring real-time booking, secure authentication, and a dynamic event catalog.

## 🚀 Technical Stack
- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Python (Flask), SQLAlchemy, Flask-Restful, Auth (JWT)
- **Database:** SQLite (Development) / PostgreSQL (Production)

## 👥 The Development Team

| Name | Role | Primary Focus |
| :--- | :--- | :--- |
| **Abdifatah** | Backend Developer | Backend API Architecture, Database Design|
| **Suleiman** | Frontend Lead | State Management & React Components |
| **Sydney** | Requirements Lead | UI/UX Design(Figma), Requirements Gathering & Specifications |

## 🔑 Key Features
- **User Auth:** Secure login and registration with role-based access.
- **Event Discovery:** Filterable event catalog by category and date.
- **Booking System:** Integrated reservation logic with seat availability tracking.
- **Admin Dashboard:** Tools for organizers to manage event listings and view analytics.

## 🛠️ Installation & Setup
1. **Backend:**
   ```bash
   cd backend
   pipenv install && pipenv shell
   flask db upgrade
   python mega_seed.py
   python server/app.py
   ```

2.  **Frontend:**
    ```bash
    cd client
    npm install
    npm run dev
    ```
