# 🎭 LERA - Live Event Reservation Application

A comprehensive event management platform that connects event organizers with attendees through seamless ticket booking, real-time availability tracking, and immersive user experiences.

## 🌟 Key Features

### 🎫 **Event Discovery & Booking**
- **Smart Search**: Filter events by category, location, date, and price
- **Real-time Availability**: Live ticket counts and availability status
- **Secure Booking**: Integrated payment processing with multiple payment methods
- **Interactive Maps**: Venue location with directions and parking information

### 👥 **User Management**
- **Role-based Access**: Admin, Organizer, and Attendee roles
- **Social Authentication**: OAuth integration with Google and Facebook
- **Profile Management**: Personalized dashboards and booking history
- **Review System**: Rate and review events with star ratings

### 🎨 **Premium UI/UX**
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Mode**: Eye-friendly interface for night browsing
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation

### 📊 **Analytics & Insights**
- **Event Analytics**: Real-time attendance tracking and revenue metrics
- **User Behavior**: Advanced analytics for event optimization
- **Sales Dashboard**: Comprehensive revenue and booking reports
- **Export Features**: CSV/PDF exports for financial reporting

## 🛠️ Tech Stack

### **Backend Architecture**
- **Framework**: Flask 2.3+ with Python 3.8+
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT-based with role-based permissions
- **API**: RESTful API with OpenAPI documentation
- **File Storage**: Cloudinary for event images and documents

### **Frontend Technology**
- **Framework**: React 18+ with Vite build tool
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API with local storage persistence
- **Icons**: Lucide React icon library
- **HTTP Client**: Axios with interceptors and error handling

### **Development Tools**
- **Version Control**: Git with GitHub CI/CD
- **Code Quality**: ESLint, Prettier, and Husky pre-commit hooks
- **Testing**: Jest for unit tests, React Testing Library for components
- **Documentation**: JSDoc comments with automated API docs

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ and npm 8+
- Python 3.8+ and pip
- Git for version control

### **Installation Steps**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/realsule/LERA.git
   cd LERA
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python server/app.py
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Database Initialization**
   ```bash
   cd backend
   python seed.py  # Populate with sample data
   ```

### **Access Points**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5555
- **API Documentation**: http://localhost:5555/docs

## 🎯 Demo Credentials

For presentation and testing purposes:

- **Email**: `demo@example.com`
- **Password**: `Demo123!`
- **Role**: Demo User with full access

## 💰 Currency & Pricing

All prices are displayed in **Kenya Shillings (KES)**:

- **Music Festival**: KES 9,500 (~$75 USD)
- **Tech Conference**: KES 37,800 (~$299 USD)  
- **Sports Events**: KES 6,300 (~$50 USD)

## 🏗️ Project Structure

```
LERA/
├── backend/                 # Flask API server
│   ├── server/             # Application factory and config
│   ├── routes/             # API route handlers
│   ├── models/             # Database models
│   ├── migrations/         # Database migrations
│   └── tests/              # Backend test suite
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── public/            # Static assets
├── docs/                  # Project documentation
└── README.md              # This file
```

## 🔧 Configuration

### **Environment Variables**

**Backend (.env)**
```env
DATABASE_URL=sqlite:///instance/lera.db
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5555
VITE_APP_NAME=LERA
VITE_CURRENCY=KES
```

## 🎨 UI Features

### **Presentation Enhancements**
- **High-Quality Images**: Unsplash integration for event visuals
- **Hover Effects**: Interactive event cards with smooth transitions
- **Fade-in Animations**: Statistics and content loading animations
- **Purple Theme**: Consistent brand color (#7C3AED) throughout

### **Mobile Optimization**
- **Touch-Friendly**: Optimized button sizes and gestures
- **Responsive Layout**: Adaptive design for all screen sizes
- **Performance**: Lazy loading and optimized assets

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Granular permissions by user role
- **Input Validation**: Comprehensive form validation with Yup
- **CORS Protection**: Proper cross-origin resource sharing
- **SQL Injection Prevention**: SQLAlchemy ORM protection
- **XSS Protection**: Content Security Policy and input sanitization

## 📱 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

### **Events**
- `GET /api/events/` - List all events
- `GET /api/events/{id}` - Get event details
- `POST /api/events/` - Create new event (organizers)
- `PUT /api/events/{id}` - Update event (organizers)
- `DELETE /api/events/{id}` - Delete event (organizers)

### **Bookings**
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/my` - User's bookings
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

## 🧪 Testing

### **Running Tests**
```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd client && npm test
```

### **Test Coverage**
- **Backend**: 85%+ code coverage
- **Frontend**: 80%+ component coverage
- **E2E**: Critical user journey testing

## 🚀 Deployment

### **Production Setup**
- **Backend**: Render.com with automatic scaling
- **Frontend**: Netlify with continuous deployment
- **Database**: PostgreSQL for production
- **CDN**: Cloudinary for media assets

### **Environment Configuration**
- **Development**: Local SQLite with hot reload
- **Staging**: Render preview environments
- **Production**: Optimized build with monitoring

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Code Standards**
- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript
- Write tests for new features
- Update documentation

## 📞 Support & Contact

### **Project Team**
- **Backend Developer**: [Backend Team Lead]
- **Frontend Developer**: [Frontend Team Lead]
- **UI/UX Designer**: [Design Team Lead]
- **Project Manager**: [Project Coordinator]

### **Getting Help**
- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@lera-events.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team**: For the amazing React framework
- **Flask Community**: For excellent documentation and tools
- **Unsplash**: For beautiful event photography
- **Tailwind CSS**: For the utility-first CSS framework
- **Open Source Community**: For the countless libraries and tools

---

**🎭 LERA - Where Events Come to Life**

*Connecting communities through unforgettable experiences*

**Version**: 2.0.0 | **Last Updated**: January 2024
