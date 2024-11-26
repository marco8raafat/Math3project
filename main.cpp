#include <bits/stdc++.h>
#include <cmath> // For sqrt
using namespace std;

// Function to check if the matrix is square
bool isSquare(const vector<vector<double>>& matrix) {
    int rows = matrix.size();
    for (const auto& row : matrix) {
        if (row.size() != rows) {
            return false;
        }
    }
    return true;
}

// Function to check if the matrix is symmetric
bool isSymmetric(const vector<vector<double>>& matrix) {
    int n = matrix.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (matrix[i][j] != matrix[j][i]) {
                return false;
            }
        }
    }
    return true;
}

// Function to compute determinant
double determinant(vector<vector<double>> matrix) {
    int n = matrix.size();
    double det = 1.0;

    for (int i = 0; i < n; i++) {
        if (matrix[i][i] == 0.0) {
            bool swapped = false;
            for (int j = i + 1; j < n; j++) {
                if (matrix[j][i] != 0.0) {
                    swap(matrix[i], matrix[j]);
                    det *= -1; // Row swap changes determinant sign
                    swapped = true;
                    break;
                }
            }
            if (!swapped) return 0.0; // Singular matrix
        }

        for (int j = i + 1; j < n; j++) {
            double factor = matrix[j][i] / matrix[i][i];
            for (int k = i; k < n; k++) {
                matrix[j][k] -= factor * matrix[i][k];
            }
        }
        det *= matrix[i][i];
    }
    return det;
}

// Function to check if matrix is singular
bool isSingular(const vector<vector<double>>& matrix) {
    return determinant(matrix) == 0.0;
}

// Function to perform Cholesky decomposition
bool choleskyDecomposition(const vector<vector<double>>& matrix, vector<vector<double>>& lower) {
    int n = matrix.size();
    lower.assign(n, vector<double>(n, 0.0));

    for (int i = 0; i < n; i++) {
        for (int j = 0; j <= i; j++) {
            double sum = 0.0;

            if (j == i) {
                for (int k = 0; k < j; k++) {
                    sum += lower[j][k] * lower[j][k];
                }
                double value = matrix[j][j] - sum;
                if (value <= 0) {
                    cout << "Matrix is not positive definite!" << endl;
                    return false;
                }
                lower[j][j] = sqrt(value);
            } else {
                for (int k = 0; k < j; k++) {
                    sum += lower[i][k] * lower[j][k];
                }
                lower[i][j] = (matrix[i][j] - sum) / lower[j][j];
            }
        }
    }
    return true;
}

// Function to solve lower triangular system LY = B
vector<double> solveLowerTriangular(const vector<vector<double>>& lower, const vector<double>& b) {
    int n = lower.size();
    vector<double> y(n, 0.0);

    for (int i = 0; i < n; i++) {
        double sum = 0.0;
        for (int j = 0; j < i; j++) {
            sum += lower[i][j] * y[j];
        }
        y[i] = (b[i] - sum) / lower[i][i];
    }
    return y;
}

// Function to solve upper triangular system UX = Y
vector<double> solveUpperTriangular(const vector<vector<double>>& upper, const vector<double>& y) {
    int n = upper.size();
    vector<double> x(n, 0.0);

    for (int i = n - 1; i >= 0; i--) {
        double sum = 0.0;
        for (int j = i + 1; j < n; j++) {
            sum += upper[i][j] * x[j];
        }
        x[i] = (y[i] - sum) / upper[i][i];
    }
    return x;
}

// Function to display a matrix
void displayMatrix(const vector<vector<double>>& matrix) {
    for (const auto& row : matrix) {
        for (double val : row) {
            cout << setw(8) << val << " ";
        }
        cout << endl;
    }
}

// Menu-driven main function
int main() {
    while (true) {
        int choice, n;
        cout << "\nChoose the decomposition method:\n";
        cout << "1. Cholesky Decomposition\n";
        cout << "2. Doolittle Decomposition\n";
        cout << "3. Determinant\n";
        cout << "4. Exit\n";
        cout << "Enter your choice: ";
        cin >> choice;

        if (choice == 4) {
            cout << "Exiting program.\n";
            break;
        }

        cout << "Enter the size of the square matrix (n x n): ";
        cin >> n;

        vector<vector<double>> matrix(n, vector<double>(n));
        cout << "Enter the elements of the matrix row by row:\n";
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                cin >> matrix[i][j];
            }
        }

        if (!isSquare(matrix)) {
            cout << "Matrix is not square! Exiting.\n";
            continue;
        }

        if (choice == 1) {
            if (!isSymmetric(matrix)) {
                cout << "Matrix is not symmetric! Cholesky decomposition cannot be applied.\n";
                continue;
            }
            vector<vector<double>> lower;
            if (choleskyDecomposition(matrix, lower)) {
                cout << "Lower triangular matrix (L):\n";
                displayMatrix(lower);
                vector<vector<double>> upper(n, vector<double>(n));
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    upper[i][j] = lower[j][i];
                }
            }
                cout << "upper triangular matrix (L):\n";
                displayMatrix(upper);
                            vector<double> ans(n);
        cout << "Enter the elements of the answer vector:\n";
        for (int i = 0; i < n; i++) {
            cin >> ans[i];
        }

        vector<double> y = solveLowerTriangular(lower, ans);
        cout << "Solution for Y (AY = B):\n";
        for (int i = 0; i < n; i++) {
            cout << "y" << i + 1 << " = " << y[i] << endl;
        }

        ans = y;
        vector<double> x = solveUpperTriangular(upper, ans);

        cout << "Solution for X (AX = Y):\n";
        for (int i = 0; i < n; i++) {
            cout << "x" << i + 1 << " = " << x[i] << endl;
        }
            }
        } else if (choice == 2) {
            if (isSingular(matrix)) {
                cout << "Matrix is singular! Doolittle decomposition cannot be applied.\n";
                continue;
            }
            vector<vector<double>> lower(n, vector<double>(n));
            vector<vector<double>> upper(n, vector<double>(n));

            // Perform Doolittle decomposition
            for (int i = 0; i < n; i++) {
                for (int j = i; j < n; j++) {
                    double sum = 0.0;
                    for (int k = 0; k < i; k++) {
                        sum += lower[i][k] * upper[k][j];
                    }
                    upper[i][j] = matrix[i][j] - sum;
                }

                for (int j = i; j < n; j++) {
                    if (i == j) {
                        lower[i][i] = 1;
                    } else {
                        double sum = 0.0;
                        for (int k = 0; k < i; k++) {
                            sum += lower[j][k] * upper[k][i];
                        }
                        lower[j][i] = (matrix[j][i] - sum) / upper[i][i];
                    }
                }
            }

            cout << "Lower Triangular Matrix (L):\n";
            displayMatrix(lower);
            cout << "Upper Triangular Matrix (U):\n";
            displayMatrix(upper);
            vector<double> ans(n);
        cout << "Enter the elements of the answer vector:\n";
        for (int i = 0; i < n; i++) {
            cin >> ans[i];
        }

        vector<double> y = solveLowerTriangular(lower, ans);
        cout << "Solution for Y (AY = B):\n";
        for (int i = 0; i < n; i++) {
            cout << "y" << i + 1 << " = " << y[i] << endl;
        }

        ans = y;
        vector<double> x = solveUpperTriangular(upper, ans);

        cout << "Solution for X (AX = Y):\n";
        for (int i = 0; i < n; i++) {
            cout << "x" << i + 1 << " = " << x[i] << endl;
        }
        } else if (choice == 3){
            cout<<"Determinant = ";
            cout<<determinant(matrix);
        }
        else {
            cout << "Invalid choice! Try again.\n";
        }
    }

    return 0;
}
