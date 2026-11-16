#include <iostream>
#include <fstream>
#include <string>
#include <iomanip>
#include <limits>
using namespace std;

const int MAX = 10;
const int TARGET = 75;

struct Subject {
    string name;
    int total, attended;
};

double percent(int attended, int total) {
    if (total <= 0) return 0.0;
    return 100.0 * attended / total;
}

bool readInt(string prompt, int &value) {
    while (true) {
        cout << prompt;
        if (cin >> value) return true;

        if (cin.eof()) return false;

        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        cout << "Invalid input! Enter a whole number.\n";
    }
}

void saveData(Subject s[], int n) {
    ofstream file("attendance.txt");

    if (!file) {
        cout << "Error: Could not save data!\n";
        return;
    }

    file << n << '\n';

    for (int i = 0; i < n; i++) {
        file << s[i].name << '\n'
             << s[i].total << '\n'
             << s[i].attended << '\n';
    }

    if (!file)
        cout << "Warning: Data could not be fully saved.\n";
}

void loadData(Subject s[], int &n) {
    ifstream file("attendance.txt");
    if (!file) return;

    int count;
    if (!(file >> count) || count < 0 || count > MAX)
        return;

    file.ignore(numeric_limits<streamsize>::max(), '\n');

    Subject temp[MAX];

    for (int i = 0; i < count; i++) {
        if (!getline(file, temp[i].name) ||
            !(file >> temp[i].total >> temp[i].attended) ||
            temp[i].name.empty() ||
            temp[i].total < 0 ||
            temp[i].attended < 0 ||
            temp[i].attended > temp[i].total) {
            cout << "Warning: Saved data is invalid.\n";
            return;
        }

        file.ignore(numeric_limits<streamsize>::max(), '\n');
    }

    for (int i = 0; i < count; i++)
        s[i] = temp[i];

    n = count;
}

void showSubjects(Subject s[], int n) {
    for (int i = 0; i < n; i++) {
        cout << i + 1 << ". " << s[i].name
             << " (" << s[i].attended
             << "/" << s[i].total << ")\n";
    }
}

int main() {
    Subject s[MAX];
    int n = 0, ch;

    loadData(s, n);

    cout << fixed << setprecision(2);
    cout << "\n========== ATTENDIQ ==========\n";
    cout << n << " saved subject(s) loaded.\n";

    while (true) {
        cout << "\n1. Add Subject\n";
        cout << "2. View Attendance\n";
        cout << "3. Predict Attendance\n";
        cout << "4. Classes Needed for 75%\n";
        cout << "5. Classes You Can Miss\n";
        cout << "6. Overall Report\n";
        cout << "7. Exit\n";

        if (!readInt("Enter choice: ", ch)) break;

        if (ch == 1) {
            if (n >= MAX) {
                cout << "Maximum 10 subjects reached!\n";
                continue;
            }

            Subject x;

            cout << "Subject name: ";
            if (!getline(cin >> ws, x.name)) break;

            if (x.name.empty()) {
                cout << "Name cannot be empty!\n";
                continue;
            }

            if (!readInt("Total classes: ", x.total)) break;
            if (!readInt("Classes attended: ", x.attended)) break;

            if (x.total < 0 || x.attended < 0 ||
                x.attended > x.total) {
                cout << "Invalid attendance data!\n";
                continue;
            }

            s[n++] = x;
            saveData(s, n);
            cout << "Subject added and saved!\n";
        }

        else if (ch >= 2 && ch <= 5) {
            if (n == 0) {
                cout << "Please add a subject first!\n";
                continue;
            }

            showSubjects(s, n);

            int k;
            if (!readInt("Select subject number: ", k)) break;

            if (k < 1 || k > n) {
                cout << "Invalid subject number!\n";
                continue;
            }

            int a = s[k - 1].attended;
            int t = s[k - 1].total;

            if (ch == 2) {
                cout << "Current attendance: "
                     << percent(a, t) << "%\n";
            }

            else if (ch == 3) {
                int future, attend;

                if (!readInt("Upcoming classes: ", future)) break;
                if (!readInt("Classes you will attend: ", attend)) break;

                if (future < 0 || attend < 0 || attend > future) {
                    cout << "Invalid input!\n";
                    continue;
                }

                cout << "Predicted attendance: "
                     << percent(a + attend, t + future) << "%\n";
            }

            else if (ch == 4) {
                int needed = 0;

                if (percent(a, t) < TARGET) {
                    if (t == 0)
                        needed = 1;
                    else
                        needed = 3 * t - 4 * a;
                }

                cout << "Classes to attend consecutively: "
                     << needed << '\n';
            }

            else {
                if (t == 0 || percent(a, t) < TARGET) {
                    cout << "You cannot miss any additional classes "
                         << "and remain at or above 75%.\n";
                } else {
                    int missed = (4 * a - 3 * t) / 3;

                    cout << "Classes you can miss: "
                         << missed << '\n';
                }
            }
        }

        else if (ch == 6) {
            if (n == 0) {
                cout << "No attendance data available.\n";
                continue;
            }

            int total = 0, attended = 0;

            cout << "\n"
                 << left << setw(22) << "Subject"
                 << setw(12) << "Conducted"
                 << setw(12) << "Attended"
                 << "Percentage\n";

            for (int i = 0; i < n; i++) {
                cout << left << setw(22) << s[i].name
                     << setw(12) << s[i].total
                     << setw(12) << s[i].attended
                     << percent(s[i].attended, s[i].total)
                     << "%\n";

                total += s[i].total;
                attended += s[i].attended;
            }

            cout << "Overall attendance: "
                 << percent(attended, total) << "%\n";
        }

        else if (ch == 7) {
            saveData(s, n);
            cout << "Data saved. Goodbye!\n";
            return 0;
        }

        else {
            cout << "Invalid choice! Select 1-7.\n";
        }
    }

    saveData(s, n);
    cout << "\nData saved. Goodbye!\n";
    return 0;
}
