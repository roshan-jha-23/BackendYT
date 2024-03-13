# Backend with JavaScript

This is the backend portion of our web application, built using JavaScript. Below are the key components and technologies used in our backend setup:

## Technologies Used:

- **MongoDB Atlas**: We utilize MongoDB Atlas, a cloud-based database service, for storing our data. MongoDB is a NoSQL database, offering flexibility and scalability.

- **bcrypt**: To ensure secure password storage, we employ bcrypt, a library for hashing passwords. This helps in safeguarding user credentials even if the database is compromised.

- **JSON Web Tokens (JWT)**: JWT is employed for authentication purposes. Upon successful login, users receive a JWT token, which they include in subsequent requests. This enables the server to authenticate users without storing their credentials on every request.

- **mongooseAggregatePaginate**: This is a plugin for Mongoose, our Object Data Modeling (ODM) library for MongoDB and Node.js. It enables efficient pagination of data retrieved through Mongoose's aggregation framework, allowing us to manage and display large datasets effectively.

## Additional Information:

- **Model Link**: [Link to the model](https://app.eraser.io/workspace/vGobqnb6scZbLfZWzhdm?origin=share) (Include any relevant links or resources here.)

- **Sample Image**: ![Sample Image](image.png) (You can provide a sample image or screenshot here, if applicable.)

This README provides a brief overview of our backend setup, highlighting the key technologies and components used in our project. For more detailed information, please refer to our codebase.
