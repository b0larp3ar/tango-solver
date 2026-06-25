let SIZE;
const E = "empty";
const X = "sun";
const O = "moon";
let equality=[];
let opposite=[];

// extract board
function extractBoard() {
    const board = Array(SIZE)
        .fill()
        .map(() => Array(SIZE).fill(E));

    const cells = document.querySelectorAll('[data-cell-idx]');

    cells.forEach(cell => {
        const idx = Number(cell.getAttribute('data-cell-idx'));
        const row = Math.floor(idx / SIZE);
        const col = idx % SIZE;

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
    });

    return board;
}
// extract equality/opposite
function extractConstraints(){
    const equality = [];
    const opposite = [];

    const cells = document.querySelectorAll('[data-cell-idx]');

    cells.forEach(cell=>{
        const idx = Number(
            cell.getAttribute('data-cell-idx')
        );

        const row = Math.floor(idx / SIZE);

        const col = idx % SIZE;

        const constraints = cell.querySelectorAll(
            '[data-testid="edge-equal"], [data-testid="edge-cross"]'
        );

        constraints.forEach(constraint => {
            let neighbor = null;

            // Position of current cell
            const cellRect = cell.getBoundingClientRect();

            // Position of the constraint symbol
            const edgeRect = constraint.parentElement.getBoundingClientRect();

            const cellCenterX = cellRect.left + cellRect.width / 2;
            const cellCenterY = cellRect.top + cellRect.height / 2;

            const edgeCenterX = edgeRect.left + edgeRect.width / 2;
            const edgeCenterY = edgeRect.top + edgeRect.height / 2;

            const dx = edgeCenterX - cellCenterX;
            const dy = edgeCenterY - cellCenterY;

            // RIGHT constraint
            if (Math.abs(dx) > Math.abs(dy)) {
                if (col < SIZE-1) {
                    neighbor = [row, col + 1];
                }
            }

            // BOTTOM constraint
            else {
                if (row < SIZE-1) {
                    neighbor = [row + 1, col];
                }
            }

            if (!neighbor) return;

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
        equality, 
        opposite
    }
}

function isFilled(board){
    for(let i=0; i<SIZE; i++){
        for(let j=0; j<SIZE; j++){
            if(board[i][j]===E){
                return false;
            }
        }
    }
    return true;
}

function findEmpty(board){
    for(let i=0; i<SIZE; i++){
        for(let j=0; j<SIZE; j++){
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
    if(c<SIZE-2){
        if(
            board[r][c]===board[r][c+1] &&
            board[r][c+1]===board[r][c+2] &&
            board[r][c]!==E
        ){
            return false;
        }
    }
    if(c>0 && c<SIZE-1){
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
    if(r<SIZE-2){
        if(
            board[r][c]===board[r+1][c] &&
            board[r+1][c]===board[r+2][c] &&
            board[r][c]!==E
        ){
            return false;
        }
    }
    if(r>0 && r<SIZE-1){
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

    for(let i=0; i<SIZE; i++){
        if(board[r][i]===X){
            n1++;
        }
        else if(board[r][i]===O){
            n2++;
        }
        else{
            emptyFound = true;
        }
        if(n1>SIZE/2 || n2>SIZE/2){
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

    for(let i=0; i<SIZE; i++){
        if(board[i][c]===X){
            n1++;
        }
        else if(board[i][c]===O){
            n2++;
        }
        else{
            emptyFound = true;
        }
        if(n1>SIZE/2 || n2>SIZE/2){
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

// solving algorithm
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

function sleep(ms){
    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}

function clickCell(cell){
    cell.dispatchEvent(
        new MouseEvent(
            'mousedown',
            { bubbles: true }
        )
    );

    cell.dispatchEvent(
        new MouseEvent(
            'mouseup',
            { bubbles: true }
        )
    );

    cell.dispatchEvent(
        new MouseEvent(
            'click',
            { bubbles: true }
        )
    );
}

// fill the puzzle in linkedin
async function fillBoard(originalBoard, solvedBoard){
    const cells = document.querySelectorAll('[data-cell-idx]');

    for(const cell of cells){
        const idx = Number(cell.getAttribute('data-cell-idx'));

        const row = Math.floor(idx / SIZE);

        const col = idx % SIZE;

        // Skip pre-filled cells
        if(originalBoard[row][col]!== E){
            continue;
        }

        if(solvedBoard[row][col]===X){
            clickCell(cell);
            await sleep(50);
        }

        else if(solvedBoard[row][col]===O){
            clickCell(cell);
            await sleep(50);
            clickCell(cell);
            await sleep(50);
        }
    }

    // Give LinkedIn time to save
    await sleep(500);
}

async function solveTango(){
    SIZE = Math.sqrt(document.querySelectorAll('[data-cell-idx]').length);
    const originalBoard = extractBoard();
    const board = originalBoard.map(row => [...row]);
    const constraints=extractConstraints();
    equality = constraints.equality;
    opposite = constraints.opposite;

    solve(board);
    await fillBoard(originalBoard, board);
}

chrome.runtime.onMessage.addListener((message)=>{
    if(message.action==="solve"){
        solveTango();
    }
});
