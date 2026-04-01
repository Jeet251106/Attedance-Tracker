# Offline Attendance Tracker

A stunning, blazing-fast, and completely offline Mobile Web Application for tracking your daily college attendance based on the provided timetable. This app has recently been significantly upgraded with an **AI Timetable Extractor** and a powerful **Manual Editor**!

## Features
- **100% Offline Capable**: Works purely in your browser without requiring an internet connection once loaded.
- **Progressive Web App (Android & iOS)**: Can be seamlessly installed to your home screen behaving exactly like a native app.
- **AI Timetable Extractor**: Securely convert an image or screenshot of your class schedule directly into an interactive timetable using Google Gemini!
- **Interactive Timetable Editor**: Easily manage, add, or delete specific lectures or lab sessions directly from your phone.
- **Custom Labs by Batches**: Select your college Batch (C1, C2, C3, C4) in Settings to automatically map lab subjects correctly.
- **Holiday Toggle**: Mark entire days as off without ruining your overall metrics.
- **Auto Percentage Calculations**: Separately tracks total attendance, theoretical subject percentages, and practical lab percentages month-by-month.
- **Deep Privacy & Data Protection**: Zero tracking. Everything is saved safely in your device's LocalBrowser Storage. Import and Export backups anytime.

## Folder Structure
- `/` (Root Folder): Contains the basic `index.html`, `styles.css`, and `app.js` perfect for quick testing on desktop.
- `/application`: The production folder containing the fully updated core files along with the Service Worker (`sw.js`) and `manifest.json`. **This is the folder you deploy to get a native Android app experience!**

## Step-by-Step Guide to Run

### Option 1: Quick Trying on PC / Laptop
1. Open the main folder on your computer.
2. Double-click the root `index.html` file. 
3. It will open in your default browser instantly. The UI scales beautifully for desktop but locks to a sleek mobile profile.

### Option 2: Installing as a Native App on your Android Phone
To use the app completely offline on your phone, you should host the `/application` folder to a free URL so your phone can install the Progressive Web App (PWA). **GitHub Pages** is the recommended method:

1. Log into your GitHub account and create a new repository (e.g., `attendance-tracker`).
2. Upload exactly the files from the `/application` folder into the root of that new repository:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `sw.js`
   - `manifest.json`
3. In your GitHub repository, go to **Settings** -> **Pages**.
4. Set the Source to the `main` or `master` branch and hit **Save**. Wait a few minutes until GitHub gives you a live URL.
5. Open that live URL on your Android phone using **Google Chrome**.
6. Chrome will trigger a popup banner strictly asking **"Install App"**. 
7. Click Install! The app is now downloaded securely onto your phone. You can find it exactly like any other app in your app drawer. 
8. You can now use it perfectly seamlessly with Airplane Mode toggled on!

Enjoy tracking your attendance effortlessly!
