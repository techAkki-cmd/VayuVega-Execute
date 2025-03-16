# 🚀 Project Setup

## Frontend Setup

This frontend is built using [Vite](https://vitejs.dev/) and React. Follow the steps below to set up the project locally.

### 📦 Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Git](https://git-scm.com/)

### 📥 Clone the Repository
```sh
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 📌 Install Dependencies
```sh
npm install
```

### 🏃 Start Development Server
```sh
npm run dev
```
By default, the app will be available at `http://localhost:5173/`.

### 🛠 Environment Variables
Create a `.env` file in the root directory and add your environment variables:
```env
VITE_SERVER_URL="http://localhost:8080"
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_AI_URL=your_ai_model_url
```

## 🏗 Analyse Feedback Model Setup

Go to this link: [Google Colab Model](https://colab.research.google.com/drive/1MQ2HjcBsG8AENEBa7cHivO_DUz9JMZfb?usp=sharing)

Run the model, and at the end, you will get a URL.
Replace `VITE_AI_URL` in the `.env` file with the generated URL.

## Backend Setup (Spring Boot)

This project uses Spring Boot for the backend. Follow these steps to run the server locally.

### 📦 Prerequisites
Make sure you have the following installed:
- [Java JDK 17+](https://adoptium.net/)
- [Maven](https://maven.apache.org/)
- [PostgreSQL](https://www.postgresql.org/) (or your preferred database)

### 📥 Clone the Repository
```sh
git clone https://github.com/your-username/your-backend-repo.git
cd your-backend-repo
```

### 🔧 Configure Environment Variables
Create an `application.properties` file inside `src/main/resources/` and configure your database connection:
```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/your_db_name
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 📌 Install Dependencies and Build the Project
```sh
mvn clean install
```

### 🚀 Run the Spring Boot Server
```sh
mvn spring-boot:run
```
By default, the backend server will run on `http://localhost:8080/`.

Now, the frontend and backend are both running locally. Happy coding! 🎉

