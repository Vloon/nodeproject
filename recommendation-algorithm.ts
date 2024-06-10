import { cloneDeep } from "lodash";
import { matVecMul } from "./matrix";
import { RatedNetwork } from "./rated-network";


export abstract class RecommendationAlgorithm {
    abstract recommend(ratedNetwork:RatedNetwork): number;
    private ratingRescaleFactor:number;
    private unratedStarRating:number;
    
    constructor(ratingRescaleFactor:number = 2.5, unRatedStarRating:number = 2.5) {
        this.ratingRescaleFactor = ratingRescaleFactor;
        this.unratedStarRating = unRatedStarRating;
    }

    /**
     * Calculates the recommendation vector, which ranks nodes based on similarity to rated nodes, also includes 
     * a small bonus for giving more information about unranked nodes.
     * @param _rnet A copy of the RatedNetwork of this object
     * @param lower minimum adjacency (i.e. similarity)
     * @param upper maximum adjacency (i.e. similarity)
     * @returns Vector containing the recommendation values
     */
    protected getRecommendationVector(_rnet:RatedNetwork): number[] {
        let rnet = cloneDeep(_rnet);
        // const ratingRescaleFactor = 2.5;
        const networkRescaleFactor = (rnet.upper-rnet.lower)/2;
        let rescaledNetwork = rnet.network;
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
     * @param rnet A copy of the RatedNetwork of this object
     * @param lower minimum adjacency (i.e. similarity)
     * @param upper maximum adjacency (i.e. similarity)
     * @returns node index
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
     * Recommends the next node deterministically, best to worst
     * @param rnet A copy of the RatedNetwork of this object
     * @param lower minimum adjacency (i.e. similarity)
     * @param upper maximum adjacency (i.e. similarity)
     * @returns node index
     */
    recommend(rnet:RatedNetwork): number {
        let recommendVector = this.getRecommendationVector(rnet);
        rnet.ratings.forEach((r, i) => {if (r!==null) recommendVector[i] = 0});
        // console.log(`pRv:${recommendVector}`);
        if (recommendVector.every((e) => e === recommendVector[0]))
            //Deal with uniform distribution (which results in zero-sum normalization)
            recommendVector = Array(recommendVector.length).fill(1/recommendVector.length);
        else {
            // Rescale recommendVector to be a valid distribution
            // let minVal = recommendVector.reduce((e1, e2) => (e1 < e2) ? e1 : e2);
            // recommendVector = recommendVector.map((e) => e-minVal); 
            let sum = recommendVector.reduce((e1, e2) => e1+e2);
            recommendVector = recommendVector.map((e) => e/sum);
        }
        // console.log(`pRv2:${recommendVector}`);

        // Create a valid cumulutive distribution, while remembering the respective nodes
        let distribution = Array.from(recommendVector.entries());
        distribution.sort(([i1,r1], [i2,r2]) => r1-r2);
        // console.log(distribution);
        
        let cdist:[number, number][] = [];
        let prev = 0;
        for (let [i, p] of distribution) {
            cdist.push([i, p+prev]);
            prev += p;
        }
        // Now we can sample from this discrete distirbution
        let u = Math.random();
        // console.log(`\t u=${u}`);
        // console.table(cdist);
        for (let [i, cp] of cdist) {
            // console.log(`Node ${i}. Is u:${u} smaller than cp:${cp}? ${u < cp}`);
            if (u < cp) return i;
        }
        return 0.1; // This code should never be reached, but who knows?
    }
}

