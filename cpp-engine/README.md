# Optional C++ scheduling reference engine

The browser application uses the Node.js scheduler modules in `server/src/schedulers/` as its live API source; the animation is drawn from that API timeline. The C++ files here are independent, runnable reference implementations for coursework and comparison, not a runtime dependency of the Node server.

Requires a C++17 compiler (for example, MinGW-w64 g++ or MSYS2 UCRT64 g++). Open a terminal in `cpp-engine` and compile one algorithm at a time:

```powershell
g++ -std=c++17 src/fcfs.cpp -o fcfs.exe
.\fcfs.exe
```
Replace `fcfs.cpp` / `fcfs.exe` with `sjf`, `srtf`, `priority_np`, `priority_p`, or `round_robin`. Enter process arrival, burst, and priority values when prompted. Round Robin additionally asks for a time quantum. Smaller numeric priority means higher priority. These reference files are separate from the Node API; the web app currently uses the JavaScript backend to ensure the animation and metrics are driven by the same result.
