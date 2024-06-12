import { UserProfile } from "./user-profile";
import { RatedNetwork } from "./rated-network";
import { Rating } from "./rating";
import { AssertionError } from "assert";
import { twoDimArray } from './matrix';

export class User {
    ratedNetwork:RatedNetwork;

    constructor(profile:UserProfile|null = null, ratings:Rating[]|null = null) {
        if (profile === null) {
            if (ratings === null) throw new AssertionError({message:`If profile is not passed, ratings must be passed`});
            let nNodes = ratings.length;
            let simNetwork = twoDimArray(nNodes, nNodes, 0);
            profile = new UserProfile(simNetwork);
        }
        if (ratings === null)  {
            if (profile === null) throw new AssertionError({message:`If ratings is not passed, profile must be passed`});
            let nNodes = profile.length;
            ratings = Array<Rating>(nNodes).fill(null);
        }
        this.ratedNetwork = new RatedNetwork(profile, ratings); 
        // More user-specific information...
    }

    getRatings(): Rating[] {
        return this.ratedNetwork.ratings;
    }

    getProfile(): UserProfile {
        return this.ratedNetwork.profile;
    }

}