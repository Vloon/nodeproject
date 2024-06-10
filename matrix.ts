export function range(n:number): number[] {
    return Array.from(Array(n).keys())
}

export function matVecMul(matrix:number[][], vector:number[]): number[] {
    let result = matrix.map((row) => {
        let sum = 0;
        for (let i = 0; i < row.length; i++)
            sum += row[i]*vector[i];
        return sum;
    });
    return result;
}

export function twoDimReduce(matrix:number[][], f:(e1:number, e2:number) => boolean): number {
    return matrix.map(
        (row) => row.reduce((e1, e2) => (f(e1, e2) ? e1 : e2)))
        .reduce(((e1, e2) => f(e1, e2) ? e1 : e2))
}