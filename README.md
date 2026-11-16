#  AttendIQ – Smart Attendance Predictor

<p align="center">
  <strong>Track Smart. Predict Ahead. Stay Prepared.</strong>
</p>

<p align="center">
  A student-focused attendance management and prediction system designed to make attendance tracking easier, faster, and smarter.
</p>

---

##  About the Project

**AttendIQ** is a Student Attendance Management and Prediction System developed as an individual academic project for the course **CSE 202 – Object-Oriented Programming with C++** at SRM University-AP.

The main purpose of AttendIQ is to help students monitor their subject-wise attendance, calculate attendance percentages, and predict their future attendance based on upcoming classes.

Instead of performing calculations manually, students can use AttendIQ to understand their current attendance status, determine how many additional classes they need to attend to reach the 75% requirement, and estimate how many classes they can miss while maintaining the required percentage.

The project also includes local data storage to maintain attendance records for future use.

---

##  Problem Statement

Students often face difficulties managing attendance across multiple subjects.

Some common problems include:

- Manually calculating attendance percentages.
- Keeping track of attendance in different subjects.
- Understanding how many classes are needed to reach 75%.
- Estimating how many classes can be missed.
- Maintaining attendance records over time.

AttendIQ aims to provide a simple solution to these problems through automated calculations and attendance prediction.

---

##  Key Features

| Feature | Description |
|---|---|
|  Subject Management | Maintain attendance records for multiple subjects. |
|  Automatic Calculation | Calculate attendance percentages instantly. |
|  Attendance Prediction | Estimate future attendance based on upcoming classes. |
|  75% Target Calculator | Calculate additional classes required to reach 75%. |
|  Missed Class Estimator | Estimate how many classes can be missed while maintaining 75%. |
|  Data Storage | Save and retrieve attendance records using file handling. |
|  Input Validation | Prevent invalid attendance entries. |
|  Overall Summary | View attendance information across subjects. |

---

##  Attendance Calculation Logic

AttendIQ uses mathematical formulas to calculate and predict attendance.

### 1. Current Attendance

Attendance (%) = (Classes Attended / Total Classes) × 100

### 2. Predicted Attendance

Predicted (%) = ((A + P) / (T + U)) × 100
Where:

- A = Classes already attended
- P = Upcoming classes planned to attend
- T = Total classes conducted
- U = Total upcoming classes

### 3. Classes Required to Reach 75%

When current attendance is below 75%:

Classes Required = (3 × T) - (4 × A)

Where:

- N = Additional classes required
- T = Total classes conducted
- A = Classes attended

### Example

Suppose a student has attended 25 out of 40 classes.

Current attendance:

Classes Required = (3 × 40) - (4 × 25)

Classes Required = 120 - 100

Result: 20 additional consecutive classes.

Therefore, the student needs to attend **20 consecutive classes** to reach 75%.

---

##  Technology Stack

### Core Application

- **Programming Language:** C++
- **Compiler:** MinGW / GCC
- **Code Editor:** Visual Studio Code
- **Data Storage:** Local text file
- **File Handling:** C++ `fstream` library

### Frontend Prototype

- React
- TypeScript
- Vite
- Tailwind CSS

The frontend is being developed separately as a user-interface prototype. Direct integration with the C++ application is planned as a future improvement.

---

##  How It Works

The basic workflow of AttendIQ is:

1. User enters subject details.
2. The system validates the attendance information.
3. Attendance percentage is calculated.
4. Prediction logic estimates future attendance.
5. The system displays classes required or available to miss.
6. Attendance records are saved locally for future sessions.

---

##  Getting Started

### Requirements

Make sure you have the following installed:

- Windows 10 / Windows 11 or another supported operating system.
- Visual Studio Code or another C++ editor.
- MinGW / GCC C++ compiler.
- Node.js and npm (for the frontend prototype).

### Running the C++ Application

1. Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

2. Open the project folder in Visual Studio Code.

3. Compile the C++ source file:

```bash
g++ main.cpp -o attendiq
```

4. Run the application on Windows:

```bash
attendiq.exe
```

**Note:** Replace `main.cpp` with the actual name of your C++ source file if it is different.

### Running the Frontend Prototype

Navigate to the frontend project directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

**Note:** These commands assume your frontend uses the standard Vite npm scripts.

---

##  Future Scope

AttendIQ can be improved further with the following features:

- Integration with the official university attendance portal through authorized access.
- Complete connection between the C++ application and web frontend.
- Student login and authentication.
- Automated attendance updates.
- Downloadable PDF attendance reports.
- Attendance notifications and reminders.
- Mobile application support.

---

##  Academic Information

| Details | Information |
|---|---|
| Project Name | AttendIQ – Smart Attendance Predictor |
| Student | Utkarsh Nayan |
| Registration Number | AP25110080089 |
| Course | CSE 202 – Object-Oriented Programming with C++ |
| Department | Computer Science and Engineering |
| University | SRM University-AP |
| Faculty Mentor | Dr. Rashmi Rathi Upadhyay |
| Project Type | Individual Academic Project |

---

##  Author

**Utkarsh Nayan**

B.Tech – Computer Science and Engineering  
SRM University-AP

---

<p align="center">
  <strong>AttendIQ – Track Smart. Predict Ahead. Stay Prepared.</strong>
</p>

<p align="center">
  Made with  as an academic project.
</p>
