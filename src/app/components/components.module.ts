import { ServicesModule } from './../providers/services.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from "@angular/core";
import { GmapMenuComponent } from "./gmap-menu/gmap-menu";
import { GmapComponent } from "./gmap/gmap";
import { NgxLoadingModule } from 'ngx-loading';

@NgModule({
    imports: [BrowserModule, ServicesModule, NgxLoadingModule],
    declarations: [GmapMenuComponent,GmapComponent],
    exports: [GmapMenuComponent, GmapComponent]
})
export class ComponentsModule { }
