import { cloneDeep } from "lodash";
import { matrixVectorMultiplication } from "./matrix";
import { RatedNetwork } from "./rated-network";
import { User } from "./user";

/**
 * These two constants describe in some sense the exporation vs exploitation of the recommendation algorithm. 
 *  - The value of ratingRescaleFactor describes where the boundary is between a rating that we would like to recommend vs a rating which we would rather not.
 *    E.g. when you have a 3 star node, would you rather recommend a similar, or dissimilar node? 
 *  - The unratedStarRatingDefault is the implicit star rating of an unrated node. 
 *    E.g. when you have a 3 star node,, would you rather keep recommending similar nodes, or would you rather recommend an unknown node.
 *  - 1...2.|.3...4...5  
 *          ^            
 *  The bar represents the division between what is seen as "bad" vs "good" ratings, the arrow indicates where the unknown nodes are located on this spectrum.
 */
const ratingRescaleFactorDefault = 2.5; 
const unratedStarRatingDefault = 2.5; 

/**
 * Recommendation algorithms can recommend a next node index given a ratedNetwork (which consist of a similarity network + ratings list).
 */
export abstract class RecommendationAlgorithm {
    abstract recommend(rnet:RatedNetwork): number;
    private ratingRescaleFactor:number = ratingRescaleFactorDefault;
    private unratedStarRating:number = unratedStarRatingDefault;
    
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
        let recommendVector = matrixVectorMultiplication(rescaledNetwork, rescaledRatings); 
        return recommendVector;
    }
}

export class GreedyRecommendationAlgorithm extends RecommendationAlgorithm {
    /**
     * Recommends the next node deterministically, best to worst
     * @param rnet the RatedNetwork of the user
     * @returns node index of the recommended node
     */
    recommend(rnet:RatedNetwork): number {
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
    recommend(rnet:RatedNetwork): number {
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

