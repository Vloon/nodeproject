import assert from 'assert';
import { Rating } from './rating';
import { twoDimensionalReduce } from './matrix';
import { UserProfile } from './user-profile';

const lowerDefault: number = 0;
const upperDefault: number = 1;

/**
 * RatedNetworks describe a set of nodes (e.g. recipes) with their ratings and the similarity between the nodes. 
 */
export class RatedNetwork {
    nNodes:number;
    profile:UserProfile;
    ratings:Rating[];
    lower:number = lowerDefault;
    upper:number = upperDefault;

    /**
     * 
     * @param profile the user profile, which contains the similarity network of the nodes
     * @param ratings ratings of the nodes
     */
    constructor(profile:UserProfile, ratings:Rating[]) {
        let nRows: number = profile.length;
        let nCols: number[] = profile.similarityNetwork.map((v) => v.length);
        assert(nCols.every((colLength) => colLength === nCols[0]), `Ragged columns!`);
        assert(nCols[0] === nRows, `Adjacency matrix has invalid shape ${nRows}x${nCols[0]}`);
        assert(ratings.length === nRows, `rating and network must have compatible size, but rating is of length ${ratings.length}, network has shape ${nRows}x${nCols[0]}`);
        this.nNodes = nRows;
        this.profile = profile;
        this.ratings = ratings;
    }

    hasRating(): boolean {
        return !this.ratings.every((r) => r === null);
    }

    hasUnrated(): boolean {
        return !this.ratings.every((r) => r !== null);
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

    toString() : string[][] {
        var visNetwork: string[][] = new Array(this.nNodes+1);
        var ratingsString: string[] = [];
        this.ratings.forEach((rating) => {
            ratingsString.push((rating === null) ? '-' : `${rating.toString()} stars`);
        });
        ratingsString.unshift('.');
        // Fill "border" with ratings
        for (let i = 0; i < this.nNodes+1; i++) {
            visNetwork[i] = new Array(this.nNodes+1);
            visNetwork[i][0] = ratingsString[i];
            visNetwork[0][i] = ratingsString[i];
        }
        // Fill adjacency middle
        for (let i = 0; i < this.nNodes; i++) 
            for (let j = 0; j < this.nNodes; j++)
                visNetwork[i+1][j+1] = this.profile.similarityNetwork[i][j].toString();
        return visNetwork;
    }
}