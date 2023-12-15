import { JumpPoint, NJumpPoint, JumpPointBaseNode, JumpPointRoot, JumpPointNode } from "./interfaces";



export class JumpList {
    private node: JumpPointBaseNode;
    private root: JumpPointRoot;
    private len: number = 0;
    private max: number = 0;

    constructor(max: number = 100) {
        this.max = max;
        this.root = new JumpPointRoot();
        this.node = this.root;
        return;
    }

    private valid(): boolean {
        return this.getLength() > 0;
    }

    private popleft(): void {
        if (this.root.hasNext()) {
            this.root.next = this.root.next!.next
        }
    }
    private push(jumpPoint: JumpPoint): void {
        this.getJumpPointNode().next =
            new JumpPointNode(jumpPoint, this.getJumpPointNode());
        this.len += 1
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
            this.node = this.node.next as JumpPointNode
        }
        return;
    }

    private goToPrevious(): void {
        if (this.hasPrevious()) {
            this.node = this.node.prev as JumpPointNode;
        }
        return;
    }
    private deleteAfterCurrent(): void {
        let next = this.getJumpPointNode().next;
        while (next != null){
            this.len -= 1
            next = next.next
        }
        this.getJumpPointNode().disconnectNext()
        return;
    }

    private limitSize(): void {
        while (this.getLength() > this.max) {
            this.len -= 1;
            this.popleft();
        }
        return;
    }

    private getNJumpPoint(): NJumpPoint {
        if (this.getLength() == 0) {
            return null;
        }
        return this.node.val;
    }

    private getJumpPoint(): JumpPoint {
        return this.node.val as JumpPoint;
    }

    private getJumpPointNode(): JumpPointNode {
        return this.node;
    }

    public registerJump(jump: NJumpPoint): void {
        if (jump == null) { return; }
        if (jump.equals(this.getNJumpPoint())) {
            this.getJumpPoint().col = jump.col;
            this.getJumpPoint().row = jump.row;
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

    public getRoot(): JumpPointRoot {
        return this.root;
    }

}
