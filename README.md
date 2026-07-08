# Natours - Advanced Tour Booking API & SSR Web App 🏞️

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![Pug](https://img.shields.io/badge/Pug-A86454?style=for-the-badge&logo=pug&logoColor=white)

A comprehensive, robust RESTful API and Server-Side Rendered (SSR) web application for a fictional tour booking company. This project was built to demonstrate advanced backend architectural concepts, specifically focusing on complex NoSQL database modeling, data security, and efficient API design.

## 🚀 The Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas), Mongoose ODM
- **View Engine:** Pug (Server-Side Rendering)
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Security:** express-rate-limit, helmet, express-mongo-sanitize, xss-clean, hpp
- **Payments:** Stripe API (if implemented)
- **Emails:** Nodemailer, Mailtrap/SendGrid

## 🧠 Advanced Backend Features

This repository serves as a showcase of deep NoSQL expertise, complementing traditional relational database architecture skills. Key backend implementations include:

- **Advanced NoSQL Data Modeling:** Extensive use of Mongoose for strict schema validation, virtual properties (to keep database footprint small), virtual populating, and document/query/aggregation middleware.
- **Complex Data Aggregation:** Implementation of MongoDB aggregation pipelines to calculate real-time tour statistics and generate dynamic monthly business plans.
- **Geospatial Queries:** Utilization of MongoDB's GeoJSON integration to calculate "tours within a specific radius" and "distances to all tours" from a user's coordinate location.
- **Robust Authentication & Authorization:** Stateless JWT authentication mechanism with secure HTTP-only cookies, password encryption, and role-based access control (User, Guide, Lead-Guide, Admin).
- **Enterprise-Level Security:** Comprehensive defense mechanisms against NoSQL query injection, Cross-Site Scripting (XSS), Parameter Pollution, and brute-force attacks.
- **Custom Error Handling:** Centralized global error handling middleware that captures operational anomalies and sends structured, predictable responses for both development and production environments.

## ⚙️ Architecture & MVC Pattern

The application follows a strict **Model-View-Controller (MVC)** architecture to ensure a clear separation of concerns:

- **Models:** Fat models containing data validation, business logic, and database middleware (Mongoose).
- **Controllers:** Thin, asynchronous controllers strictly responsible for handling HTTP requests and responses.
- **Views:** Pug templates directly consuming controller data to render the UI safely on the server.

## 📡 Core API Reference

The API is fully RESTful and utilizes extensive Role-Based Access Control (RBAC) to restrict endpoints based on user privileges (Admin, Lead-Guide, Guide, User).

_(Note: Assumes base URL of `/api/v1`)_

### 🗺️ Tours

| Method   | Endpoint                                                  | Access                   | Description                                                     |
| :------- | :-------------------------------------------------------- | :----------------------- | :-------------------------------------------------------------- |
| `GET`    | `/tours`                                                  | Public                   | Get all tours (supports filtering, sorting, pagination)         |
| `POST`   | `/tours`                                                  | Admin, Lead-Guide        | Create a new tour                                               |
| `GET`    | `/tours/:id`                                              | Public                   | Get a specific tour by ID                                       |
| `PATCH`  | `/tours/:id`                                              | Admin, Lead-Guide        | Update tour details (includes image upload & resize middleware) |
| `DELETE` | `/tours/:id`                                              | Admin                    | Delete a tour entirely                                          |
| `GET`    | `/tours/top-5-tours`                                      | Public                   | Alias: Get top 5 cheapest/highest-rated tours                   |
| `GET`    | `/tours/tours-stats`                                      | Public                   | Aggregation pipeline: Get overarching tour statistics           |
| `GET`    | `/tours/monthly-plan/:year`                               | Admin, Lead-Guide, Guide | Aggregation pipeline: Calculate monthly business plan           |
| `GET`    | `/tours/tours-within/:distance/center/:latlng/unit/:unit` | Public                   | Geospatial: Find tours within a radius                          |
| `GET`    | `/tours/distances/:latlng/unit/:unit`                     | Public                   | Geospatial: Calculate distances to tours from a point           |

### 👤 Users & Authentication

| Method   | Endpoint           | Access    | Description                            |
| :------- | :----------------- | :-------- | :------------------------------------- |
| `POST`   | `/users/signup`    | Public    | Register a new user account            |
| `POST`   | `/users/login`     | Public    | Authenticate user and receive JWT      |
| `GET`    | `/users/myProfile` | Protected | Get currently logged-in user's profile |
| `GET`    | `/users`           | Admin     | Get all users                          |
| `POST`   | `/users`           | Admin     | Create a new user (Direct)             |
| `GET`    | `/users/:id`       | Admin     | Get a specific user by ID              |
| `PATCH`  | `/users/:id`       | Admin     | Update a specific user                 |
| `DELETE` | `/users/:id`       | Admin     | Delete a specific user                 |

### ⭐ Reviews

_(Note: Can also be accessed via nested route `/tours/:tourId/reviews`)_
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/reviews` | Admin, User | Get all reviews |
| `POST` | `/reviews` | Admin, User | Create a new review |
| `GET` | `/reviews/:id` | Protected | Get a specific review by ID |
| `PATCH` | `/reviews/:id` | Admin, User | Update a review |
| `DELETE` | `/reviews/:id` | User | Delete a review |

### 💳 Bookings

| Method   | Endpoint                             | Access    | Description                                 |
| :------- | :----------------------------------- | :-------- | :------------------------------------------ |
| `GET`    | `/bookings/checkout-session/:tourId` | Protected | Generate Stripe checkout session for a tour |
| `GET`    | `/bookings`                          | Admin     | Get all bookings                            |
| `POST`   | `/bookings`                          | Admin     | Create a manual booking                     |
| `GET`    | `/bookings/:id`                      | Admin     | Get a specific booking by ID                |
| `PATCH`  | `/bookings/:id`                      | Admin     | Update a booking                            |
| `DELETE` | `/bookings/:id`                      | Admin     | Delete a booking                            |

## 💻 Local Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone [https://github.com/Omarmadkour71/Natours.git](https://github.com/Omarmadkour71/Natours.git)
   cd Natours
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `config.env` file in the root directory and add the following variables:

   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE=mongodb+srv://<USERNAME>:<PASSWORD>@cluster...
   DATABASE_PASSWORD=<your_db_password>
   JWT_SECRET=<your_ultra_secure_jwt_secret>
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   ```

4. **Build the Frontend Assets:**
   This project uses Parcel to bundle the frontend JavaScript. Before starting the server, you must build the client-side bundle:

   ```bash
   npm run build:js
   ```

5. **Run the Application:**
   The project includes several scripts for different environments.
   _(Note: The environment scripts currently utilize Windows syntax `SET NODE_ENV=...`)_

   **For Development:**
   Open two separate terminal windows to run the server and the frontend watcher simultaneously:

   ```bash
   # Terminal 1: Starts the Node server with Nodemon
   npm run dev

   # Terminal 2: Watches for changes in frontend JS and rebundles automatically
   npm run watch:js
   ```

   **For Production:**

   ```bash
   npm run start:prod
   ```

6. **Access the application:**
   Navigate to `http://localhost:3000` in your browser.
