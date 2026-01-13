🏟️ LERA — Local Events and Reviews App

LERA is a sophisticated community-driven platform designed to bridge the gap between event organizers and local attendees. It empowers users to discover, book, and review local experiences while providing organizers with a robust management dashboard.

Goal: Streamline local event discovery and foster community engagement through transparent reviews.Mission: "Connecting people to experiences that matter, right in their backyard."

🌍 Overview

LERA allows users to:

   Discover: Browse localized event listings with real-time filtering.
   Organize: Create and manage events via a dedicated Organizer Panel.
   Engage: Write reviews, rate experiences, and select tickets.
   Administer: Full-scale management of users and events via the Admin Panel.
   
🧠 Tech Stack

| **Frontend** | React (Vite) | 
| **Backend** | Python (Flask) |
| **State** | Context API | 
| **Styling** | CSS3 / Tailwind |


🧩 Setup Instructions


## 🧩 Setup Instructions

Follow these steps to get your local development environment running.

<summary><b>Step 1: Clone the Repository</b></summary>

```bash
git clone [https://github.com/realsule/lera.git](https://github.com/realsule/lera.git)
cd LERA
</details>

<details> <summary><b>Step 2: Frontend Setup (React + Vite)</b></summary>

Navigate to the client directory and install dependencies:

Bash

cd client
npm install
npm run dev
Note: The frontend will be available at http://localhost:5173

</details>

<details> <summary><b>Step 3: Backend Setup (Python)</b></summary>

Activate your environment and install the required packages:

Bash

# Move to the backend folder (suggested structure)
cd ../backend

# Activate Virtual Environment
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start the server
python app.py
```


🔨 Task Breakdown

| Area | Lead | Responsibilities |
| :--- | :--- | :--- | 
| **Backend** | Abdifatah | API Design, venv setup, DB Schema |
| **Frontend** | Suleiman | Component architecture & Routing | 
| **Design** & **Auth** | Sydney | Brand Assets, Layout Polishing & JWT | 
 
