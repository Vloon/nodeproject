import { NetworkGenerator } from './network-generator';
import { RatedNetwork } from './rated-network';
import { Rating } from './rating';
import { GreedyRecommendationAlgorithm, ProbabilisticRecommendationAlgorithm, RecommendationAlgorithm } from './recommendation-algorithm';

const nNodes = 3;
// var ratedNetwork = NetworkGenerator.generateRandomNetwork(nNodes, 0, 1, 0);
let adjacency:number[][] = [[0  , 0.1, 0.5, 0  , 0  , 0  ],
                            [0.1, 0  , 0.9, 0  , 0  , 0  ],
                            [0.5, 0.9, 0  , 0  , 0  , 0  ],
                            [0  , 0  , 0  , 0  , 0.1, 0.5],
                            [0  , 0  , 0  , 0.1, 0  , 0.9],
                            [0  , 0  , 0  , 0.5, 0.9, 0  ]];

let ratings:Rating[] = Array(adjacency.length).fill(null);
let ratedNetwork = new RatedNetwork(adjacency, ratings);
let greeAlgorithm:RecommendationAlgorithm = new GreedyRecommendationAlgorithm();
let probAlgorithm:RecommendationAlgorithm = new ProbabilisticRecommendationAlgorithm();

// let gRecNode = greeAlgorithm.recommend(ratedNetwork);
// let pRecNode = probAlgorithm.recommend(ratedNetwork);

// console.log(`Greedy recommended node: ${gRecNode}`);
// console.log(`Probab recommended node: ${pRecNode}`);

// ratedNetwork.addRating(4, 1);
// console.log(`Rated node 5 with a 1`);
// console.table(ratedNetwork.toString());
// let recNode = algorithm.recommend(ratedNetwork);
// console.log(`Recommended node: ${recNode}`);

// ratedNetwork.addRating(1, 5);
// console.log(`Rated node 2 with a 5`);
// console.table(ratedNetwork.toString());
// recNode = algorithm.recommend(ratedNetwork);
// console.log(`Recommended node: ${recNode}`);

let iter = 0;
while (ratedNetwork.hasUnrated()) {
    console.table(ratedNetwork.toString());
    let pRecNode = probAlgorithm.recommend(ratedNetwork);
    let gRecNode = greeAlgorithm.recommend(ratedNetwork);
    let newRating = <Rating>Math.floor(Math.random()*5+1);
    console.log(`${iter}: recommended node ${pRecNode+1} (g:${gRecNode+1}), rated it with ${newRating}`);
    ratedNetwork.addRating(pRecNode, newRating);
    iter++;
}

console.log('\nFinal network:');
console.table(ratedNetwork.toString());
