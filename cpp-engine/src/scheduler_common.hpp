
#pragma once

#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Process {
    std::string pid;
    int at = 0;
    int bt = 1;
    int priority = 1;
    int remaining = 1;
    int ct = 0;
    int first = -1;
};

struct Segment {
    std::string pid;
    int start = 0;
    int end = 0;
};

inline bool readInput(std::vector<Process>& p) {
    int n;

    std::cout << "Number of processes (1-100): ";

    if (!(std::cin >> n) || n < 1 || n > 100) {
        return false;
    }

    p.resize(n);

    for (int i = 0; i < n; i++) {
        auto& x = p[i];

        x.pid = "P" + std::to_string(i + 1);

        std::cout << x.pid << " arrival burst priority: ";

        if (
            !(std::cin >> x.at >> x.bt >> x.priority) ||
            x.at < 0 ||
            x.bt < 1
        ) {
            return false;
        }

        x.remaining = x.bt;
    }

    return true;
}

inline void addSegment(
    std::vector<Segment>& t,
    const std::string& pid,
    int start,
    int end
) {
    if (end <= start) {
        return;
    }

    if (
        !t.empty() &&
        t.back().pid == pid &&
        t.back().end == start
    ) {
        t.back().end = end;
    } else {
        t.push_back({pid, start, end});
    }
}

inline void printResult(
    const std::vector<Process>& p,
    const std::vector<Segment>& t
) {
    std::cout << "\nTimeline:\n";

    for (auto& s : t) {
        std::cout << "["
                  << s.start << "-"
                  << s.end << " "
                  << s.pid << "] ";
    }

    std::cout << "\n\nPID\tAT\tBT\tPriority\tCT\tTAT\tWT\n";

    double sw = 0;
    double st = 0;

    for (auto& x : p) {
        int tat = x.ct - x.at;
        int wt = tat - x.bt;

        sw += wt;
        st += tat;

        std::cout << x.pid << '\t'
                  << x.at << '\t'
                  << x.bt << '\t'
                  << x.priority << '\t'
                  << x.ct << '\t'
                  << tat << '\t'
                  << wt << '\n';
    }

    std::cout << "Average waiting: "
              << sw / p.size() << "\n";

    std::cout << "Average turnaround: "
              << st / p.size() << "\n";
}
