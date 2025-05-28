# PricePatrol

PricePatrol is a universal, modular price-watch service that lets you monitor product pages across multiple retailers and notifies you the moment prices hit your targets—or keeps pinging you as they continue to fall.

## 🚀 Key Features

- **Flexible Scheduling & Queues**  
  - BullMQ + Redis for high-performance, repeatable fetch jobs  
  - Cron-style orchestration (via BullMQ)  
- **Multi-Channel Notifications**  
  - Email (SendGrid / Postmark)  
  - SMS (Twilio)  
- **Scalable, Secure Back End**  
  - Node.js + Express.js API in TypeScript  
  - MongoDB Atlas (with Mongoose) for watches, adapters, and price history  
  - JWT-based authentication  
- **Modern Front End**  
  - React + TypeScript SPA with Redux Toolkit for data fetching and caching  
  - Responsive design with Bootstrap  
- **Adapter-based Scraping**  
  - Built-in adapters for major domains, plus a user-configurable CSS or XPath selector option  
