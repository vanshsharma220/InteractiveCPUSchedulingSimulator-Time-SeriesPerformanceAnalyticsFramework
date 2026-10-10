#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <climits>
#include "models.cpp"

using namespace std;
#include "models.cpp"

SimulationResult calculateFCFS(vector<Process> processes)
{
    SimulationResult result;
    result.algorithm = "FCFS";

    sort(processes.begin(), processes.end(),
        [](const Process& a, const Process& b)
        {
            if (a.at!=b.at)
                return a.at < b.at;
            return a.pid < b.pid;
        });
    int currentTime = 0;
    double totalWT = 0;//Total Waiting time
    double totalTAT = 0;//Total turnaround time
    double totalRT = 0;//Total response time

    for (auto& process : processes)
    {
        if (currentTime<process.at)
            currentTime=process.at;
        int startTime = currentTime;
        int responseTime = startTime-process.at;
        currentTime += process.bt;
        int completionTime = currentTime;
        int turnaroundTime = completionTime - process.at;
        int waitingTime = turnaroundTime-process.bt;

        ScheduleResult sd;

        sd.pid = process.pid;
        sd.ct = completionTime;
        sd.tat = turnaroundTime;
        sd.wt = waitingTime;
        sd.rpt = responseTime;

        result.processes.push_back(sd);//Each process calculation are returned to caller

        GanttEntry gantt;

        gantt.pid = process.pid;
        gantt.startTime = startTime;
        gantt.endTime = completionTime;
        result.gantt.push_back(gantt);//Each process timeline recorded

        totalWT += waitingTime;
        totalTAT += turnaroundTime;
        totalRT += responseTime;
    }

    int count = processes.size();

    if (count > 0)
    {
        result.averageWaitingTime = totalWT / count;
        result.averageTurnaroundTime = totalTAT / count;
        result.averageResponseTime = totalRT / count;
    }

    return result;
}


SimulationResult calculateSJF(vector<Process> processes)
{
    SimulationResult result;
    result.algorithm = "SJF";
    int n = processes.size();
    int completed = 0;
    int currentTime = 0;
    vector<bool> done(n, false);
    double totalWT = 0;
    double totalTAT = 0;
    double totalRT = 0;

    while (completed < n)
    {
        int selected = -1;
        for (int i = 0; i < n; i++){
            if (done[i])
                continue;
            if (processes[i].at>currentTime)
                continue;
            if (selected == -1)
            {
                selected = i;
                continue;
            }
            if (processes[i].bt<processes[selected].bt)
            {
                selected = i;
            }
            else if (
                processes[i].bt == processes[selected].bt)
            {
                if (processes[i].at < processes[selected].at)
                {
                    selected = i;
                }
                else if (
                    processes[i].at == processes[selected].at && processes[i].pid < processes[selected].pid)
                {
                    selected = i;
                }
            }
        }
        if (selected == -1)
        {
            int nextArrival = INT_MAX;
            for (int i = 0; i < n; i++)
            {
                if (!done[i] && processes[i].at < nextArrival)
                {
                    nextArrival = processes[i].at;
                }
            }
            currentTime = nextArrival;
            continue;
        }
        Process& process = processes[selected];
        int startTime = currentTime;
        int responseTime = startTime-process.at;
        currentTime += process.bt;
        int completionTime = currentTime;
        int turnaroundTime = completionTime-process.at;
        int waitingTime = turnaroundTime-process.bt;

        ScheduleResult sd;

        sd.pid = process.pid;
        sd.ct = completionTime;
        sd.tat = turnaroundTime;
        sd.wt = waitingTime;
        sd.rpt = responseTime;
        result.processes.push_back(sd);

        GanttEntry gantt;

        gantt.pid = process.pid;
        gantt.startTime = startTime;
        gantt.endTime = completionTime;
        result.gantt.push_back(gantt);

        totalWT += waitingTime;
        totalTAT += turnaroundTime;
        totalRT += responseTime;

        done[selected] = true;
        completed++;
    }

    if (n > 0)
    {
        result.averageWaitingTime = totalWT / n;
        result.averageTurnaroundTime = totalTAT / n;
        result.averageResponseTime = totalRT / n;
    }

    return result;
}


SimulationResult calculatePriority(vector<Process> processes)
{
    SimulationResult result;
    result.algorithm = "Priority";
    int n = processes.size();
    int completed = 0;
    int currentTime = 0;
    vector<bool> done(n, false);
    double totalWT = 0;
    double totalTAT = 0;
    double totalRT = 0;
    while (completed < n)
    {
        int selected = -1;
        for (int i = 0; i < n; i++)
        {
            if (done[i])
                continue;
            if (processes[i].at > currentTime)
                continue;
            if (selected == -1)
            {
                selected = i;
                continue;
            }
            if (processes[i].priority < processes[selected].priority)
            {
                selected = i;
            }
            else if (processes[i].priority == processes[selected].priority)
            {
                if (processes[i].at <
                    processes[selected].at)
                {
                    selected = i;
                }
                else if (
                    processes[i].at == processes[selected].at && processes[i].pid < processes[selected].pid)
                {
                    selected = i;
                }
            }
        }
        if (selected == -1)
        {
            int nextArrival = INT_MAX;
            for (int i = 0; i < n; i++)
            {
                if (!done[i] && processes[i].at < nextArrival)
                {
                    nextArrival = processes[i].at;
                }
            }
            currentTime = nextArrival;
            continue;
        }
        Process& process = processes[selected];
        int startTime = currentTime;
        int responseTime = startTime-process.at;
        currentTime += process.bt;
        int completionTime = currentTime;
        int turnaroundTime = completionTime-process.at;
        int waitingTime = turnaroundTime-process.bt;

        ScheduleResult sd;

        sd.pid = process.pid;
        sd.ct = completionTime;
        sd.tat = turnaroundTime;
        sd.wt = waitingTime;
        sd.rpt = responseTime;
        result.processes.push_back(sd);

        GanttEntry gantt;

        gantt.pid = process.pid;
        gantt.startTime = startTime;
        gantt.endTime = completionTime;
        result.gantt.push_back(gantt);

        totalWT += waitingTime;
        totalTAT += turnaroundTime;
        totalRT += responseTime;

        done[selected] = true;
        completed++;
    }

    if (n > 0)
    {
        result.averageWaitingTime = totalWT / n;
        result.averageTurnaroundTime = totalTAT / n;
        result.averageResponseTime = totalRT / n;
    }
    return result;
}


SimulationResult calculateRoundRobin(vector<Process> processes,int quantum){
    SimulationResult result;
    result.algorithm = "Round Robin";
    int n = processes.size();
    if (n==0||quantum<=0)
    {
        result.averageWaitingTime = 0;
        result.averageTurnaroundTime = 0;
        result.averageResponseTime = 0;
        return result;
    }
    sort(processes.begin(), processes.end(),[](const Process& a, const Process& b)
        {
            if (a.at != b.at)
                return a.at < b.at;
            return a.pid < b.pid;
        });
    for (auto& process : processes)
    {
        process.rt = process.bt;
        process.firststarttime = -1;
        process.started = false;
    }
    queue<int> readyQueue;
    int currentTime = 0;
    int nextProcess = 0;
    int completed = 0;
    vector<int> completionTime(n, 0);
    vector<int> responseTime(n, 0);
    double totalWT = 0;
    double totalTAT = 0;
    double totalRT = 0;

    currentTime = processes[0].at;
    while (completed < n)
    {
        while (nextProcess < n && processes[nextProcess].at <= currentTime)
        {
            readyQueue.push(nextProcess);
            nextProcess++;
        }
        if (readyQueue.empty())
        {
            if (nextProcess < n)
            {
                currentTime =
                    processes[nextProcess].at;
                continue;
            }
        }
        int index = readyQueue.front();
        readyQueue.pop();
        Process& process = processes[index];
        if (!process.started)
        {
            process.started = true;
            process.firststarttime = currentTime;
            responseTime[index] = currentTime - process.at;
        }
        int startTime = currentTime;
        int executionTime = min(quantum, process.rt);
        currentTime += executionTime;
        process.rt -= executionTime;

        GanttEntry gantt;
        gantt.pid = process.pid;
        gantt.startTime = startTime;
        gantt.endTime = currentTime;
        result.gantt.push_back(gantt);
        
        while (nextProcess < n && processes[nextProcess].at <= currentTime)
        {
            readyQueue.push(nextProcess);
            nextProcess++;
        }
        if (process.rt > 0)
        {
            readyQueue.push(index);
        }
        else
        {
            completionTime[index] = currentTime;
            completed++;
        }
    }
    for (int i = 0; i < n; i++)
    {
        int turnaroundTime = completionTime[i]-processes[i].at;
        int waitingTime =turnaroundTime - processes[i].bt;

        ScheduleResult sd;

        sd.pid = processes[i].pid;
        sd.ct = completionTime[i];
        sd.tat = turnaroundTime;
        sd.wt = waitingTime;
        sd.rpt = responseTime[i];
        result.processes.push_back(sd);

        totalWT += waitingTime;
        totalTAT += turnaroundTime;
        totalRT += responseTime[i];
    }
    if (n > 0)
    {
        result.averageWaitingTime = totalWT / n;
        result.averageTurnaroundTime = totalTAT / n;
        result.averageResponseTime = totalRT / n;
    }
    sort(result.processes.begin(),result.processes.end(),[](const ScheduleResult& a,const ScheduleResult& b)
        {
            return a.pid < b.pid;
        });
    return result;
}