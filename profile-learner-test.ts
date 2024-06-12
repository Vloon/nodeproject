import { AverageLearner, KMeansLearner } from "./profile-learner";
import { Rating } from "./rating";
import { User } from "./user";

function clip(x:number, min:number, max:number): number {
    return Math.max(Math.min(x, max), min);
}

let nUsers = 9;
let nNodes = 6;
let minRating = 1;
let maxRating = 5;
let groundTruthRatings:number[][] = [[5,5,3,3,1,1],
                                     [3,3,1,1,5,5],
                                     [1,1,5,5,3,3]];
let k = groundTruthRatings.length;                       
let noiseLevel = 0.5             
let ratings:number[][] = Array(nUsers).fill(Array(nNodes));
for (let i = 0; i < ratings.length; i++) {
    // Determine for each rating whether to mutate it, and which direction to offset the value
    let offset = Array(nNodes).fill(0).map(() => (Math.floor(Math.random()*2)-1)*2+1); // Random -1 or 1 vector    
    let mutate = Array(nNodes).fill(false).map(()=>Math.random() < noiseLevel);
    // Update ground truth rating with mutation
    let userRating = groundTruthRatings[i%k].map((u, i) => {return (mutate[i]) ? clip(u+offset[i], minRating, maxRating) : u});
    ratings[i] = userRating;
}
let users:User[] = ratings.map((r) => new User(null, <Rating[]>r));

// console.log('Average');

// let avgLearner = new AverageLearner();
// let [avgProfile] = avgLearner.learnProfile(users);
// console.table(avgProfile.similarityNetwork);

// console.log('\nK-means');

let kLearner = new KMeansLearner();
let kProfiles = kLearner.learnProfile(users);
// for (let profile of kProfiles)
//     console.table(profile.similarityNetwork);

