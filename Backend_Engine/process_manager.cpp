#include <iostream>
#include <vector>
#include <string>

using namespace std;

class ProcessManager
{
public:

    SimulationResult run(vector<Process> processes,string algo,int quantum){
        if (algo=="FCFS")
        {
            return calculateFCFS(processes);
        }

        if (algo=="SJF")
        {
            return calculateSJF(processes);
        }

        if (algo=="Priority")
        {
            return calculatePriority(processes);
        }

        if (algo=="RR"||algo =="Round Robin")
        {
            return calculateRoundRobin(processes,quantum);
        }

        SimulationResult errorResult;

        errorResult.algorithm = "ERROR";
        errorResult.averageWaitingTime = 0;
        errorResult.averageTurnaroundTime = 0;
        errorResult.averageResponseTime = 0;

        return errorResult;
    }
};