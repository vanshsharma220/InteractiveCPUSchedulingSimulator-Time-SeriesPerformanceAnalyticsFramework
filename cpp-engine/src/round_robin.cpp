
#include "scheduler_common.hpp"
#include <queue>

int main() {
    std::vector<Process> p;

    if (!readInput(p)) {
        std::cerr << "Invalid input\n";
        return 1;
    }
    int q;

    std::cout << "Time quantum: ";

    if (!(std::cin >> q) || q < 1) {
        std::cerr << "Quantum must be >= 1\n";
        return 1;
    }

    // Sort process indices by arrival time.
    std::vector<int> order(p.size());

    for (int i = 0; i < (int)p.size(); i++) {
        order[i] = i;
    }

    std::stable_sort(
        order.begin(),
        order.end(),
        [&](int a, int b) {
            return p[a].at < p[b].at;
        }
    );

    std::queue<int> ready;
    std::vector<Segment> t;

    int time = 0;
    int done = 0;
    int next = 0;

    while (done < (int)p.size()) {

        // If the ready queue is empty, advance to the next arrival.
        if (
            ready.empty() &&
            next < (int)order.size() &&
            time < p[order[next]].at
        ) {
            addSegment(
                t,
                "IDLE",
                time,
                p[order[next]].at
            );

            time = p[order[next]].at;
        }

        // Add all processes that have arrived.
        while (
            next < (int)order.size() &&
            p[order[next]].at <= time
        ) {
            ready.push(order[next++]);
        }

        if (ready.empty()) {
            continue;
        }

        // Select the process at the front of the queue.
        int i = ready.front();
        ready.pop();

        auto& x = p[i];

        // Record the first execution time.
        if (x.first < 0) {
            x.first = time;
        }

        // Execute for the smaller of quantum or remaining time.
        int run = std::min(q, x.remaining);

        addSegment(
            t,
            x.pid,
            time,
            time + run
        );

        time += run;
        x.remaining -= run;

        // Add newly arrived processes to the ready queue.
        while (
            next < (int)order.size() &&
            p[order[next]].at <= time
        ) {
            ready.push(order[next++]);
        }

        // Requeue the process if it still has work remaining.
        if (x.remaining) {
            ready.push(i);
        } else {
            x.ct = time;
            done++;
        }
    }

    printResult(p, t);
}
