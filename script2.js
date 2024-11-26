document.getElementById("generate-matrix").addEventListener("click", () => {
    console.log("first");
    const size = parseInt(document.getElementById("matrix-size").value);
    const matrixInputs = document.getElementById("matrix-inputs");
    matrixInputs.innerHTML = "";
    for (let i = 0; i < size; i++) {
      const row = document.createElement("div");
      row.className = "d-flex gap-2 mb-2";
      for (let j = 0; j < size; j++) {
        const input = document.createElement("input");
        input.type = "number";
        input.step = "any";
        input.className = "form-control";
        input.placeholder = `a[${i + 1}][${j + 1}]`;
        input.dataset.row = i;
        input.dataset.col = j;
        row.appendChild(input);
      }
      matrixInputs.appendChild(row);
    }
  });
  
  document.getElementById("solve-matrix").addEventListener("click", () => {
    const size = parseInt(document.getElementById("matrix-size").value);
    const operation = document.getElementById("operation").value;
    const matrix = parseMatrix(size);
    let result = "";
  
    try {
      if (operation === "cholesky") {
        if (!isSymmetric(matrix)) {
          result = "Matrix must be symmetric for Cholesky decomposition.";
        } else {
          const lower = choleskyDecomposition(matrix);
          result += "<h5>Lower Triangular Matrix (L):</h5>";
          result += displayMatrix(lower);
          const upper = transpose(lower);
          result += "<h5>Upper Triangular Matrix (Lᵀ):</h5>";
          result += displayMatrix(upper);
        }
      } else if (operation === "doolittle") {
        if (determinantDolittle(matrix) === 0) {
          result =
            "Matrix is singular and cannot be decomposed using Doolittle method.";
        } else {
          const { lower, upper } = doolittleDecomposition(matrix);
          result += "<h5>Lower Triangular Matrix (L):</h5>";
          result += displayMatrix(lower);
          result += "<h5>Upper Triangular Matrix (U):</h5>";
          result += displayMatrix(upper);
        }
      } else if (operation === "determinant") {
        const det = determinant(matrix);
        result = `<h5>Determinant: ${det}</h5>`;
      } else {
        result = "Invalid operation selected.";
      }
    } catch (error) {
      result = `An error occurred: ${error.message}`;
    }
  
    document.getElementById("result").innerHTML = result;
  });
  
  // Helper: Parse matrix inputs
  function parseMatrix(size) {
    const matrix = Array.from({ length: size }, () => Array(size).fill(0));
    const inputs = document.querySelectorAll("#matrix-inputs input");
    inputs.forEach((input) => {
      const row = parseInt(input.dataset.row);
      const col = parseInt(input.dataset.col);
      matrix[row][col] = parseFloat(input.value) || 0;
    });
    return matrix;
  }
  
  // Helper: Display matrix as HTML
  function displayMatrix(matrix) {
    return (
      '<table class="table table-bordered">' +
      matrix
        .map(
          (row) =>
            "<tr>" +
            row.map((val) => `<td>${val.toFixed(3)}</td>`).join("") +
            "</tr>"
        )
        .join("") +
      "</table>"
    );
  }
  
  // Check if matrix is symmetric
  function isSymmetric(matrix) {
    const n = matrix.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i][j] !== matrix[j][i]) return false;
      }
    }
    return true;
  }
  
  // Check if matrix is singular
  function isSingular(matrix) {
    return determinant(matrix) === 0;
  }
  
  // Compute determinant (Gaussian elimination)
  function determinantDolittle(matrix) {
    const mat = JSON.parse(JSON.stringify(matrix));
    const n = mat.length;
    let det = 1;
    for (let i = 0; i < n; i++) {
      if (mat[i][i] === 0) {
        let swapped = false;
        for (let j = i + 1; j < n; j++) {
          if (mat[j][i] !== 0) {
            [mat[i], mat[j]] = [mat[j], mat[i]];
            det *= -1;
            swapped = true;
            break;
          }
        }
        if (!swapped) return 0; // Singular mat
      }
      for (let j = i + 1; j < n; j++) {
        const factor = mat[j][i] / mat[i][i];
        for (let k = i; k < n; k++) {
          mat[j][k] -= factor * mat[i][k];
        }
      }
      det *= mat[i][i];
    }
    return det;
  }
  
  function determinant(matrix) {
    const n = matrix.length;
    let det = 1;
    for (let i = 0; i < n; i++) {
      if (matrix[i][i] === 0) {
        let swapped = false;
        for (let j = i + 1; j < n; j++) {
          if (matrix[j][i] !== 0) {
            [matrix[i], matrix[j]] = [matrix[j], matrix[i]];
            det *= -1;
            swapped = true;
            break;
          }
        }
        if (!swapped) return 0; // Singular matrix
      }
      for (let j = i + 1; j < n; j++) {
        const factor = matrix[j][i] / matrix[i][i];
        for (let k = i; k < n; k++) {
          matrix[j][k] -= factor * matrix[i][k];
        }
      }
      det *= matrix[i][i];
    }
    return det;
  }
  
  // Cholesky decomposition
  function choleskyDecomposition(matrix) {
    const n = matrix.length;
    const lower = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = 0;
        if (i === j) {
          for (let k = 0; k < j; k++) sum += lower[j][k] ** 2;
          lower[j][j] = Math.sqrt(matrix[j][j] - sum);
        } else {
          for (let k = 0; k < j; k++) sum += lower[i][k] * lower[j][k];
          lower[i][j] = (matrix[i][j] - sum) / lower[j][j];
        }
      }
    }
    return lower;
  }
  
  // Doolittle decomposition
  function doolittleDecomposition(matrix) {
    const n = matrix.length;
    const lower = Array.from({ length: n }, () => Array(n).fill(0));
    const upper = Array.from({ length: n }, () => Array(n).fill(0));
  
    for (let i = 0; i < n; i++) {
      // Compute upper triangular matrix (U)
      for (let j = i; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < i; k++) {
          sum += lower[i][k] * upper[k][j];
        }
        upper[i][j] = matrix[i][j] - sum;
      }
      // Compute lower triangular matrix (L)
      for (let j = i; j < n; j++) {
        if (i === j) {
          lower[i][i] = 1; // Diagonal elements of L are 1
        } else {
          let sum = 0;
          for (let k = 0; k < i; k++) {
            sum += lower[j][k] * upper[k][i];
          }
          lower[j][i] = (matrix[j][i] - sum) / upper[i][i];
        }
      }
    }
    return { lower, upper };
  }
  
  // Helper: Transpose a matrix
  function transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
  }
  
  // Solve a lower triangular system Ly = b
  function solveLowerTriangular(lower, b) {
    const n = lower.length;
    const y = Array(n).fill(0);
  
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) {
        sum += lower[i][j] * y[j];
      }
      y[i] = (b[i] - sum) / lower[i][i];
    }
    return y;
  }
  
  // Solve an upper triangular system Ux = y
  function solveUpperTriangular(upper, y) {
    const n = upper.length;
    const x = Array(n).fill(0);
  
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += upper[i][j] * x[j];
      }
      x[i] = (y[i] - sum) / upper[i][i];
    }
  
    return x;
  }
  
  // Updated solve-matrix click handler to include solutions for y and x
  document.getElementById("solve-matrix").addEventListener("click", () => {
    const size = parseInt(document.getElementById("matrix-size").value);
    const operation = document.getElementById("operation").value;
    const matrix = parseMatrix(size);
    const answerVector = parseAnswerVector(size);
  
    let result = "";
  
    try {
      if (operation === "cholesky") {
        if (!isSymmetric(matrix)) {
          result = "Matrix must be symmetric for Cholesky decomposition.";
        } else {
          const lower = choleskyDecomposition(matrix);
          result += "<h5>Lower Triangular Matrix (L):</h5>";
          result += displayMatrix(lower);
  
          const upper = transpose(lower);
          result += "<h5>Upper Triangular Matrix (Lᵀ):</h5>";
          result += displayMatrix(upper);
  
          // Solve Ly = b
          const y = solveLowerTriangular(lower, answerVector);
          result += "<h5>Solution for Y (L * Y = B):</h5>";
          result += displayVector(y, "y");
  
          // Solve Ux = y
          const x = solveUpperTriangular(upper, y);
          result += "<h5>Solution for X (U * X = Y):</h5>";
          result += displayVector(x, "x");
        }
      } else if (operation === "doolittle") {
        if (isSingular(matrix)) {
          result =
            "Matrix is singular and cannot be decomposed using Doolittle method.";
        } else {
          const { lower, upper } = doolittleDecomposition(matrix);
          result += "<h5>Lower Triangular Matrix (L):</h5>";
          result += displayMatrix(lower);
  
          result += "<h5>Upper Triangular Matrix (U):</h5>";
          result += displayMatrix(upper);
  
          // Solve Ly = b
          const y = solveLowerTriangular(lower, answerVector);
          result += "<h5>Solution for Y (L * Y = B):</h5>";
          result += displayVector(y, "y");
  
          // Solve Ux = y
          const x = solveUpperTriangular(upper, y);
          result += "<h5>Solution for X (U * X = Y):</h5>";
          result += displayVector(x, "x");
        }
      } else if (operation === "determinant") {
        const det = determinant(matrix);
        result = `<h5>Determinant: ${det}</h5>`;
      } else {
        result = "Invalid operation selected.";
      }
    } catch (error) {
      result = `An error occurred: ${error.message}`;
    }
  
    document.getElementById("result").innerHTML = result;
  });
  
  // Parse the answer vector
  function parseAnswerVector(size) {
    const vectorInputs = document.querySelectorAll("#answer-vector input");
    return Array.from(
      { length: size },
      (_, i) => parseFloat(vectorInputs[i].value) || 0
    );
  }
  
  // Display a vector as HTML
  function displayVector(vector, label) {
    return (
      '<table class="table table-bordered">' +
      "<tr>" +
      vector
        .map((val, i) => `<td>${label}${i + 1} = ${val.toFixed(3)}</td>`)
        .join("") +
      "</tr>" +
      "</table>"
    );
  }
  
  // Dynamically generate answer vector inputs
  document.getElementById("generate-matrix").addEventListener("click", () => {
    const size = parseInt(document.getElementById("matrix-size").value);
  
    const vectorContainer = document.getElementById("answer-vector");
    vectorContainer.innerHTML = "";
  
    for (let i = 0; i < size; i++) {
      const input = document.createElement("input");
      input.type = "number";
      input.step = "any";
      input.className = "form-control mb-2";
      input.placeholder = `b[${i + 1}]`;
      vectorContainer.appendChild(input);
    }
  });