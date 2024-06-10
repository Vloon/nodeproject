import assert from 'assert';
import { RatedNetwork } from './rated-network'; 
import { Rating } from './rating';

export class NetworkGenerator {

    /**
     * Creates a random rated network.
     * @param nNodes number of nodes in the network
     * @param lower minimum similarity value of an edge
     * @param upper maximum similarity value of an edge
     * @param ratedProbability probability of a node being rated, allows the network to come with pre-rated nodes
     * @returns the rated network consisting of an adjacency matrix + a rating for each node.
     */
   static generateRandomNetwork(nNodes:number, lower:number = 0, upper:number = 1, ratedProbability:number=0): RatedNetwork {
        assert(0 <= ratedProbability && ratedProbability <= 1, `0 <= ratedProbability <= 1 must hold, but it is ${ratedProbability} instead`);
        let network = this.randomNetwork(nNodes, upper, lower);
        let ratings = this.randomRatings(nNodes, ratedProbability);
        return new RatedNetwork(network, ratings);
    }   

    private static randomRatings(nNodes:number, ratedProbability:number) : Rating[] {
        var ratings: Rating[] = [];
        for (let i = 0; i < nNodes; i++) 
            if (Math.random() < ratedProbability) 
                ratings.push(<Rating>(Math.floor(Math.random() * 5)+1));
            else
                ratings.push(null);
        return ratings;
    }

    private static randomNetwork(nNodes:number, upper:number, lower:number) : number[][] {
        // Initialize network to be N x N 
        var network: number[][] = Array<number[]>(nNodes).fill(Array<number>(nNodes).fill(0));
        // Fill network
        for (let i = 0; i < nNodes; i++)
            for (let j = i+1; j < nNodes; j++) {
                let val = Math.random() * (upper-lower) + lower;
                network[i][j] = val;
                network[j][i] = val;
            }
        return network;
    }
}