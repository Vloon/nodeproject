import assert from 'assert';
import { User } from './user';
import { UserProfile } from './user-profile';
import { Rating } from './rating';
import { isEqual, isRectangular, twoDimArray, vectorDist, vectorMean } from './matrix';

export abstract class ProfileLearner {
    abstract learnProfile(users:User[], parameters:any): UserProfile[];
    simFunc = (r1:number, r2:number, s:number=0.1) => Math.exp(-s*(r1-r2)**2);

    /**
     * Calculates the similarity from a set of mean vectors. The simlarity is calculated according to the class' simFunc, 
     * which by default is exp[-s*(r1-r2)^2] with s=0.1, i.e. a shallow bell curve-like function. 
     * @param meanVector the vector representing this userProfile
     * @param steepness steepness of the sigmoid curve
     * @returns the N x N similarity matrix
     */
    protected meanVectorsToSimilarityMatrix(meanVector:number[]): number[][] {
        let nNodes = meanVector.length;
        let similarity:number[][] = twoDimArray(nNodes, nNodes, 0);
        for (let i = 0; i < nNodes-1; i++) 
            for (let j = i+1; j < nNodes; j++) {
                let simVal = this.simFunc(meanVector[i], meanVector[j]);
                similarity[i][j] = simVal;
                similarity[j][i] = simVal;
            }
        return similarity;
    }

    /**
     * Takes the ratings from each user, and replaces the null-values with zeros, and casts it to type number.
     * @param users list of users
     * @returns list of ratings of the users, with zeros instead of null
     */
    protected cleanRatings(users:User[]): number[][] {
        let _ratings:Rating[][] = users.map((u) => u.ratedNetwork.ratings);
        let ratings:number[][] = <number[][]>_ratings.map((r) => (r===null) ? 0 : r);
        return ratings;
    }
}

export class KMeansLearner extends ProfileLearner {

    /**
     * @todo Bug: sometimes cluster[0].length does not exist. 
     * 
     * Performs a single k-means clustering iteration. This consists of:
     *      1) assigning each rating to a cluster based on the distance
     *      2) re-calculating each cluster mean as the mean of the nodes
     * @param ratings the user's ratings
     * @param currentMeans the current cluster means
     * @returns the updated cluster means
     */
    private kMeansIteration(ratings:number[][], currentMeans:number[][]): number[][] {
        assert(isRectangular(ratings), `ratings must be rectangular!`);
        assert(isRectangular(currentMeans), `currentMeans must be rectangular!`);
        let k = currentMeans.length;
        let nUsers = ratings.length;
        let nNodes = ratings[0].length;
        // Assign each rating to a cluster (via the mean's index)
        let pointAssignments: {index:number, value:number[]}[] = [];
        for (let i = 0; i < nUsers; i++) {
            let distances = currentMeans.map((v) => vectorDist(ratings[i], v));
            let indexedDistances = Array.from(distances.entries());
            let [idx, minDistance] = indexedDistances.reduce(([i1,d1], [i2, d2]) => (d1 < d2) ? [i1, d1] : [i2,d2]);
            pointAssignments.push({index:idx, value:ratings[i]});
        }
        // Recalculate the means
        let newMeans: number[][] = twoDimArray(k, nNodes);
        for (let i = 0; i < k; i++) {
            let cluster = pointAssignments.filter((p) => p.index == i).map((p) => p.value);            
            newMeans[i] = vectorMean(cluster); 
        }  
        return newMeans;
    }

    /**
     * Initializes the K-means algorithm, by picking random starting points as cluster means
     * @param ratings ratings for each user, with null replaced by zero
     * @param k number of clusters
     * @returns initialized means, plus an empty array for previous means
     */
    private initKMeans(ratings:number[][], k:number): number[][] {
        assert(k >= 1, `k must be >= 1 but is ${k}`);
        assert(isRectangular(ratings), `ratings must be rectangular, but is not`);
        let nUsers = ratings.length;
        let nNodes = ratings[0].length;
        let startIdx:number[] = Array(k);
        const getRndIdx = () => Math.floor(Math.random()*nUsers);
        for (let i = 0; i < k; i++) {
            let candidateIdx = getRndIdx();
            while (startIdx.includes(candidateIdx))
                candidateIdx = getRndIdx();
            startIdx[i] = candidateIdx;
        }
        let currentMeans:number[][] = startIdx.map((i) => ratings[i]);
        return currentMeans;
    }

    /**
     * Runs K-means clustering
     * @param initMeans initial cluster means
     * @param ratings ratings of all users
     * @param k number of clusters k
     * @returns the learned final cluster means
     */
    private runKMeans(initMeans:number[][], ratings:number[][], k:number): number[][] {
        assert(k >= 1, `k must be >= 1 but is ${k}`);
        assert(isRectangular(ratings), `ratings must be rectangular, but is not`);
        assert(isRectangular(initMeans), `initMeans must be rectangular, but is not`);
        let nNodes = ratings[0].length;
        let currentMeans = initMeans;
        let previousMeans:number[][] = twoDimArray(k, nNodes);
        while (!isEqual(currentMeans, previousMeans)) {
            previousMeans = currentMeans; 
            currentMeans = this.kMeansIteration(ratings, currentMeans);
        }
        return currentMeans;
    }

    /**
     * Learns a set of UserProfiles using K-means clustering. 
     * The K-means algorithm finds cluster means such that there is little variance between the clusters of users in terms of their rating behaviour.
     * Then a similarity network is calculated from these means.
     * @todo implement optimization for k, and remove the need to pass a parameter
     * @param users list of users
     * @param parameters must contains field `k`, which is the number of clusters
     * @returns length k list with UserProfiles, one for each cluster of users
     */
    learnProfile(users: User[], parameters:any = {k:3}): UserProfile[] {
        if (!('k' in parameters)) 
            throw new Error(`Learing of k not yet implemented. k (number of clusters) must be passed as an object property.`)
        
        let nNodes = users[0].ratedNetwork.nNodes;
        let nUsers = users.length;
        assert(parameters.k >=1, `k must be >= 1 but is ${parameters.k}`);
        assert(nUsers >= parameters.k, `nUsers must be >= k, but they are ${nUsers} and ${parameters.k} respectively`);
        assert(users.map((u) => u.ratedNetwork.nNodes).every((n) => n == nNodes), `Users should all have the same shape ratedNetwork, but this is not the case!`);

        let ratings:number[][] = this.cleanRatings(users);
        
        // Intialize k random cluster means at random starting points, then run.
        let initMeans = this.initKMeans(ratings, parameters.k);
        let finalMeans = this.runKMeans(initMeans, ratings, parameters.k);

        // Calculate the profiles based on the final cluster means
        let profiles:UserProfile[] = finalMeans.map((v) => new UserProfile(this.meanVectorsToSimilarityMatrix(v)));
        return profiles;
    }
}

export class AverageLearner extends ProfileLearner {

    /**
     * Learns just a single UserProfile, as the average rating, converted to a similarity matrix. 
     * @param users list of users
     * @returns a list with a single average UserProfile
     */
    learnProfile(users: User[]): UserProfile[] {
        let nNodes = users[0].ratedNetwork.nNodes;
        assert(users.every((u) => u.ratedNetwork.nNodes == nNodes), `Users should all have the same shape ratedNetwork, but this is not the case!`);
        let ratings:number[][] = this.cleanRatings(users);
        // Get mean ratings, and the similarity network
        let averageRating:number[] = vectorMean(ratings);
        let similarity:number[][] = this.meanVectorsToSimilarityMatrix(averageRating);
        return [new UserProfile(similarity)];
    }
}