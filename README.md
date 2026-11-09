# 🍽️ Cafeteria AI Assistant

**An Intelligent AI-Powered Cafeteria Management System**

## 📌 Overview

Cafeteria AI Assistant is a web-based cafeteria management platform designed to simplify and automate daily cafeteria operations while improving customer experience through Artificial Intelligence.

The system combines traditional cafeteria management functionalities with an AI-powered chatbot that provides instant assistance to users regarding cafeteria services and related inquiries.

The main application is developed using PHP, while the AI chatbot is powered by Node.js and Express.js and integrated into the main `index.php` page, providing users with a unified experience.

## 🎯 Project Objectives

- Automate cafeteria management operations.
- Simplify food menu browsing and management.
- Improve order processing and customer experience.
- Provide an interactive AI-powered assistant.
- Reduce manual administrative activities.
- Improve accessibility to cafeteria information.
- Support efficient management of cafeteria services.

## ✨ Key Features

### 1. Cafeteria Management
- User registration and authentication.
- Food menu browsing and management.
- Shopping cart functionality.
- Customer order placement.
- Order history management.
- Sales and payment management.
- Table reservation functionality.
- Table availability management.

### 2. AI-Powered Cafeteria Assistant
- Interactive AI chatbot.
- Natural-language communication.
- Instant responses to cafeteria-related questions.
- Assistance with cafeteria information and services.
- Dedicated chatbot interface integrated into the main application.

### 3. Security and User Management
- Authentication and authorization.
- Password hashing using bcrypt.
- JWT-based authentication where applicable.
- Input validation.
- Role-based access control.
- Environment-based configuration.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | User interface and styling |
| JavaScript | Frontend interactivity |
| PHP | Main application backend |
| Node.js | AI chatbot backend |
| Express.js | API and server management |
| MongoDB | Database technology |
| JWT | Authentication |
| bcrypt | Password security |

## 🏗️ System Architecture

The application follows a client-server architecture in which the main cafeteria platform communicates with backend services through APIs.

**System workflow:**

1. Users access the cafeteria application through the web interface.
2. PHP handles the main cafeteria management functionality.
3. Users interact with the AI assistant through the integrated chatbot interface.
4. The Node.js backend processes chatbot requests.
5. The AI service generates an appropriate response.
6. The response is returned to the chatbot interface.

```text
              USER
                |
                v
        CAFETERIA WEB APP
             (PHP)
                |
        +-------+-------+
        |               |
        v               v
   MANAGEMENT       AI CHATBOT
   FUNCTIONALITY        |
                        v
                  NODE.JS SERVER
                        |
                        v
                    AI SERVICE
                        |
                        v
                  CHATBOT RESPONSE
```

## 📂 Main Components

- **Frontend:** User interface and interactive components.
- **PHP Backend:** Cafeteria management operations.
- **Node.js Backend:** AI chatbot processing and API services.
- **Database:** Application data management.
- **AI Integration:** Intelligent conversational assistance.

## 🚀 Installation and Setup

### Prerequisites

- PHP and a local or hosted PHP server.
- Node.js and npm.
- MongoDB, if required by the configured application.
- A modern web browser.
- Required environment variables and AI API credentials.

### Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/majungumtaa-cpu/REPOSITORY-NAME.git
```

2. Navigate to the project directory:

```bash
cd REPOSITORY-NAME
```

3. Configure the PHP application using your local or hosting server.

4. Navigate to the Node.js server directory:

```bash
cd server
```

5. Install dependencies:

```bash
npm install
```

6. Configure the required environment variables and AI API credentials.

7. Start the Node.js server using the configured start command.

8. Open the PHP application through your local or hosted web server.

## 🔒 Security Considerations

The project incorporates security practices such as password hashing, authentication, input validation, and environment-based configuration.

API credentials should be stored securely and should never be committed to a public repository.

## 🔮 Future Improvements

- Advanced AI conversational capabilities.
- Real-time order tracking.
- Integration with actual payment gateways.
- Advanced sales analytics and reporting.
- Improved recommendation systems.
- Enhanced mobile responsiveness.
- Automated notifications.

## 👨‍💻 Developer

**Kalebo Emanuel Mpenda**

Software Developer | ICT Officer | AI & Data Enthusiast

GitHub: https://github.com/majungumtaa-cpu

## 📄 License

This project is intended for educational, research, and software development purposes. Licensing and distribution terms should be defined by the repository owner.

---

**Cafeteria AI Assistant — Making Cafeteria Management Smarter Through Technology and Artificial Intelligence.**
