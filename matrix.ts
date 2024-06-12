import { assert } from "console";

/**
 * Checks whether the given matrix is rectangular, i.e. all sublists have equal length
 * @param matrix a matrix
 * @returns Whether the matrix is rectangular
 */
export function isRectangular(matrix:number[][]): boolean {
    let matrixDim = matrix.map((v) => v.length);
    return(matrixDim.every((dim) => dim === matrixDim[0]))
}

/**
 * Equivalent to Python's range function
 * @param n any integer
 * @returns an array containing entries 1 to n
 */
export function range(n:number): number[] {
    return Array.from(Array(n).keys())
}

/**
 * Calculates the Euclidean distance between two vectors v1 and v2.
 * @param v1 length N vector
 * @param v2 length N vector
 * @returns the distance between v1 and v2
 */
export function vectorDist(v1:number[], v2:number[]): number {
    assert(v1.length === v2.length, `v1 and v2 must be the same length, but are ${v1.length} and ${v2.length} instead`);
    let distSq = 0;
    for (let i = 0; i < v1.length; i++) 
        distSq += (v1[i] - v2[i])**2;
    return Math.sqrt(distSq);
}

/**
 * Calclates the mean vector of a list of vectors
 * @param vectors list of N vectors of length M
 * @returns length M vector
 */
export function vectorMean(vectors:number[][]): number[] {
    assert(isRectangular(vectors), `Vectors must all have the same length!`);
    // console.log('in vector mean');
    // console.table(vectors);
    
    let vectorMean = new Array(vectors[0].length).fill(0);
    for (let vector of vectors) 
        vector.forEach((v,i) => vectorMean[i] += v/vectors.length);
    return vectorMean
}

/**
 * Performs matrix-vector multiplication, equivalent to transforming the vector according to the matrix.
 * @param matrix N x M matrix (length N list containing length M lists)
 * @param vector length M vector
 * @returns length M vector
 */
export function matVecMul(matrix:number[][], vector:number[]): number[] {
    assert(isRectangular(matrix), `Matrix must be rectangular!`);
    assert(matrix[0].length === vector.length, `Vector must be the same length as the 2nd dimension of matrix, but they are ${vector.length} and ${matrix[0].length}`);
    let result = matrix.map((row) => {
        let sum = 0;
        for (let i = 0; i < row.length; i++)
            sum += row[i]*vector[i];
        return sum;
    });
    return result;
}

/**
 * A version similar to a 2 dimensional reduction (but less flexible). 
 * Finds the most extreme value in the matrix, where extreme is defined by the function f. 
 * E.g. when calling this with f = (e1, e2) => e1 > e2, the returned value will be the largest in the 2d matrix.
 * @param matrix 2d matrix
 * @param f function by which to reduce
 * @returns the most extreme value in the matrix, as defined by f
 */
export function twoDimReduce(matrix:number[][], f:(e1:number, e2:number) => boolean): number {
    return matrix.map(
        (row) => row.reduce((e1, e2) => (f(e1, e2) ? e1 : e2)))
        .reduce(((e1, e2) => f(e1, e2) ? e1 : e2))
}

/**
 * Properly initialize a n by m array.
 * @param n first dimension
 * @param m second dimension
 * @param def default value to fill
 * @returns N x M array filled with the default. 
 */
export function twoDimArray(n:number, m:number, def:any=undefined): any[][] {
    let array = new Array<any[]>(n);
    for (let i = 0; i < n; i++) 
        array[i] = new Array(m).fill(def);
    return array;    
}

/**
 * Deep equality function between two arbitrary matrices.
 * @param m1 matrix 1
 * @param m2 matrix 2
 * @returns deep 2d equality between matrices
 */
export function isEqual(m1:number[][], m2:number[][]): boolean {
    assert(m1.length === m2.length, `m1 and m2 should have the same length but they are ${m1.length} and ${m2.length} respectively`);
    assert(m2.every((v, i) => v.length=m2[i].length), `m1 and m2 should have same 2nd dimension`);
    for (let i = 0; i < m1.length; i++) 
        for (let j = 0; j < m1[i].length; j++) 
            if (m1[i][j] !== m2[i][j]) return false;
    return true;
}