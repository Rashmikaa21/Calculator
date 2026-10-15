
const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

// Separate functions for each mathematical operation
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        throw new Error("Cannot divide by zero!");
    }
    return a / b;
}

function modulus(a, b) {
    if (b === 0) {
        throw new Error("Cannot use modulus with zero!");
    }
    return a % b;
}

// Validate and calculate the complete expression
function calculate(expression) {
    // Allow only numbers, decimal points, spaces and operators
    if (!/^[0-9+\-*/%.()\s]+$/.test(expression)) {
        throw new Error("Invalid expression!");
    }

    // Perform multiplication, division and modulus first.
    // Then perform addition and subtraction.
    const tokens = expression.match(
        /\d*\.?\d+|[+\-*/%()]|\s+/g
    );

    if (!tokens || tokens.join("").replace(/\s/g, "") !== expression.replace(/\s/g, "")) {
        throw new Error("Invalid expression!");
    }

    // Use a restricted expression parser instead of eval().
    let position = 0;

    function skipSpaces() {
        while (position < tokens.length && /^\s+$/.test(tokens[position])) {
            position++;
        }
    }

    function peek() {
        skipSpaces();
        return tokens[position];
    }

    function consume() {
        const token = peek();
        position++;
        return token;
    }

    function parsePrimary() {
        const token = peek();

        if (token === "+" || token === "-") {
            consume();
            const value = parsePrimary();
            return token === "-" ? -value : value;
        }

        if (token === "(") {
            consume();
            const value = parseAddition();

            if (peek() !== ")") {
                throw new Error("Missing closing bracket!");
            }

            consume();
            return value;
        }

        if (token && /^\d*\.?\d+$/.test(token)) {
            consume();
            return Number(token);
        }

        throw new Error("Invalid expression!");
    }

    function parseMultiplication() {
        let result = parsePrimary();

        while (["*", "/", "%"].includes(peek())) {
            const operator = consume();
            const b = parsePrimary();

            if (operator === "*") result = multiply(result, b);
            if (operator === "/") result = divide(result, b);
            if (operator === "%") result = modulus(result, b);
        }

        return result;
    }

    function parseAddition() {
        let result = parseMultiplication();

        while (peek() === "+" || peek() === "-") {
            const operator = consume();
            const b = parseMultiplication();

            if (operator === "+") result = add(result, b);
            if (operator === "-") result = subtract(result, b);
        }

        return result;
    }

    const result = parseAddition();

    if (peek() !== undefined) {
        throw new Error("Invalid expression!");
    }

    if (!Number.isFinite(result)) {
        throw new Error("Result is too large!");
    }

    return result;
}

// Handle calculator button clicks
buttons.forEach(function(button) {
    button.addEventListener("click", function() {
        const value = button.dataset.value;

        if (value === "C") {
            display.value = "";
        } else if (value === "backspace") {
            display.value = display.value.slice(0, -1);
        } else if (value === "=") {
            showResult();
        } else {
            display.value += value;
        }
    });
});

// Calculate and display the result
function showResult() {
    if (display.value.trim() === "") return;

    try {
        display.value = calculate(display.value);
    } catch (error) {
        alert(error.message);
    }
}

// Handle keyboard input and block invalid keys
document.addEventListener("keydown", function(event) {
    const key = event.key;

    // Allow numbers, operators, brackets and decimal points
    if (/^[0-9+\-*/%.()]$/.test(key)) {
        display.value += key;
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        showResult();
    } else if (key === "Backspace") {
        display.value = display.value.slice(0, -1);
    } else if (key === "Escape") {
        display.value = "";
    } else if (
        key === "Tab" ||
        key.startsWith("Arrow") ||
        key === "Shift" ||
        key === "Control" ||
        key === "Alt"
    ) {
        // Allow normal navigation keys without changing the expression.
        return;
    } else {
        // Warn the user and prevent invalid keyboard input.
        event.preventDefault();
        alert("Invalid key! Use numbers and mathematical operators only.");
    }
});
