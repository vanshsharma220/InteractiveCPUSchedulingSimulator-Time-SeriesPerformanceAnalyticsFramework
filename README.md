
# Interactive CPU Scheduling Simulator – Time-Series Performance Analytics Framework

## 📌 Project Summary

The **Interactive CPU Scheduling Simulator – Time-Series Performance Analytics Framework** is designed to simulate CPU scheduling algorithms, calculate process performance metrics, and provide an interactive interface for exploring scheduling results.

The project consists of three main components: **Backend, DBMS, and Frontend**.

### 1. Backend

The backend implements the core logic for CPU scheduling algorithms:

- **FCFS (First Come, First Served)**
- **SJF (Shortest Job First)**
- **Round Robin (RR)**
- **Priority Scheduling**

It calculates important scheduling metrics, including completion time, turnaround time, waiting time, and response time.

### 2. DBMS

The DBMS component uses **MySQL** to handle database operations, including storing, retrieving, and managing data related to the project.

### 3. Frontend

The frontend provides the user interface and is built using:

- **HTML** – Structures the web pages.
- **CSS** – Styles the interface and layout.
- **JavaScript** – Handles user interactions and frontend functionality.

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Backend | C++ |
| Database | MySQL |
| Frontend | HTML, CSS, JavaScript |

## 📂 Project Structure

```text
InteractiveCPUSchedulingSimulator-Time-SeriesPerformanceAnalyticsFramework/
├── backend/       # CPU scheduling algorithms and core logic
├── dbms/          # MySQL database operations
├── frontend/      # HTML, CSS, and JavaScript files
└── README.md      # Project documentation
```

## ✨ Key Features

- Simulation of multiple CPU scheduling algorithms.
- Calculation of completion time, turnaround time, waiting time, and response time.
- Interactive interface for entering process details and viewing scheduling results.
- MySQL database integration for data management.
- Performance analysis of CPU scheduling algorithms.

## ⚙️ Scheduling Algorithms

| Algorithm | Description |
|---|---|
| FCFS | Executes processes in order of arrival time. |
| SJF | Selects the available process with the shortest burst time. |
| Round Robin | Allocates CPU time to processes using a fixed time quantum. |
| Priority Scheduling | Selects an available process based on its priority. |

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- A C++ compiler
- MySQL Server
- A modern web browser
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vanshsharma220/InteractiveCPUSchedulingSimulator-Time-SeriesPerformanceAnalyticsFramework.git
   ```

2. Navigate to the project directory:

   ```bash
   cd InteractiveCPUSchedulingSimulator-Time-SeriesPerformanceAnalyticsFramework
   ```

3. Follow the setup instructions in the `backend/`, `dbms/`, and `frontend/` directories, according to their implementation.

## 🔮 Future Improvements

- Add support for additional CPU scheduling algorithms.
- Introduce time-series visualizations for performance comparisons.
- Improve simulation history storage and retrieval.
- Expand performance analytics and reporting features.

## 👨‍💻 Authors

- **Vansh Sharma**
- **Himansh**
- **Nikhil**

## 📄 License

No license has been specified yet.
