import { JumpPoint, NJumpPoint } from "./interfaces";



export class JumpList {
    private jumpList: JumpPoint[] = [];
    private id: number = -1;
    private max: number = -1;

    constructor(max: number = 100) {
        this.max = max;
    }

    private valid(): boolean {
        return this.getLength() > 0;
    }

    private pop(): void {
        this.jumpList.pop();
        return;
    }

    private popleft(): void {
        this.jumpList.shift();
        return;
    }

    private push(jumpPoint: JumpPoint): void {
        this.jumpList.push(jumpPoint);
        this.id += 1;
    }

    private getLength(): number {
        return this.jumpList.length;
    }

    private hasNext(): boolean {
        return this.id < this.getLength() - 1;
    }

    private hasPrevious(): boolean {
        return this.id > 0;
    }

    private goToNext(): void{
        if (this.hasNext()) {
            this.id += 1;
        }
        return;
    }

    private goToPrevious(): void {
        if (this.hasPrevious()) {
            this.id -= 1;
        }
        return;
    }
    private deleteAfterCurrent(): void {
        while (this.getLength() - 1 > this.id){
            this.pop();
        }
        return;
    }

    private limitSize(): void {
        while (this.getLength() > this.max) {
            this.id -= 1;
            this.popleft();
        }
        return;
    }

    private getNJumpPoint(): NJumpPoint {
        if (this.getLength() == 0) {
            return null;
        }
        return this.jumpList[this.id];
    }

    private getJumpPoint(): JumpPoint {
        return this.jumpList[this.id];
    }

    public registerJump(jump: NJumpPoint): void {
        if (jump == null) { return; }
        if (jump.equals(this.getNJumpPoint())) {
            this.getJumpPoint().col = jump.col;
            return
        }
        this.deleteAfterCurrent();
        this.push(jump);
        this.limitSize();
        return
    }

    public jumpForward(): NJumpPoint {
        if (!this.valid()) {
            return null;
        }
        this.goToNext();
        return this.getNJumpPoint();
    }

    public jumpBack(jumpPoint: NJumpPoint): NJumpPoint {
        if (!this.valid()) {
            return null;
        }
        this.registerJump(jumpPoint);
        this.goToPrevious();
        return this.getNJumpPoint();
    }

    public entries(): JumpPoint[] {
        return this.jumpList;
    }

}
