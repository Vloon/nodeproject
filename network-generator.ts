import assert from 'assert';
import { RatedNetwork } from './rated-network'; 
import { Rating } from './rating';
import { twoDimensionalArray } from './matrix';
import { UserProfile } from './user-profile';

const lowerDefault: number = 0;
const upperDefault: number = 1;
const ratedProbabilityDefault: number = 0;

export class NetworkGenerator {

    /**
     * Creates a random rated network, consisting of an adjacency matrix + a rating for each node.
     * @param nNodes number of nodes in the network
     * @param lower minimum value of an edge
     * @param upper maximum value of an edge
     * @param ratedProbability probability of a node being rated, allows the network to come with pre-rated nodes
     * @returns random rated network
     */
   static randomRatedNetwork(nNodes:number, lower:number = lowerDefault, upper:number = upperDefault, ratedProbability:number=ratedProbabilityDefault): RatedNetwork {
        assert(nNodes > 0, `nNodes must be larger than 0 but is ${nNodes}`);
        assert(0 <= ratedProbability && ratedProbability <= 1, `0 <= ratedProbability <= 1 must hold, but it is ${ratedProbability} instead`);
        assert(lower < upper, `Lower must be smaller than upper but they are ${lower} and ${upper} respectively`);
        let network = this.randomNetwork(nNodes, lower, upper);
        let ratings = this.randomRatings(nNodes, ratedProbability);
        return new RatedNetwork(new UserProfile(network), ratings);
    }   

    /**
     * Creates a randomly generated list of node ratings
     * @param nNodes number of nodes in the network
     * @param ratedProbability probability of rating a node
     * @returns array of randomly generated node ratings
     */
    static randomRatings(nNodes:number, ratedProbability:number = ratedProbabilityDefault) : Rating[] {
        assert(nNodes > 0, `nNodes must be larger than 0 but is ${nNodes}`);
        assert(0 <= ratedProbability && ratedProbability <= 1, `0 <= ratedProbability <= 1 must hold, but it is ${ratedProbability} instead`);
        var ratings: Rating[] = [];
        for (let i = 0; i < nNodes; i++) 
            if (Math.random() < ratedProbability) 
                ratings.push(<Rating>(Math.floor(Math.random() * 5)+1));
            else
                ratings.push(null);
        return ratings;
    }

    /**
     * Generates a random nNodes x nNodes network, with edge values between lower and upper.
     * @param nNodes number of nodes in the network
     * @param upper maximum edge value
     * @param lower minimum edge value
     * @returns randomly generated network
     */
    static randomNetwork(nNodes:number, lower:number = lowerDefault, upper:number = upperDefault) : number[][] {
        assert(lower < upper, `Lower must be smaller than upper but they are ${lower} and ${upper} respectively`);
        assert(nNodes > 0, `nNodes must be larger than 0 but is ${nNodes}`);
        var network: number[][] = twoDimensionalArray(nNodes, nNodes, 0);
        for (let i = 0; i < nNodes; i++)
            for (let j = i+1; j < nNodes; j++) {
                let val = Math.random() * (upper-lower) + lower;
                network[i][j] = val;
                network[j][i] = val;
            }
        return network;
    }
}