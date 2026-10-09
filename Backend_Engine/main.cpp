#include <iostream>
#include <string>
#include <vector>
#include <regex>
#include <sstream>
#include <iomanip>

using namespace std;

#include "models.cpp"
#include "scheduling_algorithms.cpp"
#include "process_manager.cpp"


string extractString(
    const string& json,
    const string& key)
{
    string pattern =
        "\"" + key + "\"\\s*:\\s*\"([^\"]*)\"";

    regex re(pattern);
    smatch match;

    if (regex_search(json, match, re))
    {
        return match[1];
    }

    return "";
}


int extractInt(
    const string& json,
    const string& key,
    int defaultValue = 0)
{
    string pattern =
        "\"" + key + "\"\\s*:\\s*(-?[0-9]+)";

    regex re(pattern);
    smatch match;

    if (regex_search(json, match, re))
    {
        return stoi(match[1]);
    }

    return defaultValue;
}


vector<Process> extractProcesses(
    const string& json)
{
    vector<Process> processes;

    size_t processesPosition =
        json.find("\"processes\"");

    if (processesPosition == string::npos)
        return processes;

    size_t arrayStart =
        json.find("[", processesPosition);

    size_t arrayEnd =
        json.find("]", arrayStart);

    if (arrayStart == string::npos ||
        arrayEnd == string::npos)
    {
        return processes;
    }

    string processArray =
        json.substr(
            arrayStart,
            arrayEnd - arrayStart + 1
        );

    regex objectRegex("\\{([^{}]*)\\}");

    auto begin =
        sregex_iterator(
            processArray.begin(),
            processArray.end(),
            objectRegex
        );

    auto end =
        sregex_iterator();

    for (auto iterator = begin;
         iterator != end;
         ++iterator)
    {
        string object =
            (*iterator)[1];

        Process process;

        process.pid =
            extractInt(object, "pid");

        process.arrivalTime =
            extractInt(object, "arrivalTime");

        process.burstTime =
            extractInt(object, "burstTime");

        process.priority =
            extractInt(object, "priority");

        process.remainingTime =
            process.burstTime;

        process.firstStartTime = -1;
        process.started = false;

        processes.push_back(process);
    }

    return processes;
}


string jsonNumber(double value)
{
    ostringstream output;

    output << fixed
           << setprecision(2)
           << value;

    return output.str();
}


string createJSON(
    const SimulationResult& result)
{
    ostringstream output;

    output << "{";

    output << "\"algorithm\":\""
           << result.algorithm
           << "\",";

    output << "\"processes\":[";

    for (size_t i = 0;
         i < result.processes.size();
         i++)
    {
        const ScheduleResult& process =
            result.processes[i];

        output << "{";

        output << "\"pid\":"
               << process.pid
               << ",";

        output << "\"completionTime\":"
               << process.completionTime
               << ",";

        output << "\"turnaroundTime\":"
               << process.turnaroundTime
               << ",";

        output << "\"waitingTime\":"
               << process.waitingTime
               << ",";

        output << "\"responseTime\":"
               << process.responseTime;

        output << "}";

        if (i + 1 <
            result.processes.size())
        {
            output << ",";
        }
    }

    output << "],";

    output << "\"gantt\":[";

    for (size_t i = 0;
         i < result.gantt.size();
         i++)
    {
        const GanttEntry& entry =
            result.gantt[i];

        output << "{";

        output << "\"pid\":"
               << entry.pid
               << ",";

        output << "\"startTime\":"
               << entry.startTime
               << ",";

        output << "\"endTime\":"
               << entry.endTime;

        output << "}";

        if (i + 1 <
            result.gantt.size())
        {
            output << ",";
        }
    }

    output << "],";

    output << "\"averageWaitingTime\":"
           << jsonNumber(
                result.averageWaitingTime)
           << ",";

    output << "\"averageTurnaroundTime\":"
           << jsonNumber(
                result.averageTurnaroundTime)
           << ",";

    output << "\"averageResponseTime\":"
           << jsonNumber(
                result.averageResponseTime);

    output << "}";

    return output.str();
}


int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string input;
    string line;

    while (getline(cin, line))
    {
        input += line;
    }

    if (input.empty())
    {
        cout << "{"
             << "\"error\":\"No input received\""
             << "}";

        return 1;
    }

    string algorithm =
        extractString(input, "algorithm");

    int quantum =
        extractInt(input, "quantum", 2);

    vector<Process> processes =
        extractProcesses(input);

    if (algorithm.empty())
    {
        cout << "{"
             << "\"error\":\"Algorithm not specified\""
             << "}";

        return 1;
    }

    if (processes.empty())
    {
        cout << "{"
             << "\"error\":\"No processes received\""
             << "}";

        return 1;
    }

    ProcessManager manager;

    SimulationResult result =
        manager.run(
            processes,
            algorithm,
            quantum
        );

    cout << createJSON(result);

    return 0;
}