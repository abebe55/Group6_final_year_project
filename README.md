# North Wollo Tourism Management System

A comprehensive web-based tourism information management system for North Wollo, Ethiopia.

## 🌟 Features

### For Visitors
- Browse tourism places by category (Heritage, Highland, Cavern, Aquatics, Culture, Modern)
- Search and filter destinations
- View detailed place information with interactive maps
- Explore hotels and accommodations
- View ratings and reviews

### For Administrators
- Manage tourism places (create, edit, delete, block/unblock)
- Manage hotels and accommodations
- User management
- Content moderation

## 🏗️ Architecture

### Backend
- **Framework**: Spring Boot 3.2.12
- **Language**: Java 21
- **Database**: PostgreSQL
- **Security**: Spring Security + JWT
- **API Documentation**: Swagger/OpenAPI
- **ORM**: Spring Data JPA/Hibernate

### Frontend
- **Framework**: Next.js 13
- **Language**: JavaScript (React)
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Maps**: Leaflet + React Leaflet
- **HTTP Client**: Axios

## 🚀 Quick Start

### Prerequisites
- Java 21
- Node.js 16+
- PostgreSQL 12+
- Maven 3.8+

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```
Backend runs on: `http://localhost:8080`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

## 📚 Documentation

- **Setup Guide**: See `SETUP_GUIDE.md` for detailed setup instructions
- **Frontend Guide**: See `frontend/README.md`
- **API Documentation**: `http://localhost:8080/swagger-ui.html` (when backend is running)

## 🗂️ Project Structure

```
Group6_webservice_project/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/      # Java source code
│   │   └── com/northwollo/tourism/
│   │       ├── controller/ # REST API controllers
│   │       ├── service/    # Business logic
│   │       ├── repository/ # Data access layer
│   │       ├── entity/     # JPA entities
│   │       ├── dto/        # Data transfer objects
│   │       ├── security/   # Security & JWT
│   │       └── config/     # Configuration
│   └── src/main/resources/
│       └── application.yml # Configuration file
│
├── frontend/               # Next.js frontend
│   ├── components/        # React components
│   ├── pages/            # Next.js pages/routes
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utility functions
│   └── styles/           # CSS styles
│
├── SETUP_GUIDE.md        # Detailed setup guide
└── README.md             # This file
```

## 🔑 Key Technologies

### Backend Stack
- Spring Boot (Web, Data JPA, Security, Validation)
- PostgreSQL JDBC Driver
- JWT (JSON Web Tokens)
- Lombok
- Swagger/OpenAPI
- Spring DevTools

### Frontend Stack
- Next.js 13
- React 18
- React Query (TanStack Query)
- Tailwind CSS
- Leaflet Maps
- Axios

## 🌐 API Endpoints

### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/search/tourism` - Search tourism places
- `GET /api/tourism/{id}` - Get place details
- `GET /api/hotels` - List hotels
- `GET /api/hotels/{id}` - Get hotel details

### Protected Endpoints (Admin)
- `POST /api/tourism` - Create tourism place
- `PUT /api/tourism/{id}` - Update place
- `DELETE /api/tourism/{id}` - Delete place
- `PATCH /api/tourism/{id}/block` - Block place
- `POST /api/hotels` - Create hotel
- `DELETE /api/hotels/{id}` - Delete hotel

## 🎨 Features Implemented

✅ User authentication (register/login)
✅ JWT-based authorization
✅ Tourism place management (CRUD)
✅ Hotel management (CRUD)
✅ Advanced search and filtering
✅ Category-based browsing
✅ Interactive maps (Leaflet)
✅ Responsive design
✅ Admin dashboard
✅ Image support
✅ Rating system
✅ User management
✅ Content moderation (block/unblock)

## 🔒 Security

- JWT token-based authentication
- Password encryption with BCrypt
- Role-based access control (USER, ADMIN)
- CORS configuration
- Protected API endpoints
- Secure HTTP headers

## 📱 Responsive Design

The frontend is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🧪 Testing

### Backend
```bash
cd backend
./mvnw test
```

### Frontend
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend (Production)
```bash
cd backend
./mvnw clean package
java -jar target/tourism-0.0.1-SNAPSHOT.jar
```

### Frontend (Production)
```bash
cd frontend
npm run build
npm start
```

## 👥 Team

Group 6 - Web Service Project

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

This is a student project. For any questions or suggestions, please contact the team members.

## 📞 Support

For issues or questions:
1. Check `SETUP_GUIDE.md` for setup help
2. Review API documentation at `/swagger-ui.html`
3. Check frontend README at `frontend/README.md`

## 🎯 Future Enhancements

- Image upload functionality
- Advanced rating and review system
- Email notifications
- Social media integration
- Multi-language support
- Mobile app (React Native)
- Analytics dashboard
- Booking system integration
