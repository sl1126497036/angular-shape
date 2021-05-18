import { OnInit } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isVertical=false;
  ngOnInit(): void {
    this.checkScreen();
    window.onresize=()=>{
      this.checkScreen();
    }
  }
  checkScreen(){
    this.isVertical = window.innerHeight > window.innerWidth;
  }

}
