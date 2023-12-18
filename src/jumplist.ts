import { JumpPoint, NJumpPoint, JumpPointRoot, JumpPointNode } from './jumppoint';


export class JumpList {
    private root: JumpPointRoot;
    private node: JumpPointNode;
    private max: number;
    private insertJumpOnForward: boolean;
    private len: number = 0;

    constructor(max: number, insertJumpOnForward: boolean) {
        this.max = max;
        this.root = new JumpPointRoot();
        this.node = this.root;
        this.insertJumpOnForward = insertJumpOnForward
        return;
    }

    private popLeft(): void {
        if (this.root.hasNext()) {
            const next = this.root.next as JumpPointNode;
            next.prev = null;
            this.root.next = next.next;
            this.len -= 1;
        }
    }

    private insertAfterCurrent(jumpPoint: JumpPoint): void {
        const next = this.getJumpPointNode().next
        this.getJumpPointNode().next =
            new JumpPointNode(jumpPoint, this.getJumpPointNode(), next);
        if (next != null) {
            next.prev = this.getJumpPointNode().next
        }
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
            this.popLeft();
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

    private amendJump(jump: JumpPoint): boolean {
        if (jump.equals(this.getNJumpPoint())) {
            this.getJumpPoint().col = jump.col;
            this.getJumpPoint().row = jump.row;
            return true;
        }
        return false;
    }

    private internalRegisterJump(jump: NJumpPoint): void {
        if (jump == null) {return;}
        if (jump.equals(this.getJumpPoint())) {
            this.goToPrevious();
        }
        this.deleteAfterCurrent();
        this.insertAfterCurrent(jump);
        this.limitSize();
        return;
    }

    public registerJump(jump: NJumpPoint): void {
        if (jump == null) {return;}
        if (!this.amendJump(jump)) {
            this.internalRegisterJump(jump);
        }
        return;
    }

    public jumpForward(jump: NJumpPoint): NJumpPoint {
        if (jump != null) {
            const didAmend = this.amendJump(jump)
            if (!didAmend && this.insertJumpOnForward){
                this.insertAfterCurrent(jump)
            }
        }
        this.goToNext();
        return this.getNJumpPoint();
    }

    public jumpBack(jump: NJumpPoint): NJumpPoint {
        this.registerJump(jump);
        this.goToPrevious();
        return this.getNJumpPoint();
    }

    public getRoot(): JumpPointRoot {
        return this.root;
    }
}
