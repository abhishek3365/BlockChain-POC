import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Constants } from "../utils/constants";
import { Player } from "../model/player";



@Injectable()
export class PlayerServices{

    playerCount : number;
    players : Player[];

    constructor( public http : HttpClient ){
        this.playerCount = undefined
        this.players = [];
    }

    getPlayerCount(   ){
        return new Promise( ( resolve , reject ) => {

            if( this.playerCount != undefined ){
                resolve( this.playerCount );
            }

            this.http.get<{ success : boolean , payload : number }>( Constants.BASE_URL + 'playerCount')
            .subscribe( (data) => {
                this.playerCount = data.payload;
                resolve( this.playerCount );
            } );
        })
    }

    getPlayers ( offset : number , limit : number ){
        
        return new Promise( ( resolve , reject ) => {

            if( (offset+limit) > this.playerCount ){
                limit = this.playerCount - offset;
            }

            if( (offset+limit) < this.players.length ){
                resolve( this.players.slice( offset , offset+limit ) );
            }   

            this.http.post<{ success : boolean , payload : Player[] }>( Constants.BASE_URL + 'players' , { offset , limit })
                .subscribe( (data) => {
                    this.players = this.players.concat( data.payload )
                    resolve( data.payload );
            } );
        })
    }
    
}