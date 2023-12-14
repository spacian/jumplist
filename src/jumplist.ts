import { JumpPoint } from "./interfaces";


export class JumpList {
    private jumpList: JumpPoint[] = [];
    private id: number = -1;
    private max: number = -1;

    constructor(max: number = 100) {
        this.max = max
    }

    private getJumpPoint(): JumpPoint | null {
        if (this.jumpList.length == 0) {
            return null
        }
        return this.jumpList[this.id]
    }

    public registerJump(jump: JumpPoint): void {
        if (jump.equals(this.getJumpPoint())) {return}
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

    public jumpForward(): JumpPoint | null {
        if (this.jumpList.length == 0) {
            return null;
        }
        if (this.id < this.jumpList.length - 1) {
            this.id += 1;
        }
        return this.jumpList[this.id];
    }

    public jumpBack(jumpPoint: JumpPoint | null): JumpPoint | null {
        if (this.jumpList.length == 0) {
            return null;
        }
        if (jumpPoint != null) {
            this.registerJump(jumpPoint)
        }
        if (this.id > 0) {
            this.id -= 1;
        }
        return this.jumpList[this.id];
    }
}
