import { JumpPoint, NJumpPoint, JumpPointRoot, JumpPointNode } from './jump_point';


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
        this.insertJumpOnForward = insertJumpOnForward;
        return;
    }

    private popLeft(): void {
        if (this.root.hasNext()) {
            const next = this.root.next as JumpPointNode;
            next.prev = null;
            this.root.next = next.next;
            this.len -= 1;
        }
        return;
    }

    private insertAfterCurrent(jumpPoint: JumpPoint): void {
        const next = this.getJumpPointNode().next;
        this.getJumpPointNode().next =
            new JumpPointNode(jumpPoint, this.getJumpPointNode(), next);
        if (next != null) {
            next.prev = this.getJumpPointNode().next
        }
        this.len += 1;
        this.goToNext();
        return;
    }

    private getLength(): number {
        return this.len;
    }

    private hasNext(): boolean {
        return this.node.hasNext();
    }

    private hasPrevious(): boolean {
        return this.node.hasPrev();
    }

    private goToNext(): void{
        if (this.hasNext()) {
            this.node = this.node.next!;
        }
        return;
    }

    public goToPrevious(): void {
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

    private internalRegisterJump(jump: JumpPoint): void {
        this.deleteAfterCurrent();
        this.insertAfterCurrent(jump);
        this.limitSize();
        return;
    }

    public registerOrAmendJump(jump: JumpPoint): void {
        const didAmend = this.amendJump(jump);
        if (!didAmend) {
            this.internalRegisterJump(jump);
        }
        return;
    }

    public jumpForward(jump: JumpPoint, insert: boolean): NJumpPoint {
        if (!this.hasNext()) {
            return null;
        }
        const didAmend = this.amendJump(jump)
        if (insert && !didAmend && this.insertJumpOnForward){
            this.insertAfterCurrent(jump);
        }
        this.goToNext();
        return this.getNJumpPoint();
    }

    public jumpBack(jump: JumpPoint, insert: boolean): NJumpPoint {
        if (jump.equalsStrict(this.getNJumpPoint())){
            this.goToPrevious();
            return this.getNJumpPoint();
        }
        else if (jump.equals(this.getNJumpPoint())){
            return this.getNJumpPoint();
        }
        if (insert) {
            this.internalRegisterJump(jump);
            this.goToPrevious();
        }
        return this.getNJumpPoint();
    }

    public getRoot(): JumpPointRoot {
        return this.root;
    }

    public getCurrent(): JumpPointNode {
        return this.getJumpPointNode();
    }

    public deleteNode(node: JumpPointNode): void {
        if (this.getRoot() === node) {return;}
        if (this.getJumpPointNode() === node){
            this.goToPrevious();
        }
        const prev = node.prev!;
        node.delete();
        if (prev != this.getRoot()
            && prev.next != null
            && prev.val!.equals(prev.next.val)
        ) {
            this.deleteNode(prev.next);
        }
        return;
    }
}
