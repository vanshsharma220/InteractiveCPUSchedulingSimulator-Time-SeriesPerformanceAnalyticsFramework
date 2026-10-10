
#include "scheduler_common.hpp"

int main() {
    std::vector<Process> p;

    if (!readInput(p)) {
        std::cerr << "Invalid input\n";
        return 1;
    }
    // Sorting processes by arrival time .
    std::stable_sort(
        p.begin(),
        p.end(),
        [](auto& a, auto& b) {
            return a.at < b.at;
        }
    );
    std::vector<Segment> t;

    int time = 0;

    for (auto& x : p) {

        // If the process arrives later into cpu, CPU remains idle.
        if (time < x.at) {
            addSegment(t, "IDLE", time, x.at);
            time = x.at;
        }

        // Record the process start time.
        x.first = time;

        // Execute the process until completion.
        addSegment(t, x.pid, time, time + x.bt);

        time += x.bt;
        x.ct = time;
    }

    printResult(p, t);
}
