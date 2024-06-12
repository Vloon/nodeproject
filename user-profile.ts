
export class UserProfile {
    similarityNetwork:number[][];
    length:number;

    constructor(similarityNetwork:number[][]) {
        this.similarityNetwork = similarityNetwork;
        this.length = similarityNetwork.length;
    }
}