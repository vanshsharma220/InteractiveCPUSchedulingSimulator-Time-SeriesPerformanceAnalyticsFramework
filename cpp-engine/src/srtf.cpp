
#include "scheduler_common.hpp"

int main() {
    std::vector<Process> p;

    if (!readInput(p)) {
        std::cerr << "Invalid input\n";
        return 1;
    }
    std::vector<Segment> t;

    int time = 0;
    int done = 0;

    while (done < (int)p.size()) {
        int k = -1;

        // Find the process with the shortest remaining time
        // among processes that have already arrived.
        for (int i = 0; i < (int)p.size(); i++) {
            if (
                p[i].remaining > 0 &&
                p[i].at <= time &&
                (k < 0 || p[i].remaining < p[k].remaining)
            ) {
                k = i;
            }
        }

        // If no process is available, CPU remains idle.
        if (k < 0) {
            int next = 1e9;

            for (auto& x : p) {
                if (x.remaining) {
                    next = std::min(next, x.at);
                }
            }

            addSegment(t, "IDLE", time, next);
            time = next;

            continue;
        }

        auto& x = p[k];

        // Record the first time the process starts executing.
        if (x.first < 0) {
            x.first = time;
        }

        // Execute the selected process for one time unit.
        addSegment(t, x.pid, time, time + 1);

        x.remaining--;
        time++;

        // If the process has finished execution, record completion.
        if (!x.remaining) {
            x.ct = time;
            done++;
        }
    }

    printResult(p, t);
}
