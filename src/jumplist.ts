import { IJumpPoint } from "./interfaces";


export class JumpList {
    private jumpList: IJumpPoint[] = [];
    private id: number = -1;
    private max: number = -1;

    constructor(max: number = 100) {
        this.max = max
    }

    public registerJump(jump: IJumpPoint): void {
        while (this.jumpList.length - 1 > this.id){
            this.jumpList.pop();
        }
        this.jumpList.push(jump)
        this.id += 1;
        while (this.jumpList.length > this.max) {
            this.id -= 1;
            this.jumpList.shift();
        }
        return
    }

    public jumpForward(): IJumpPoint | null {
        if (this.jumpList.length == 0) {
            return null;
        }
        if (this.id < this.jumpList.length - 1) {
            this.id += 1;
        }
        return this.jumpList[this.id];
    }

    public jumpBack(): IJumpPoint | null {
        if (this.jumpList.length == 0) {
            return null;
        }
        if (this.id > 0) {
            this.id -= 1;
        }
        return this.jumpList[this.id];
    }
}
