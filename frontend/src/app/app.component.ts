import { Component } from '@angular/core';
import { PlayerServices } from './services/player.service';
import { Player } from './model/player';
import { PageEvent } from '@angular/material';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource : Player[];
  
  showLoader : boolean
  playerCount : number

  title = 'app';

  constructor( public playerServices : PlayerServices ) {
    this.showLoader = false;
    this.playerCount = 0;

    this.dataSource = [];

    playerServices.getPlayerCount( )
      .then( (playerCount : number) => {
        this.playerCount = playerCount
    } )

    this.getPlayers( 0, 10 );

  }

  onPageEvent(pageEvent : PageEvent){
    if( pageEvent.previousPageIndex != pageEvent.pageIndex ){
      this.dataSource = [];
      this.getPlayers( pageEvent.pageIndex * pageEvent.pageSize , pageEvent.pageSize )
    }
  }

  getPlayers( offset , limit ){
    this.playerServices.getPlayers( offset , limit )
      .then( ( players : Player[] ) => {
        this.dataSource = players;
    } )
  }
  
}
