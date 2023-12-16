import { JumpPoint, NJumpPoint, JumpPointRoot, JumpPointNode } from './jumppoint';


export class JumpList {
    private root: JumpPointRoot;
    private node: JumpPointNode;
    private len: number = 0;
    private max: number = 0;

    constructor(max: number) {
        this.max = max;
        this.root = new JumpPointRoot();
        this.node = this.root;
        return;
    }

    private popleft(): void {
        if (this.root.hasNext()) {
            const next = this.root.next as JumpPointNode;
            next.prev = null;
            this.root.next = next.next;
            this.len -= 1;
        }
    }

    private push(jumpPoint: JumpPoint): void {
        this.getJumpPointNode().next =
            new JumpPointNode(jumpPoint, this.getJumpPointNode());
        this.len += 1;
        this.goToNext();
    }

    private getLength(): number {
        return this.len;
    }

    private hasNext(): boolean {
        return this.node.next != null;
    }

    private hasPrevious(): boolean {
        return this.node.prev != null && this.node.prev != this.root;
    }

    private goToNext(): void{
        if (this.hasNext()) {
            this.node = this.node.next!;
        }
        return;
    }

    private goToPrevious(): void {
        if (this.hasPrevious()) {
            this.node = this.node.prev!;
        }
        return;
    }

    private deleteAfterCurrent(): void {
        let next = this.getJumpPointNode().next;
        while (next != null){
            this.len -= 1;
            next = next.next;
        }
        this.getJumpPointNode().disconnectNext();
        return;
    }

    private limitSize(): void {
        while (this.getLength() > this.max) {
            this.popleft();
        }
        return;
    }

    private getNJumpPoint(): NJumpPoint {
        return this.node.val;
    }

    private getJumpPoint(): JumpPoint {
        return this.node.val as JumpPoint;
    }

    private getJumpPointNode(): JumpPointNode {
        return this.node;
    }

    private amendJump(jump: NJumpPoint): boolean {
        if (jump == null) {return true;}
        if (jump.equals(this.getNJumpPoint())) {
            this.getJumpPoint().col = jump.col;
            this.getJumpPoint().row = jump.row;
            return true;
        }
        return false;
    }

    public registerJump(jump: NJumpPoint): void {
        if (!this.amendJump(jump)) {
            this.internalRegisterJump(jump);
        }
        return;
    }

    public internalRegisterJump(jump: NJumpPoint): void {
        if (jump == null) {return;}
        if (jump.equals(this.getJumpPoint())) {
            this.goToPrevious();
        }
        this.deleteAfterCurrent();
        this.push(jump);
        this.limitSize();
        return;
    }

    public jumpForward(jump: NJumpPoint): NJumpPoint {
        this.amendJump(jump);
        this.goToNext();
        return this.getNJumpPoint();
    }

    public jumpBack(jump: NJumpPoint): NJumpPoint {
        this.registerJump(jump)
        this.goToPrevious();
        return this.getNJumpPoint();
    }

    public getRoot(): JumpPointRoot {
        return this.root;
    }

}
