import assert from 'assert';
import { Rating } from './rating';
import { twoDimReduce } from './matrix';

export class RatedNetwork {
    nNodes:number;
    network:number[][];
    ratings:Rating[];
    lower:number;
    upper:number;

    constructor(network:number[][], ratings:Rating[], lower:number|null=null, upper:number|null=null) {
        let nRows: number = network.length;
        let nCols: number[] = [];
        network.forEach((col) => nCols.push(col.length)); 
        let sameColLengths = nCols.every((colLength) => colLength === nCols[0]);
        assert(sameColLengths, `Ragged columns!`);
        assert(nCols[0] === nRows, `Adjacency matrix has invalid shape ${nRows}x${nCols[0]}`);
        assert(ratings.length === nRows, `rating and network must have compatible size, but rating is of length ${ratings.length}, network has shape ${nRows}x${nCols[0]}`);
        this.nNodes = nRows;
        this.network = network;
        this.ratings = ratings;
        if (lower === null) lower = Math.floor(twoDimReduce(network, (e1, e2) => e1 < e2));
        if (upper === null) upper = Math.ceil(twoDimReduce(network, (e1, e2) => e1 > e2));
        assert (lower < upper, `lower must be smaller than upper but they are ${lower} and ${upper}`);
        this.lower = lower;
        this.upper = upper;
    }

    hasRating(): boolean {
        return !this.ratings.every((r) => r === null);
    }

    hasUnrated(): boolean {
        return !this.ratings.every((r) => r !== null);
    }

    toString() : string[][] {
        var visNetwork: string[][] = Array(this.nNodes+1);
        var ratingsString: string[] = [];
        this.ratings.forEach((rating) => {
            ratingsString.push((rating === null) ? '-' : `${rating.toString()} stars`);
        });
        ratingsString.unshift('.');
        // Fill "border" with ratings
        for (let i = 0; i < this.nNodes+1; i++) {
            visNetwork[i] = Array(this.nNodes+1);
            visNetwork[i][0] = ratingsString[i];
            visNetwork[0][i] = ratingsString[i];
        }
        // Fill adjacency middle
        for (let i = 0; i < this.nNodes; i++) 
            for (let j = 0; j < this.nNodes; j++)
                visNetwork[i+1][j+1] = this.network[i][j].toString();
        return visNetwork;
    }

    /**
     * Add or overwrite a rating at nodeIndex.
     * @param nodeIndex Index of the rated node
     * @param rating Rating of the node
     */
    addRating(nodeIndex:number, rating:Rating) : void {
        assert(nodeIndex >= 0 && nodeIndex < this.nNodes, `nodeIndex must be between 0 and ${this.nNodes}, but is ${nodeIndex}`);
        this.ratings[nodeIndex] = rating;
    }
}