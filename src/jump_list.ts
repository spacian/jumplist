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
            this.root.getNext().delete();
            this.len -= 1;
        }
        return;
    }

    private popRight(): void {
        if (this.root.hasPrev()) {
            this.root.getPrev().delete();
            this.len -= 1;
        }
        return;
    }

    private insertAfterCurrent(jumpPoint: JumpPoint): void {
        const next = this.node.getNext();
        this.node.setNext(new JumpPointNode(jumpPoint, this.node, next));
        next.setPrev(this.node.getNext());
        this.len += 1;
        return;
    }

    private insertBeforeCurrent(jumpPoint: JumpPoint): void {
        const prev = this.node.getPrev();
        this.node.setPrev(new JumpPointNode(jumpPoint, prev, this.node));
        prev.setNext(this.node.getPrev());
        this.len += 1;
        return;
    }

    private goToNext(): void{
        this.cleanup_forwards();
        if (this.node.hasNext()) {
            this.node = this.node.getNext();
        }
        return;
    }

    public goToPrevious(): void {
        this.cleanup_backwards();
        if (this.node.hasPrev()) {
            this.node = this.node.getPrev();
        }
        return;
    }

    private deleteAfterCurrent(): void {
        while (!this.node.getNext().isRoot()) {
            this.node.getNext().delete();
            this.len -= 1;
        }
        return;
    }

    private limitSizeAtStart(): void {
        while (this.len > this.max) {
            this.popLeft();
        }
        return;
    }

    private limitSizeAtEnd(): void {
        while (this.len > this.max) {
            this.popRight();
        }
    }

    private amendJump(jump: JumpPoint): boolean {
        if (jump.equals(this.node.val)) {
            this.node.val!.update(jump.row, jump.col);
            return true;
        }
        return false;
    }

    private internalRegisterJump(jump: JumpPoint): void {
        this.deleteAfterCurrent();
        this.insertAfterCurrent(jump);
        this.limitSizeAtStart();
        return;
    }

    public registerOrAmendJump(jump: JumpPoint): void {
        const didAmend = this.amendJump(jump);
        if (!didAmend) {
            this.internalRegisterJump(jump);
            this.goToNext();
        }
        return;
    }

    public jumpForward(jump: JumpPoint, insert: boolean): NJumpPoint {
        if (!this.node.hasNext()) {
            return null;
        }
        const didAmend = this.amendJump(jump)
        if (this.insertJumpOnForward && insert && !didAmend) {
            this.insertAfterCurrent(jump);
            this.goToNext();
        }
        this.goToNext();
        return this.node.val;
    }

    public jumpBack(curr: JumpPoint, insert: boolean): NJumpPoint {
        // base case: current is root -> create jump point
        if (this.node.isRoot()) {
            this.internalRegisterJump(curr);
            this.goToNext();
            return this.node.val;
        }
        // previous is root: amend insert new jump point before current
        else if (this.node.getPrev().isRoot()) {
            const didAmend = this.amendJump(curr);
            if (!didAmend) {
                this.insertBeforeCurrent(curr);
                this.goToPrevious();
                this.limitSizeAtEnd();
            }
            return this.node.val;
        }
        // on strict equality, move back a jump point
        else if (curr.equalsStrict(this.node.val)) {
            this.goToPrevious();
            return this.node.val;
        }
        // on normal equality, return current jump point location
        else if (curr.equals(this.node.val)) {
            return this.node.val;
        }
        else if (insert) {
            this.internalRegisterJump(curr);
            return this.node.val;
        }
        return this.node.val;
    }

    public getRoot(): JumpPointRoot {
        return this.root;
    }

    public getCurrent(): JumpPointNode {
        return this.node;
    }

    public deleteNode(node: JumpPointNode): void {
        const prev = node.getPrev();
        var next = node.getNext();
        node.delete();
        if (!this.node.valid()) {
            if (!prev.isRoot()) {
                this.node = prev;
            }
            else if (!next.isRoot()) {
                this.node = next;
            }
            else {
                this.node = this.root;
            }
        }
        return;
    }

    private cleanup_backwards(): void {
        if (this.node.isRoot()) {
            return;
        }
        var prev = this.node.getPrev();
        const val = this.node.val!;
        while (!prev.isRoot() && val.equals(prev.val)) {
            const t = prev.getPrev();
            prev.delete();
            this.len -= 1;
            prev = t;
        }
    }

    private cleanup_forwards(): void {
        if (this.node.isRoot()) {
            return;
        }
        var next = this.node.getNext();
        const val = this.node.val!;
        while (!next.isRoot() && val.equals(next.val)) {
            const t = next.getNext();
            next.delete();
            this.len -= 1;
            next = t;
        }
    }
}
