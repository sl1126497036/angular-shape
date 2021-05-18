import { MessageService } from './../../providers/message-service';
import { ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { Component } from "@angular/core";
import { MessageType } from 'src/global/enums';
import { locations } from 'src/global/location';

@Component({
    selector: 'gmap-menu',
    templateUrl: './gmap-menu.html',
    styleUrls: ['./gmap-menu.scss']
})
export class GmapMenuComponent implements OnInit, OnChanges {
    locations: any = locations;
    checkedLocations: any = [];
    maxLocationsLength = 5000;
    @ViewChild("dataList")
    dataListDiv: ElementRef;
    constructor(private msService: MessageService) {

    }
    ngOnInit(): void {
        this.msService.observable.subscribe(msg => {
            const { type } = msg;
            if (type === MessageType.CLEAR_LOCATIONS) {
                this.checkedLocations = [];
            }
        });
    }
    ngAfterViewInit() {
    }
    ngOnChanges(changes: SimpleChanges): void {
    }

    handleSetCenter(item) {
        if (!this.checkedLocations) {
            this.checkedLocations = [];
        }
        this.msService.emit({ type: MessageType.SET_CENTER, data: item });

    }
    /**
     * 创建随机坐标
     */
    createRandomLocations() {
        for (let i = 0; i < this.maxLocationsLength; i++) {
            locations.push({
                id: i + 1 + "",
                lat: this.createRandomCoordinate(-90, 90),//纬度范围-90, 90
                lng: this.createRandomCoordinate(-180, 180)//经度范围-180, 180
            });
        }
        this.msService.emit({ type: MessageType.ADD_MARKERS });
    }

    handleCreateRandomLocations() {
        locations.splice(0, locations.length);
        this.msService.emit({ type: MessageType.RESET_MAP });//重置地图
        this.createRandomLocations();
        this.dataListDiv.nativeElement.scrollTop = 0;
    }
    /**
   * 生成指定范围的随机数浮点数(默认保留四位小数)
   * @param min  最小值(包含)
   * @param max 最大值(包含)
   * @param dcmPlcs 小数位数
   * @returns 
   */
    createRandomCoordinate(min, max, dcmPlcs?) {
        min = Math.ceil(min);
        max = Math.floor(max);
        const res = Math.floor(Math.random() * (max - min + 1)) + min + Math.random();
        return parseFloat(res.toFixed(dcmPlcs || 4));
    }
    /**
     * 选取本地文件
     */
    handleInputShapeFile() {
        const fileInput = document.createElement('input');
        fileInput.setAttribute("type", "file");
        fileInput.style.display = "none";
        fileInput.onchange = (e: any) => {
            if (e.target.files) {
                const file = e.target.files[0];
                if (file&&file.name.endsWith('.shp')){
                    this.msService.emit({ type: MessageType.USE_SHAPE_FILE, data: file });
                }else{
                    alert("不支持的文件格式");
                }
                fileInput.remove();
            }
        }
        fileInput.click();
    }

}