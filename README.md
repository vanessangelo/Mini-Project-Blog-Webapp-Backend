# Mini_Project_Backend

Hi there! this is my mini project to implement my technical backend skill. Read more below.

## What the project does

The project serves as a backend implementation for a blogging website. It leverages various backend technical skills and frameworks to deliver a robust and scalable solution for managing and publishing blog posts. The backend system handles user authentication, blog post management, category organization, and other essential features of a blogging platform. It provides secure API endpoints for front-end applications to interact with, allowing users to create, read, update, and delete blog posts, as well as perform other actions such as liking posts and managing user profiles. The project emphasizes code quality, performance, and maintainability, following best practices and industry standards in software development.

## Getting Started

To get started with the project, follow these steps:

### Prerequisites

- Node.js (v18.15.0)
- npm (9.5.0)

### Installation

1. Clone the repository:

   ```shell
   git clone <repository-url>
   
2. Install the dependencies:

   ```shell
   npm install

### Configuration

1. Rename the .env.example file to .env and update the configuration values according to your environment.

2. Customize other configuration files if needed.

### Usage

1. Start the development server: (Nodemon is installed and added to package.json file)

   ```shell
   npm start
   
2. Access the application at http://localhost:(XXXX) in your browser according to your .env file.

3. Create your database in mySQL and add categories like below:

   ```mySQL
   INSERT INTO categories (name)
    VALUES
	("General"),
    ("Sports"),
    ("Economy"),
    ("Politics"),
    ("Business"),	
    ("Fiction");

### Additional Features
1. sequelize and sequelize-cli is installed. It provides migration and also seeder function.

## Message From Creator
HAPPY CODING!
