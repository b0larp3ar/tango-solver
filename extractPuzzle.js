const E = "empty";
const X = "sun";
const O = "moon";

function extractPuzzle() {
    const board = Array(6)
        .fill()
        .map(() => Array(6).fill(E));

    const equality = [];
    const opposite = [];

    const cells = document.querySelectorAll('[data-cell-idx]');

    cells.forEach(cell => {
        const idx = Number(cell.getAttribute('data-cell-idx'));
        const row = Math.floor(idx / 6);
        const col = idx % 6;

        // Extract sun/moon
        const piece = cell.querySelector(
            'svg[aria-label="Sun"], svg[aria-label="Moon"]'
        );

        if (piece) {
            const label = piece.getAttribute('aria-label');
            if (label === "Sun") {
                board[row][col] = X;
            }
            else if (label === "Moon") {
                board[row][col] = O;
            }
        }

        // Extract equality and opposite constraints
        const constraints = cell.querySelectorAll(
            '[data-testid="edge-equal"], [data-testid="edge-cross"]'
        );

        constraints.forEach(constraint => {
            const parentClass = constraint.parentElement.className;
            let neighbor = null;

            // DOWN
            if (parentClass.includes('_945acf7f')) {
                if (row < 5) {
                    neighbor = [row + 1, col];
                }
            }

            // RIGHT
            else if (parentClass.includes('_115ff098')) {
                if (col < 5) {
                    neighbor = [row, col + 1];
                }
            }

            if (!neighbor) {    // no constraints
                return;
            }

            const pair = [
                [row, col],
                neighbor
            ];

            const type = constraint.getAttribute('data-testid');

            if (type === 'edge-equal') {
                equality.push(pair);
            }

            else if (type === 'edge-cross') {
                opposite.push(pair);
            }
        });
    });

    return {
        board,
        equality,
        opposite
    };
}

function isFilled(board){
    for(let i=0; i<6; i++){
        for(let j=0; j<6; j++){
            if(board[i][j]===E){
                return false;
            }
        }
    }
    return true;
}

function findEmpty(board){
    for(let i=0; i<6; i++){
        for(let j=0; j<6; j++){
            if(board[i][j]===E){
                return [i,j];
            }
        }
    }
}

function checkEquality(board,r,c){
    for(const [cell1,cell2] of equality){
        if(
            !(cell1[0]===r && cell1[1]===c) &&
            !(cell2[0]===r && cell2[1]===c)
        ){
            continue;
        }
        const [r1,c1] = cell1;
        const [r2,c2] = cell2;
        if(board[r1][c1]!==E && board[r2][c2]!==E){
            if(board[r1][c1]!==board[r2][c2]){
                return false;
            }
        }
    }
    return true;
}

function checkOpposite(board,r,c){
    for(const [cell1,cell2] of opposite){
        if(
            !(cell1[0]===r && cell1[1]===c) &&
            !(cell2[0]===r && cell2[1]===c)
        ){
            continue;
        }
        const [r1,c1] = cell1;
        const [r2,c2] = cell2;
        if(board[r1][c1]!==E && board[r2][c2]!==E){
            if(board[r1][c1]===board[r2][c2]){
                return false;
            }
        }
    }
    return true;
}

function checkThreeConsecutive(board,r,c){

    // horizontal
    if(c>1){
        if(
            board[r][c-2]===board[r][c-1] &&
            board[r][c-1]===board[r][c] &&
            board[r][c]!==E
        ){
            return false;
        }
    }
    if(c<4){
        if(
            board[r][c]===board[r][c+1] &&
            board[r][c+1]===board[r][c+2] &&
            board[r][c]!==E
        ){
            return false;
        }
    }
    if(c>0 && c<5){
        if(
            board[r][c-1]===board[r][c] &&
            board[r][c]===board[r][c+1] &&
            board[r][c]!==E
        ){
            return false;
        }
    }

    // vertical
    if(r>1){
        if(
            board[r-2][c]===board[r-1][c] &&
            board[r-1][c]===board[r][c] &&
            board[r][c]!==E
        ){
            return false;
        }
    }
    if(r<4){
        if(
            board[r][c]===board[r+1][c] &&
            board[r+1][c]===board[r+2][c] &&
            board[r][c]!==E
        ){
            return false;
        }
    }
    if(r>0 && r<5){
        if(
            board[r-1][c]===board[r][c] &&
            board[r][c]===board[r+1][c] &&
            board[r][c]!==E
        ){
            return false;
        }
    }

    return true;
}

function checkRowSum(board,r,c){
    let n1 = 0;
    let n2 = 0;
    let emptyFound = false;

    for(let i=0; i<6; i++){
        if(board[r][i]===X){
            n1++;
        }
        else if(board[r][i]===O){
            n2++;
        }
        else{
            emptyFound = true;
        }
        if(n1>3 || n2>3){
            return false;
        }
    }
    if(emptyFound){
        return true;
    }
    return n1===n2;
}

function checkColumnSum(board,r,c){
    let n1 = 0;
    let n2 = 0;
    let emptyFound = false;

    for(let i=0; i<6; i++){
        if(board[i][c]===X){
            n1++;
        }
        else if(board[i][c]===O){
            n2++;
        }
        else{
            emptyFound = true;
        }
        if(n1>3 || n2>3){
            return false;
        }
    }
    if(emptyFound){
        return true;
    }

    return n1===n2;
}

function isValid(board,r,c){
    if(!checkEquality(board,r,c)) return false;
    if(!checkOpposite(board,r,c)) return false;
    if(!checkThreeConsecutive(board,r,c)) return false;
    if(!checkRowSum(board,r,c)) return false;
    if(!checkColumnSum(board,r,c)) return false;

    return true;
}

function solve(board){
    if(isFilled(board)){
        return true;
    }

    const [r,c] = findEmpty(board);

    board[r][c] = X;
    if(isValid(board,r,c)){
        if(solve(board)){
            return true;
        }
    }

    board[r][c] = O;
    if(isValid(board,r,c)){
        if(solve(board)){
            return true;
        }
    }

    board[r][c] = E;
    return false;
}

const puzzle = extractPuzzle();

let board = puzzle.board;
let equality = puzzle.equality;
let opposite = puzzle.opposite;

solve(board);

console.table(board);