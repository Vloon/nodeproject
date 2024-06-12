import assert from 'assert';
import { RatedNetwork } from './rated-network'; 
import { Rating } from './rating';
import { twoDimArray } from './matrix';
import { UserProfile } from './user-profile';

export class NetworkGenerator {

    /**
     * Creates a random rated network, consisting of an adjacency matrix + a rating for each node.
     * @param nNodes number of nodes in the network
     * @param lower minimum value of an edge
     * @param upper maximum value of an edge
     * @param ratedProbability probability of a node being rated, allows the network to come with pre-rated nodes
     * @returns random rated network
     */
   static randomRatedNetwork(nNodes:number, lower:number = 0, upper:number = 1, ratedProbability:number=0): RatedNetwork {
        assert(0 <= ratedProbability && ratedProbability <= 1, `0 <= ratedProbability <= 1 must hold, but it is ${ratedProbability} instead`);
        let network = this.randomNetwork(nNodes, upper, lower);
        let ratings = this.randomRatings(nNodes, ratedProbability);
        return new RatedNetwork(new UserProfile(network), ratings);
    }   

    /**
     * Creates a randomly generated list of node ratings
     * @param nNodes number of nodes in the network
     * @param ratedProbability probability of rating a node
     * @returns array of randomly generated node ratings
     */
    static randomRatings(nNodes:number, ratedProbability:number) : Rating[] {
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
    static randomNetwork(nNodes:number, upper:number, lower:number) : number[][] {
        var network: number[][] = twoDimArray(nNodes, nNodes, 0);
        for (let i = 0; i < nNodes; i++)
            for (let j = i+1; j < nNodes; j++) {
                let val = Math.random() * (upper-lower) + lower;
                network[i][j] = val;
                network[j][i] = val;
            }
        return network;
    }
}