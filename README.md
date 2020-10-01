<p align="center">
<img  src="logo.png" width="250" height="250">
  </p>
  
  <br/>
  

# Our Story API
https://ourstory-app.com

REST API for the Our Story mobile application. Now live on the App Store.

## Introduction
- Our Story is an iOS application that gives the users the chance to share their thoughts, secrets and emotional troubles, allowing them to receive support from the rest of the community. All of this can be achieved anonymously if the user desires.
- This API serves as the back-end of the application which is developed in Node.js, uses the Express framework and MongoDB as its main database.
- The key features of this applications will be highlighted below in detail.

## User Authentication
- Authentication throughout this API is handled using JSON Web Tokens. However, since this is a mobile application and it wouldn't be acceptable for tokens to expire, forcing users to sign-in every now and then. Thus, I resorted to keeping state of active tokens storing them initially in the database and when the user comes back, a database check occurs only once to verify the validity of the token, then it gets cached for a couple of hours in order to speed up upcoming requests, avoiding a DB check each time.
- A templated HTML verification email gets sent to the user immediately upon registration with a secret token in a form of a URL, this is done using node-mailer.
- Reset Password is handled in a similar way to the email verification procedure. However, once the link sent to the user's email is clicked, it redirects to a React.js page where the user will enter their new password.

## Posts & Comments
- Endpoints for creating, deleting and retrieving posts and comments.
- Ability to filter the posts response to get the most popular ones or the ones near you.
- Posts & comments pagination
- The user has the option to hide posts and comments they do not want to see, as well as block posts and comments from a specific user.

## Notifications
- Notifications are sent to the user through Apple's Push Notification service.
- An endpoint fetches the user's device ID once they confirm the notifications permission
- User receives a notification each time someone comments on their posts or if someone commented on a post they commented on.
- Ability to turn off any notifications if desired.

## Author
Andrew Amgad, <br />
Portfolio: https://andrewamgad.com
<strong>Email</strong>: contact@andrewamgad.com <br />
<strong>LinkedIn</strong>: https://www.linkedin.com/in/andrewamgad
