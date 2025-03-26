# Scriptorium: A New Way to Write Code  

Adapted from https://www.cs.toronto.edu/~kianoosh/courses/csc309/resources/handouts/?source=pp1

Scriptorium is an innovative online platform designed for writing, executing, and sharing code in multiple programming languages. Inspired by the historical scriptorium—where manuscripts were created and preserved—this platform modernizes the concept for the digital era. It provides a secure space for programmers, tech enthusiasts, and learners to experiment, refine, and save their code as reusable templates. Whether you need to test a quick snippet or build a structured example, Scriptorium equips you with the tools to bring your ideas to life.  

---

## Features  

In Scriptorium, user stories follow these conventions:  
- **"As a user"** indicates features available only to authenticated users.  
- **"As a visitor"** refers to functionalities accessible to all users, regardless of authentication status.  
- **"As the system administrator"** describes features limited to users with admin privileges.  

> ⚠️ **Note:** The following feature list represents the full scope of the project. However, not all features will be implemented in the initial development phase. Keeping the complete vision in mind ensures a well-structured design from the start.  

---

### 🔐 User Accounts  

- Users can sign up, log in, log out, and edit their profiles.  
- Profile details include first name, last name, email, profile picture (avatar), and phone number.  
- Authentication is handled using JWT for secure login and session management.  

---

### 💻 Code Writing & Execution  

- Visitors can write code in multiple programming languages, including C, C++, Java, Python, and JavaScript.  
- Syntax highlighting is applied based on the selected programming language for better readability.  
- Visitors can execute their code and receive real-time output to verify correctness.  
- Input can be provided via standard input (stdin) before execution to test interactive programs.  
- If a program fails to compile or run, clear error messages are displayed, including compile errors, runtime issues, and execution timeouts.  

---

### 🔒 Secure Execution Environment  

- All code runs in an isolated environment to prevent interference with other users or the system.  
- Execution time and memory usage limits are enforced to prevent infinite loops or excessive resource consumption.  

---

### 📂 Code Templates  

- **Authenticated users** can save code snippets as templates with a title, description, and relevant tags.  
- Users can view, search, edit, and delete their saved templates.  
- Visitors can explore and modify existing templates, executing them directly on the platform.  
- If a visitor modifies a template, they can save it as a new version, marked as a fork of the original.  
- A search feature enables visitors to find templates by title, tags, or content.  

---

### 📝 Blog System  

- **Authenticated users** can create, edit, and delete blog posts. Each post includes a title, description, tags, and links to relevant code templates.  
- Visitors can browse blog posts and search by title, content, tags, or associated templates.  
- Blog posts linking to a code template provide direct navigation to the template page.  
- A template page displays a list of blog posts that reference it.  
- Users can engage with blog content by commenting, replying to comments, and rating posts through upvotes and downvotes.  
- Blog posts and comments can be sorted by rating, surfacing the most valuable discussions first.  

---

### 🚨 Reporting Inappropriate Content  

- Users can report inappropriate blog posts or comments, providing a reason for the report.  
- **System administrators** can view and sort reported content by the number of complaints.  
- Admins have the authority to hide content deemed inappropriate. Hidden content remains visible to the original author, marked with a flag indicating the report status, but cannot be edited.  

---

## 🚀 Getting Started  

### Prerequisites  
Ensure you have the following installed before setting up Scriptorium:  
- Node.js   
- Docker 

### Installation  

```sh
git clone https://github.com/paridhi26/Scriptorium.git
cd PP2/my-app
npm install
npm run dev 
