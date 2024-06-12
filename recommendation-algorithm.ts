import { cloneDeep } from "lodash";
import { matVecMul } from "./matrix";
import { RatedNetwork } from "./rated-network";
import { User } from "./user";

export abstract class RecommendationAlgorithm {
    abstract recommend(user:User): number;
    private ratingRescaleFactor:number;
    private unratedStarRating:number;
    
    constructor(ratingRescaleFactor:number = 2.5, unRatedStarRating:number = 2.5) {
        this.ratingRescaleFactor = ratingRescaleFactor;
        this.unratedStarRating = unRatedStarRating;
    }

    /**
     * Calculates the recommendation vector, which ranks nodes based on similarity to rated nodes, also includes 
     * a small bonus for giving more information about unranked nodes.
     * @param _rnet the RatedNetwork of this object
     * @returns Vector containing the recommendation values
     */
    protected getRecommendationVector(_rnet:RatedNetwork): number[] {
        let rnet = cloneDeep(_rnet);
        const networkRescaleFactor = (rnet.upper-rnet.lower)/2;
        let rescaledNetwork = rnet.profile.similarityNetwork;
        // Rescale the network
        rescaledNetwork = rescaledNetwork.map((row) => row.map((elem) => elem-networkRescaleFactor)); 
        // Replace all non-rated items (nulls) with their star rating equivalent
        let rescaledRatings = rnet.ratings.map((e) => {return (e===null) ? this.unratedStarRating : e;});
        // Rescale the ratings
        rescaledRatings = rescaledRatings.map((e) => e-this.ratingRescaleFactor);
        // Find the recommendation vector as the matrix-vector multiplication of the rescaled rated network
        let recommendVector = matVecMul(rescaledNetwork, rescaledRatings); 
        return recommendVector;
    }
}

export class GreedyRecommendationAlgorithm extends RecommendationAlgorithm {
    /**
     * Recommends the next node deterministically, best to worst
     * @param rnet the RatedNetwork of the user
     * @returns node index of the recommended node
     */
    recommend(user:User): number {
        let rnet = user.ratedNetwork;
        let recommendVector = this.getRecommendationVector(rnet);
        let minVal = recommendVector.reduce((e1, e2) => (e1 < e2) ? e1 : e2);
        // "Remove" (by reducing their recommendation score) already rated elements to not recommend the same item twice
        Array.from(rnet.ratings.entries()).forEach(([i, r]) => {if (r!==null) recommendVector[i] = minVal-1;});
        // Return the index of the highest recommended element
        let recommendation = Array.from(recommendVector.entries()).reduce(([i1, e1], [i2, e2]) => (e1 > e2) ? [i1, e1] : [i2, e2]);       
        return recommendation[0];
    }
}

export class ProbabilisticRecommendationAlgorithm extends RecommendationAlgorithm {
    /**
     * Recommends the next node probabilisitcally, where the probability of the recommendation 
     * is proportional to the recommendation values as calculated by getRecommendationVector.
     * @param rnet A copy of the RatedNetwork of this object
     * @returns node index of the recommended node
     */
    recommend(user:User): number {
        let rnet = user.ratedNetwork;
        let recommendVector = this.getRecommendationVector(rnet);
        rnet.ratings.forEach((r, i) => {if (r!==null) recommendVector[i] = 0});
        if (recommendVector.every((e) => e === recommendVector[0]))
            //Deal with uniform distribution (which results in zero-sum normalization)
            recommendVector = Array(recommendVector.length).fill(1/recommendVector.length);
        else {
            // Rescale recommendVector to be a valid distribution
            let sum = recommendVector.reduce((e1, e2) => e1+e2);
            recommendVector = recommendVector.map((e) => e/sum);
        }

        // Create a valid cumulutive distribution, while remembering which node is which
        let distribution = Array.from(recommendVector.entries());
        distribution.sort(([i1,r1], [i2,r2]) => r1-r2);
        
        let cdist:[number, number][] = [];
        let prev = 0;
        for (let [i, p] of distribution) {
            cdist.push([i, p+prev]);
            prev += p;
        }
        // Now we can sample from this discrete cumulative distirbution
        let u = Math.random();
        for (let [i, cp] of cdist) 
            if (u < cp) return i;

        throw new Error(`The cumulative distribution is invalid. (u=${u}) \n ${cdist.map(([i,cp]) => cp)}.`);
    }
}

