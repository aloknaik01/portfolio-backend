<h1 align="center">🎯 Personal Portfolio Backend</h1>

<p align="center">
  <b>RESTful API built with Node.js, Express, and MongoDB</b><br/>
  Powers dynamic features like contact form handling, admin authentication, and project management.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-API-blue?logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Database-brightgreen?logo=mongodb" />

---

## 🚀 Features

- 📬 Contact form handling
- 🧾 Project CRUD operations
- 🔐 Admin login with JWT authentication
- ⚙️ RESTful API integration
- 🛡️ Secured with Helmet, CORS, and bcrypt
- 🔧 Modular folder structure
- 🌐 Ready for deployment

---

## 🛠️ Tech Stack

| Purpose      | Technology                     |
|--------------|--------------------------------|
| Runtime      | Node.js                        |
| Framework    | Express.js                     |
| Database     | MongoDB, Mongoose              |
| Auth         | JWT (JSON Web Token)           |
| Password Hashing | bcrypt                     |
| Env Mgmt     | dotenv                         |
| Security     | Helmet, CORS                   |

---

## 📁 Folder Structure

```bash
portfolio-backend/
├── controllers/       # Route logic
├── models/            # Mongoose schemas
├── routes/            # API endpoints
├── middleware/        # JWT, error handlers
├── config/            # DB connection & environment setup
├── .env               # Environment variables (excluded)
├── .gitignore         # Files to ignore in Git
├── app.js             # Main app entry point
├── package.json
└── README.md
