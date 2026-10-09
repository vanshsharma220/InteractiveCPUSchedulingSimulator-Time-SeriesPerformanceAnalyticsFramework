#include <iostream>
#include <vector>
#include <string>

using namespace std;

struct Process {
    int pid;
    int at;
    int bt;
    int priority;
    int rt;
    int firststarttime;
    bool started;
};

struct ScheduleResult {
    int pid;
    int ct;
    int tat;
    int wt;
    int rt;
};

struct GanttEntry {
    int pid;
    int startTime;
    int endTime;
};

struct SimulationResult {
    string algorithm;
    vector<ScheduleResult> processes;
    vector<GanttEntry> gantt;
    double averageWaitingTime;
    double averageTurnaroundTime;
    double averageResponseTime;
};