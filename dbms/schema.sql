
CREATE DATABASE IF NOT EXISTS algovis_db;

USE algovis_db;

-- 1. Stores each simulation run
CREATE TABLE IF NOT EXISTS simulations
(
    simulation_id INT AUTO_INCREMENT PRIMARY KEY,
    algorithm VARCHAR(30) NOT NULL,
    quantum INT DEFAULT NULL,
    process_count INT NOT NULL,
    avg_waiting_time DECIMAL(10,2) DEFAULT 0,
    avg_turnaround_time DECIMAL(10,2) DEFAULT 0,
    avg_response_time DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Stores original user inputs
CREATE TABLE IF NOT EXISTS process_inputs
(
    input_id INT AUTO_INCREMENT PRIMARY KEY,
    simulation_id INT NOT NULL,
    pid INT NOT NULL,
    arrival_time INT NOT NULL,
    burst_time INT NOT NULL,
    priority_value INT DEFAULT 0,

    FOREIGN KEY (simulation_id)
        REFERENCES simulations(simulation_id)
        ON DELETE CASCADE
);

-- 3. Stores calculated scheduling metrics
CREATE TABLE IF NOT EXISTS process_results
(
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    simulation_id INT NOT NULL,
    pid INT NOT NULL,
    completion_time INT NOT NULL,
    turnaround_time INT NOT NULL,
    waiting_time INT NOT NULL,
    response_time INT NOT NULL,

    FOREIGN KEY (simulation_id)
        REFERENCES simulations(simulation_id)
        ON DELETE CASCADE
);

-- 4. Stores Gantt chart execution intervals
CREATE TABLE IF NOT EXISTS gantt_entries
(
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    simulation_id INT NOT NULL,
    pid INT NOT NULL,
    start_time INT NOT NULL,
    end_time INT NOT NULL,

    FOREIGN KEY (simulation_id)
        REFERENCES simulations(simulation_id)
        ON DELETE CASCADE
);

SHOW TABLES;
