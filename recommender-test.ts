import { NetworkGenerator } from './network-generator';
import { Rating } from './rating';
import { GreedyRecommendationAlgorithm, ProbabilisticRecommendationAlgorithm, RecommendationAlgorithm } from './recommendation-algorithm';
import { User } from './user';
import { UserProfile } from './user-profile';

let greedyAlgorithm:RecommendationAlgorithm = new GreedyRecommendationAlgorithm();
let probabilisticAlgorithm:RecommendationAlgorithm = new ProbabilisticRecommendationAlgorithm();

/**
 * Define a user with predefined adjacency.
 */
let adjacency:number[][] = [[0  , 0.1, 0.5, 0  , 0  , 0  ],
                            [0.1, 0  , 0.9, 0  , 0  , 0  ],
                            [0.5, 0.9, 0  , 0  , 0  , 0  ],
                            [0  , 0  , 0  , 0  , 0.1, 0.5],
                            [0  , 0  , 0  , 0.1, 0  , 0.9],
                            [0  , 0  , 0  , 0.5, 0.9, 0  ]];

let userProfile:UserProfile = new UserProfile(adjacency);
let user = new User(userProfile);

// Simulation of the user being recommended items, trying, and then rating those.
let iter = 0;
while (user.ratedNetwork.hasUnrated()) {
    console.table(user.ratedNetwork.toString());
    let probabilisticRecommendedNode = probabilisticAlgorithm.recommend(user.ratedNetwork);
    let greedyRecommendedNode = greedyAlgorithm.recommend(user.ratedNetwork);
    let newRating = <Rating>Math.floor(Math.random()*5+1);
    console.log(`${iter}: recommended node ${probabilisticRecommendedNode+1} (g:${greedyRecommendedNode+1}), rated it with ${newRating}`);
    user.ratedNetwork.addRating(probabilisticRecommendedNode, newRating);
    iter++;
}

console.log('\nFinal network:');
console.table(user.ratedNetwork.toString());

/**
 * Recommend on a random adjacency matrix
 */
adjacency = NetworkGenerator.randomNetwork(5, 0, 1);
userProfile = new UserProfile(adjacency);
user = new User(userProfile);

iter = 0;
while (user.ratedNetwork.hasUnrated()) {
    console.table(user.ratedNetwork.toString());
    let probabilisticRecommendedNode = probabilisticAlgorithm.recommend(user.ratedNetwork);
    let gRecNode = greedyAlgorithm.recommend(user.ratedNetwork);
    let newRating = <Rating>Math.floor(Math.random()*5+1);
    console.log(`${iter}: recommended node ${probabilisticRecommendedNode+1} (g:${gRecNode+1}), rated it with ${newRating}`);
    user.ratedNetwork.addRating(probabilisticRecommendedNode, newRating);
    iter++;
}

console.log('\nFinal network:');
console.table(user.ratedNetwork.toString());