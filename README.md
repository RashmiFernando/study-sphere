# Effective Timetable Management System for University Students

## 🎓 Project Overview

This project presents an innovative **Effective Timetable Management System** designed specifically for university students, lecturers, and administrative staff. The system addresses common scheduling challenges and location conflicts by providing an automated, intelligent timetable generation solution.

## 🎯 Problem Statement

Through extensive campus research and student surveys, we identified critical issues with existing timetable and scheduling systems:

- **Manual scheduling conflicts** between courses, lecturers, and locations
- **Location capacity mismatches** with student enrollment numbers
- **Time slot overlaps** causing scheduling conflicts
- **Inefficient resource utilization** of lecture halls and facilities
- **Lack of real-time updates** when changes occur
- **Poor communication** between students, lecturers, and administration

## 🔬 Research Background

Our team conducted comprehensive research including:

- **Student Opinion Surveys**: Gathered feedback from university students about existing timetable systems
- **Lecturer Interviews**: Collected insights on scheduling preferences and constraints
- **Location Analysis**: Studied campus facilities and capacity limitations
- **Academic Research**: Published research paper on automated timetable generation algorithms

## ✨ System Features

### 🔄 Automated Timetable Generation
- **Conflict-free scheduling** based on multiple constraints
- **Intelligent algorithm** that considers all stakeholders' requirements
- **Real-time validation** of time slots and location availability

### 👥 Multi-User Management
- **Student Management**: Course enrollment, module tracking
- **Lecturer Management**: Specialization areas, availability slots
- **Location Management**: Capacity tracking, facility requirements

### 🏫 Smart Location Allocation
- **Capacity matching** with student enrollment numbers
- **Facility requirement** consideration (labs, lecture halls, etc.)
- **Optimal space utilization** across campus

### 📊 Comprehensive Analytics
- **Resource utilization** reports
- **Conflict detection** and resolution
- **Performance metrics** for scheduling efficiency

## 🛠️ Technology Stack

### Frontend
- **React.js** - User interface development
- **Tailwind CSS** - Responsive design and styling
- **JavaScript ES6+** - Interactive functionality

### Backend
- **Node.js** - Server-side runtime environment
- **Express.js** - Web application framework
- **RESTful APIs** - Communication between frontend and backend

### Database
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Object Document Mapping (ODM) library

### Additional Tools
- **JWT** - Authentication and authorization
- **Socket.io** - Real-time updates
- **Chart.js** - Data visualization

## 📋 Requirements Gathered

### Student Information
- Personal details and contact information
- Enrolled courses and academic programs
- Module selections and prerequisites
- Preferred time slots and constraints

### Lecturer Information
- Personal and professional details
- Specialization areas and expertise
- Available time slots and preferences
- Course assignments and workload

### Location Information
- Building and room details
- Capacity and facility types
- Availability tracking

## 🏗️ System Architecture

- **Frontend**: React.js SPA
- **Backend**: Node.js/Express REST API
- **Database**: MongoDB (NoSQL)
- **Authentication**: JWT-based user authentication

## ⚙️ Installation

### Prerequisites

- Node.js (v14+)
- npm
- MongoDB
- Git

### Setup Steps

**Clone the repository:**
```bash
git clone https://github.com/RashmiFernando/study-sphere.git
cd study-sphere
```

**Backend Setup:**
```bash
cd academic-backend
npm install
# Configure environment variables (see .env.example)
nodemon server.js
```

**Frontend Setup:**
```bash
cd ../academic-frontend
npm install
npm start
```

## 🚀 Usage

- Access the frontend at `http://localhost:3000`
- Use provided credentials or register as a new user
- Start creating and managing timetables, courses, and locations

## ⭐ Key Benefits

- Minimizes manual conflicts and saves administrative time
- Maximizes campus resource usage
- Empowers students and lecturers with flexible, real-time scheduling
- Supports analytics for data-driven decision-making

## 📄 Research Paper

See the `/docs` folder or [repository wiki](https://github.com/RashmiFernando/study-sphere/wiki) for published papers and detailed technical documentation.

## 👤 Contributors

- [Rashmi Fernando](https://github.com/RashmiFernando)
- [Janith Waduge](https://github.com/JanithWaduge)
- [Mayashi Hansika](https://github.com/DMDMHansika)

