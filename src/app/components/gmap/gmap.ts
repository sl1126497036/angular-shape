/// <reference types="google.maps" />
import { MessageService } from './../../providers/message-service';
import { ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { Component } from "@angular/core";
import { MessageType } from 'src/global/enums';
import * as shp from 'shpjs';
import { locations } from 'src/global/location';
import MarkerClusterer from '@googlemaps/markerclustererplus';

@Component({
    selector: 'gmap',
    templateUrl: './gmap.html',
    styleUrls: ['./gmap.scss']
})
export class GmapComponent implements OnInit, OnChanges {
    polygon: any = null;
    markerClusterer:any=null;
    loading = false;
    gmap: any;
    @ViewChild("map")
    mapDiv: ElementRef;
    constructor(private msService: MessageService) {
    }
    ngOnInit(): void {
        // this.getLocation();//
    }
    ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
    }
    ngAfterViewInit() {
        this.initMap();
        this.msService.observable.subscribe(msg => {
            const { type, data } = msg;
            switch (type) {
                case MessageType.ADD_MARKERS:
                    // locations = locations.concat(data);
                    this.addMarkers();
                    break;
                case MessageType.RESET_MAP:
                    this.initMap();
                    break;
                case MessageType.USE_SHAPE_FILE:
                    this.initMap();
                    this.analysisShapeFile(data);
                    break;
                case MessageType.SET_CENTER:
                    const { lat, lng } = data;
                    this.gmap.setCenter({ lat, lng });//将标记点作为新的中心
                    break;
            }
        });
    }
    // getLocation(){//获取当前位置
    //     navigator.geolocation.getCurrentPosition((position)=>{
    //         console.log(position);
    //     });
    // }

    /**
     * 初始化地图
     */
    initMap() {
        if (this.gmap) {
            this.gmap.setCenter({ lat: 30.5481, lng: 104.0412 });//以成都为中心
            this.gmap.setZoom(10);
        } else {
            const mapProperties = {
                center: new google.maps.LatLng(30.5481, 104.0412),
                zoom: 10,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            this.gmap = new google.maps.Map(this.mapDiv.nativeElement, mapProperties);
        }
        this.clearMarkers();
        this.clearPolygon();
    }
    /**
     * 解析shape文件
     * @param file 
     */
    analysisShapeFile(file) {
        //https://github.com/calvinmetcalf/shapefile-js
        //https://stackoverflow.com/questions/54349858/angular-7-uncaught-referenceerror-global-is-not-defined-when-adding-package
        const reader = new FileReader();
        this.loading = true;
        reader.onload = (e) => {
            locations.splice(0,locations.length);
            const arrayBuffer = shp.parseShp(e.target.result);
            const { coordinates } = arrayBuffer[arrayBuffer.length - 1];
            if (coordinates && coordinates[0] && coordinates[0][0]) {//中心移至澳大利亚某处
                this.gmap.setCenter({ lat: coordinates[0][0][1], lng: coordinates[0][0][0] });
                this.gmap.setZoom(4);
            }
            arrayBuffer.map(item => {
                this.gmap.data.addGeoJson({//使用GeoJson格式
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "geometry": item
                        }
                    ]
                });
            });
            this.loading = false;
        }
        reader.onerror = (e) => {
            console.error(e);
        };
        reader.readAsArrayBuffer(file);
    }
    /**
     * 往地图上批量添加标记
     */
    addMarkers() {
        const markers = locations.map(item => {
            return new google.maps.Marker({
                position: item,
                label: item.id,
            });
        });
        this.markerClusterer = new MarkerClusterer(this.gmap, markers, { imagePath: '../../../assets/markers/m' }); 
    }
   
    /**
     * 清除所有标记
     */
    clearMarkers() {
        if (this.markerClusterer) {
            this.markerClusterer.clearMarkers();
        }
        this.markerClusterer=null;
    }
    /**
   * 清除Polygon
   */
    clearPolygon() {
        this.polygon && this.polygon.setMap(null);
        this.polygon = null;
    }
    /**
     * 创建Polygon
     * @param e event
     */
    handleCreatePolygon(e) {
        if (e.button == 2 && locations && locations.length > 0&&this.markerClusterer) {//右键
            const polygonLocations = [];
            this.markerClusterer.getClusters().map(item => {//将Clusters中心作为绘图点
                polygonLocations.push(item.getCenter());
            });
            const polygon = new google.maps.Polygon({
                paths: polygonLocations,
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
            });
            polygon.setMap(this.gmap);
            this.clearMarkers();
            this.polygon = polygon;
            locations.splice(0,locations.length);//清空markers列表
            this.msService.emit({ type: MessageType.CLEAR_LOCATIONS });
        }
    }
    /**
     * 修改Polygon颜色(fillColor和strokeColor)
     */
    handleChangePolygonColor() {
        if (this.polygon) {
            this.polygon.setOptions({ fillColor: this.getRandomColor(), strokeColor: this.getRandomColor() });
        }
    }
    /**
     * 创建一个随机色
     * @returns 返回16进制随机色
     */
    getRandomColor() {
        return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).substr(-6);
    }

}