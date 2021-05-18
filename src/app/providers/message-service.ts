import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { MessageType } from 'src/global/enums';
/**
 * 跨组件通讯
 */
@Injectable()
export class MessageService{
    private subject=new Subject<any>();
    observable=this.subject.asObservable();
    emit(msg:{type:MessageType,data?:any}){
        this.subject.next(msg);
    }
}